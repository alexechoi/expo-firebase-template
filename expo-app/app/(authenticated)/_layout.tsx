import { Tabs } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect } from "react";
import { useRouter, RelativePathString } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function AuthenticatedLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login if user is not authenticated
      router.replace(
        "/(unauthenticated)/login" as unknown as RelativePathString
      );
    }
  }, [user, loading]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
        tabBarStyle: {
          paddingBottom: 0,
          height: 50,
        },
      }}
    >
      <Tabs.Screen
        name="(tabs)/home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(tabs)/profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(tabs)/settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
