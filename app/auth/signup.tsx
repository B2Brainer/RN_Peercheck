import SignupScreen from '@/src/features/auth/presentation/screens/SignupScreen';
import { useNavigation } from 'expo-router';

export default function Signup() {
  const navigation = useNavigation();
  return <SignupScreen navigation={navigation} />;
}

