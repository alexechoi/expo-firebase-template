import { useRouter } from "expo-router";

export default function Login() {
  const router = useRouter();

  return (
    <div>
      {/* Update router.replace('/profile') to: */}
      router.replace('/(authenticated)/home');
      {/* Update router.push('/signup') to: */}
      router.push('/(unauthenticated)/auth/signup');
    </div>
  );
} 