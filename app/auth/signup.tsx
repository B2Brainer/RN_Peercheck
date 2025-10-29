import SignupScreen from '@/src/features/auth/presentation/screens/SignupScreen';
import { router } from 'expo-router';

export default function Signup() {
  return <SignupScreen navigation={router} />;
}


