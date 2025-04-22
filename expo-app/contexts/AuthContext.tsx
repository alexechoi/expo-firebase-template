import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  profileImageUrl: string | null;
  createUserDocument: (userData: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    dateOfBirth: string;
    marketingConsent: boolean;
    privacyPolicy: boolean;
  }) => Promise<void>;
  updateLastLogin: () => Promise<void>;
  updateUserDocument: (userData: Partial<{
    firstName: string;
    lastName: string;
    phone: string;
    dateOfBirth: string;
    marketingConsent: boolean;
    privacyPolicy: boolean;
  }>) => Promise<void>;
  uploadProfileImage: (uri: string) => Promise<string>;
  deleteProfileImage: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        await updateLastLogin();
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Profile image effect
  useEffect(() => {
    if (!user) {
      setProfileImageUrl(null);
      return;
    }
    
    const fetchProfileImage = async () => {
      try {
        const imageRef = ref(storage, `users/${user.uid}/profile-image`);
        const url = await getDownloadURL(imageRef);
        setProfileImageUrl(url);
      } catch (error) {
        // Image might not exist yet, which is fine
        console.log('No profile image found');
        setProfileImageUrl(null);
      }
    };
    
    fetchProfileImage();
  }, [user]);

  const updateLastLogin = async () => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    try {
      await setDoc(userRef, {
        lastLogin: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  };

  const createUserDocument = async (userData: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    dateOfBirth: string;
    marketingConsent: boolean;
    privacyPolicy: boolean;
  }) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No authenticated user found');
    }

    const userRef = doc(db, 'users', currentUser.uid);
    const timestamp = serverTimestamp();

    try {
      await setDoc(userRef, {
        uid: currentUser.uid,
        ...userData,
        isActive: true,
        createdAt: timestamp,
        updatedAt: timestamp,
        lastLogin: timestamp,
      });
    } catch (error) {
      console.error('Error creating user document:', error);
      throw error;
    }
  };

  const updateUserDocument = async (userData: Partial<{
    firstName: string;
    lastName: string;
    phone: string;
    dateOfBirth: string;
    marketingConsent: boolean;
    privacyPolicy: boolean;
  }>) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    try {
      await setDoc(userRef, {
        ...userData,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error('Error updating user document:', error);
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const uploadProfileImage = async (uri: string): Promise<string> => {
    if (!user) throw new Error('No authenticated user found');
    
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const imageRef = ref(storage, `users/${user.uid}/profile-image`);
      
      await uploadBytes(imageRef, blob);
      
      const downloadUrl = await getDownloadURL(imageRef);
      
      await setDoc(doc(db, 'users', user.uid), {
        profileImageUrl: downloadUrl,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      
      setProfileImageUrl(downloadUrl);
      
      return downloadUrl;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  };

  const deleteProfileImage = async (): Promise<void> => {
    if (!user) throw new Error('No authenticated user found');
    
    try {
      const imageRef = ref(storage, `users/${user.uid}/profile-image`);
      
      await deleteObject(imageRef);
      
      await setDoc(doc(db, 'users', user.uid), {
        profileImageUrl: null,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      
      setProfileImageUrl(null);
    } catch (error) {
      console.error('Error deleting profile image:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    profileImageUrl,
    createUserDocument,
    updateLastLogin,
    updateUserDocument,
    uploadProfileImage,
    deleteProfileImage,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}