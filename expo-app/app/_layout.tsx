import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ title: "Sign Up", headerShown: false }} />
        <Stack.Screen name="profile" options={{ title: "Profile", headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
