import { RelativePathString, Stack } from "expo-router";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import { SafeAreaView } from "react-native";
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
      router.replace("/(authenticated)/home" as unknown as RelativePathString);
    }
  }, [user, loading]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(authenticated)" />
        <Stack.Screen name="(unauthenticated)" />
      </Stack>
    </SafeAreaView>
  );
}
