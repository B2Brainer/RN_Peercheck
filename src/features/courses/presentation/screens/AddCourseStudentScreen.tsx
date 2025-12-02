// src/features/courses/presentation/screens/AddCourseStudentScreen.tsx

import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { useCourse } from "../context/CourseContext";

const AddCourseStudentScreen: React.FC = () => {
  const router = useRouter();
  const theme = useTheme();
  const palette = (theme.colors as any).rolePalette;

  const { addStudent } = useCourse() as any;
  const { user } = useAuth();

  const [nrc, setNrc] = useState("");
  const [error, setError] = useState("");
  const nrcRef = useRef<TextInput>(null);

  const validate = () => {
  const e: any = {};

  // Validar NRC
  if (!nrc.trim()) e.nrc = "Por favor ingresa el NRC del curso";
  else if (isNaN(Number(nrc)))
    e.nrc = "El NRC debe ser un número válido";
  else if (nrc.length !== 5)
    e.nrc = "El NRC debe tener 5 dígitos";

  setError(e);
  return Object.keys(e).length === 0;
};

const handleSubmit = async () => {
  if (!validate()) return;

  try {
    await addStudent(user!.email, Number(nrc));
    router.back();
  } catch (err: any) {
    Alert.alert("Error lol", err.message || "Ocurrió un error inesperado");
  }
};

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#FFF" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Inscribirse a Curso</Text>

        <Text style={styles.label}>Ingresa el código NRC del curso</Text>
        <Text style={styles.subLabel}>
          Pide el código NRC a tu profesor para inscribirte en el curso
        </Text>

        {/* Campo NRC */}
        <TextInput
          ref={nrcRef}
          style={[
            styles.input,
            { borderColor: palette.estudianteAccent },
          ]}
          placeholder="Código del Curso (NRC)"
          value={nrc}
          keyboardType="numeric"
          onChangeText={setNrc}
        />

        {/* Botones */}
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.buttonOutline, { borderColor: palette.estudianteAccent }]}
            onPress={() => router.back()}
          >
            <Text
              style={[styles.buttonOutlineText, { color: palette.estudianteAccent }]}
            >
              Cancelar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.buttonFilled, { backgroundColor: palette.estudianteAccent }]}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonFilledText}>Ingresar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

/* ─────────────────────────────────────────────────────────────── */
/* ESTILOS IDENTICOS A FLUTTER                                    */
/* ─────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 60,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000814",
    marginBottom: 20,
  },

  label: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000814",
  },
  subLabel: {
    color: "#5B616E",
    marginBottom: 16,
  },

  card: {
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 12,
    borderColor: "#DDD",
    borderWidth: 1,
    marginBottom: 20,
  },
  cardTitle: {
    fontWeight: "bold",
    color: "#000814",
    marginBottom: 8,
  },
  cardItem: {
    color: "#000814",
  },
  cardHint: {
    color: "#858597",
    fontSize: 12,
    marginTop: 4,
  },

  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    marginBottom: 8,
    color: "#000814",
  },

  error: {
    color: "red",
    marginBottom: 12,
  },

  row: {
    flexDirection: "row",
    marginTop: 26,
  },

  buttonOutline: {
    flex: 1,
    paddingVertical: 16,
    borderWidth: 2,
    borderRadius: 12,
    marginRight: 12,
    alignItems: "center",
  },
  buttonOutlineText: {
    fontSize: 16,
    fontWeight: "600",
  },

  buttonFilled: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonFilledText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
  },
});

export default AddCourseStudentScreen;
