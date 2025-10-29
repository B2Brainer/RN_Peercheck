import { useState } from "react";
import { View, Image, StyleSheet } from "react-native";
import { Button, Text, TextInput, Checkbox } from "react-native-paper";
import { useAuth } from "../context/authContext";
import { router } from "expo-router";

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
    } catch (err) {
      console.error("Error al iniciar sesión", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../../../../assets/images/logo.png")} // reemplázalo por tu logo
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>
          <Text style={{ color: "#FFD600" }}>Peer</Text>
          <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>Check</Text>
        </Text>
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
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
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
