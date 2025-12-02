import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import { Redirect } from "expo-router";

export default function Index() {
  const { isLoggedIn } = useAuth();

  // Si el usuario está logueado, redirige a la sección de tabs (productos)
  if (isLoggedIn) {
    return <Redirect href="/(tabs)" />;
  }

  // Si no, va al login
  return <Redirect href="/auth/login" />;
}








