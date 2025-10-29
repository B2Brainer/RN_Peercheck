import LoginScreen from '@/src/features/auth/presentation/screens/LoginScreen';
import { useNavigation } from 'expo-router';

export default function Login() {
  const navigation = useNavigation();
  return <LoginScreen navigation={navigation} />;
}

