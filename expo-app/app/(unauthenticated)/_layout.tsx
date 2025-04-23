import { RelativePathString, Stack } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function UnauthenticatedLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Redirect to authenticated home if user is logged in
      router.replace("/(authenticated)/home" as unknown as RelativePathString);
    }
  }, [user, loading]);

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
    </Stack>
  );
}
