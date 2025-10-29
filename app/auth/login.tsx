import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import LoginScreen from "@/src/features/auth/presentation/screens/LoginScreen";
import { useRouter } from "expo-router";
import React from "react";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  // Esta función reemplazará la que antes venía desde props.navigation
  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      console.log("✅ Login correcto, redirigiendo a productos...");
      router.replace("/(tabs)"); // 👈 redirige al layout principal (productos)
    } catch (e) {
      console.error("❌ Error al iniciar sesión:", e);
    }
  };

  return <LoginScreen onLogin={handleLogin} />;
}


