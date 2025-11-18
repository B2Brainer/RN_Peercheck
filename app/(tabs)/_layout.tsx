import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import { MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";

export default function TabLayout() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) router.replace("/auth/login");
  }, [user]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        // Colores iguales a Material You
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,

        // Fondo Blur estilo Flutter
        tabBarBackground: () => (
          <BlurView
            tint="light"
            intensity={70}
            style={StyleSheet.absoluteFill}
          />
        ),

        // Elevación estilo Material 3
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 12,
          shadowColor: "#000",
          shadowOpacity: 0.18,
          shadowOffset: { width: 0, height: -4 },
          shadowRadius: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",

          // ✔ Ícono idéntico a Flutter: Icons.home_filled
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" color={color} size={size + 2} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Perfil",

          // ✔ Equivalente a Icons.person_pin
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person-pin" color={color} size={size + 2} />
          ),
        }}
      />
    </Tabs>
  );
}


