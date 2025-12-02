import { router } from "expo-router";
import React, { useState } from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import { Button, Checkbox, Text, TextInput } from "react-native-paper";
import { useAuth } from "../context/authContext";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await login(email, password);
      router.replace("/(tabs)");
    } catch (err) {
      console.error("Login failed", err);
    } finally {
      setLoading(false);
    }
  };

  const screenHeight = Dimensions.get("window").height;
  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={[styles.topContainer, { height: screenHeight * 0.35 }]}>
        <Image
          source={require("../../../../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Formulario */}
      <View style={styles.formContainer}>
        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          mode="outlined"
          placeholder="ejemplo@correo.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          outlineColor="#E0E0E0"
          activeOutlineColor="#1976D2"
          style={styles.input}
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          mode="outlined"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          outlineColor="#E0E0E0"
          activeOutlineColor="#1976D2"
          style={styles.input}
        />

        <View style={styles.rememberContainer}>
          <Checkbox
            status={remember ? "checked" : "unchecked"}
            onPress={() => setRemember(!remember)}
            color="#1976D2"
          />
          <Text style={styles.rememberText}>Recuérdame</Text>
        </View>

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          style={styles.loginButton}
          contentStyle={{ paddingVertical: 6 }}
        >
          Iniciar sesión
        </Button>

        <Text style={styles.registerText}>
          ¿No tienes una cuenta?{" "}
          <Text
            style={styles.registerLink}
            onPress={() => router.push("/auth/signup")}
          >
            Regístrate
          </Text>
        </Text>
      </View>
    </View>
  );
}

// 🎨 Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0066CC",
    justifyContent: "center",
    alignItems: "center",
  },
  topContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: "80%",
    height: "80%",
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 8,
  },
  formContainer: {
    width: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 25,
  },
  label: {
    color: "#444",
    fontWeight: "600",
    marginBottom: 4,
    marginLeft: 2,
  },
  input: {
    marginBottom: 15,
    backgroundColor: "#F9F9F9",
  },
  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  rememberText: {
    color: "#555",
  },
  loginButton: {
    backgroundColor: "#0066CC",
    borderRadius: 10,
    marginBottom: 10,
  },
  registerText: {
    textAlign: "center",
    color: "#666",
    marginTop: 5,
  },
  registerLink: {
    color: "#1976D2",
    fontWeight: "bold",
  },
});
