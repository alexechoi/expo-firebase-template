import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../../../lib/firebase";
import { useAuth } from "../../../contexts/AuthContext";
import { ResponseType, makeRedirectUri } from "expo-auth-session";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ensures browser auth completion happens correctly
WebBrowser.maybeCompleteAuthSession();

export default function Signup() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
  });
  const [error, setError] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [privacyPolicy, setPrivacyPolicy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { createUserDocument } = useAuth();
  const firebaseAuth = getAuth();

  console.log(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);
  console.log(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID);
  console.log(process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID);

  // Configure Google auth request with web-client approach
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, // Web client ID for Expo Go
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    responseType: ResponseType.IdToken,
    scopes: ["profile", "email"],
    redirectUri: makeRedirectUri({
      scheme: process.env.EXPO_SCHEME || 'com.yourapp',
      path: 'auth/signup',
    }),
  });

  // Handle Google sign-in response
  useEffect(() => {
    const handleGoogleResponse = async () => {
      try {
        if (response?.type === "success" && response.authentication?.idToken) {
          setIsLoading(true);
          
          // Store the auth token in AsyncStorage for persistence
          await AsyncStorage.setItem('google_auth_token', response.authentication.idToken);
          
          // Create Firebase credential from Google token
          const { idToken } = response.authentication;
          const credential = GoogleAuthProvider.credential(idToken);
          
          // Sign in to Firebase with the credential
          const result = await signInWithCredential(firebaseAuth, credential);
          const { user } = result;
          
          // Create or update user document in Firestore
          await createUserDocument({
            email: user.email || "",
            firstName: user.displayName?.split(" ")[0] || "",
            lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
            phone: user.phoneNumber || "",
            dateOfBirth: "",
            marketingConsent: false,
            privacyPolicy: true,
          });
          
          router.replace("/profile");
        } else if (response?.type === "error") {
          setError("Google sign-in failed. Please try again.");
        }
      } catch (err: any) {
        console.error("Firebase Google sign-in error:", err);
        setError(err.message || "Failed to sign in with Google");
      } finally {
        setIsLoading(false);
      }
    };

    handleGoogleResponse();
  }, [response]);

  const handleSignup = async () => {
    try {
      setIsLoading(true);
      
      if (!privacyPolicy) {
        setError("You must accept the privacy policy");
        setIsLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await createUserDocument({
        ...formData,
        marketingConsent,
        privacyPolicy,
      });

      router.replace("/profile");
    } catch (error: any) {
      console.error("Email signup error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setError("");
      
      // Check if we have an existing Google auth token
      const existingToken = await AsyncStorage.getItem('google_auth_token');
      if (existingToken) {
        try {
          // Try to use the existing token
          const credential = GoogleAuthProvider.credential(existingToken);
          await signInWithCredential(firebaseAuth, credential);
          router.replace("/profile");
          return;
        } catch (tokenError) {
          // Token expired or invalid, clear it and continue with new auth
          await AsyncStorage.removeItem('google_auth_token');
        }
      }
      
      // Start Google auth flow
      await promptAsync();
    } catch (err: any) {
      console.error("Error initiating Google sign-in:", err);
      setError(err.message || "Failed to start Google sign-in");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      {!!error && <Text style={styles.error}>{error}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={formData.password}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={formData.firstName}
        onChangeText={(text) => setFormData({ ...formData, firstName: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={formData.lastName}
        onChangeText={(text) => setFormData({ ...formData, lastName: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone"
        value={formData.phone}
        onChangeText={(text) => setFormData({ ...formData, phone: text })}
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Date of Birth (YYYY-MM-DD)"
        value={formData.dateOfBirth}
        onChangeText={(text) => setFormData({ ...formData, dateOfBirth: text })}
      />

      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => setMarketingConsent(!marketingConsent)}
      >
        <Text>
          {marketingConsent ? "☑" : "□"} I agree to receive marketing
          communications
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => setPrivacyPolicy(!privacyPolicy)}
      >
        <Text>{privacyPolicy ? "☑" : "□"} I accept the privacy policy</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleSignup}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Signing Up..." : "Sign Up"}
        </Text>
      </TouchableOpacity>

      <View style={styles.separator}>
        <View style={styles.line} />
        <Text style={styles.separatorText}>OR</Text>
        <View style={styles.line} />
      </View>

      {/* Google Sign-In Button */}
      <TouchableOpacity
        style={[styles.button, styles.googleButton]}
        disabled={isLoading}
        onPress={handleGoogleSignup}
      >
        <View style={styles.googleButtonContent}>
          <Text style={styles.buttonText}>Sign up with Google</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  googleButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  googleButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  separator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },
  separatorText: {
    paddingHorizontal: 10,
    color: "#666",
  },
  link: {
    color: "#007AFF",
    textAlign: "center",
    marginTop: 10,
  },
  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
});
