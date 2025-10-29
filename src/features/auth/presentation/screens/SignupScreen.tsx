import { useState } from "react";
import { View, Image, StyleSheet } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { useAuth } from "../context/authContext";
import { router } from "expo-router";

export default function SignupScreen() {
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    try {
      setLoading(true);
      await signup(email, password);
      router.replace("/"); // redirige al home
    } catch (err) {
      console.error("Error al registrarse", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../../../../assets/images/logo.png")} // tu logo
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

        <Text style={styles.label}>Confirmar contraseña</Text>
        <TextInput
          mode="outlined"
          placeholder="Vuelve a escribir tu contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          outlineColor="#E0E0E0"
          activeOutlineColor="#1976D2"
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleSignup}
          loading={loading}
          disabled={loading}
          style={styles.signupButton}
          contentStyle={{ paddingVertical: 6 }}
        >
          Crear cuenta
        </Button>

        <Text style={styles.loginText}>
          ¿Ya tienes una cuenta?{" "}
          <Text
            style={styles.loginLink}
            onPress={() => router.back()}
          >
            Inicia sesión
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
  signupButton: {
    backgroundColor: "#0066CC",
    borderRadius: 10,
    marginTop: 10,
  },
  loginText: {
    textAlign: "center",
    color: "#666",
    marginTop: 15,
  },
  loginLink: {
    color: "#1976D2",
    fontWeight: "bold",
  },
});
