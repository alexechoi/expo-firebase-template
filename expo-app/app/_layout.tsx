import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import { SafeAreaView } from 'react-native';
import { useRouter } from "expo-router";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
}

function Main() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Redirect to Profile if user is logged in
      router.replace('/profile');
    }
  }, [user, loading]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ title: "Sign Up", headerShown: false }} />
        <Stack.Screen name="profile" options={{ title: "Profile", headerShown: false }} />
      </Stack>
    </SafeAreaView>
  );
}
