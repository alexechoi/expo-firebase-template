import { useRouter } from "expo-router";

const Signup = () => {
  const router = useRouter();

  return (
    <div>
      {/* ... existing code ... */}
      {/* Update router.replace('/profile') to: */}
      {router.replace('/(authenticated)/home')}
    </div>
  );
};

export default Signup; 