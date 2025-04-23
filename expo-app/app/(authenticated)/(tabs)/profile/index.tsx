import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../../../../contexts/AuthContext";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import logger from "@/utils/logger";
import React from "react";

export default function Profile() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setUserData(userDoc.data() as any);
        } else {
          logger.error("No such document!");
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/");
    } catch (error) {
      logger.error("Error signing out:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : userData ? (
        <>
          <Text style={styles.text}>
            Name: {userData.firstName} {userData.lastName}
          </Text>
          <Text style={styles.text}>Email: {user?.email}</Text>
        </>
      ) : (
        <Text style={styles.text}>No user data available.</Text>
      )}
      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#FF3B30",
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});
