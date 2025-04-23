import { RelativePathString, Stack } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function AuthenticatedLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login if user is not authenticated
      router.replace('/(unauthenticated)/login' as unknown as RelativePathString);
    }
  }, [user, loading]);

  return (
    <Stack>
      <Stack.Screen name="home" options={{ title: "Home", headerShown: false }} />
      <Stack.Screen name="profile" options={{ title: "Profile", headerShown: false }} />
    </Stack>
  );
} 