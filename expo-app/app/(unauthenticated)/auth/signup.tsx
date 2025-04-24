import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { auth } from "../../../lib/firebase";
import { useAuth } from "../../../contexts/AuthContext";
import { ResponseType } from "expo-auth-session";

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

  const router = useRouter();
  const { createUserDocument } = useAuth();
  const firebaseAuth = getAuth();

  // Configure Google auth request
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_GOOGLE_ANDROID_CLIENT_ID,
    responseType: ResponseType.IdToken,
    scopes: ["profile", "email"],
  });

  // Handle Google sign-in response
  useEffect(() => {
    if (response?.type === "success" && response.authentication?.idToken) {
      const { idToken } = response.authentication;
      const credential = GoogleAuthProvider.credential(idToken);
      signInWithCredential(firebaseAuth, credential)
        .then(async ({ user }) => {
          // Create Firestore document for new Google user if not exists
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
        })
        .catch((err) => console.error("Firebase signIn error", err));
    }
  }, [response]);

  const handleSignup = async () => {
    try {
      if (!privacyPolicy) {
        setError("You must accept the privacy policy");
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
      setError(error.message);
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

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Google Sign-In Button */}
      <TouchableOpacity
        style={[styles.button, styles.googleButton]}
        disabled={!request}
        onPress={() => promptAsync()}
      >
        <Text style={styles.buttonText}>Sign in with Google</Text>
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
    backgroundColor: "#DB4437",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  link: {
    color: "#007AFF",
    textAlign: "center",
  },
  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
});
