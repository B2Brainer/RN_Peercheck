import { router } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet, View
} from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { useAuth } from "../context/authContext";

export default function SignupScreen() {
  const { signup, login } = useAuth();
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
      await login(email, password);
      router.replace("/(tabs)");
    } catch (err) {
      console.error("Signup failed", err);
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
