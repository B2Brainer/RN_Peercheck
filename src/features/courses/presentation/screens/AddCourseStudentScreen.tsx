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

  const { enrollUser, findCourseByNrc } = useCourse() as any;
  const { user } = useAuth();

  const [nrc, setNrc] = useState("");
  const [error, setError] = useState("");
  const nrcRef = useRef<TextInput>(null);

  const handleSubmit = async () => {
    setError("");

    // Validaciones idénticas a Flutter
    if (nrc.trim() === "") {
      setError("Por favor ingresa el código del curso");
      return;
    }

    if (isNaN(Number(nrc))) {
      setError("El código debe ser un número");
      return;
    }

    const nrcNumber = Number(nrc);

    // Buscar curso por NRC
    const course = await findCourseByNrc(nrcNumber);

    if (!course) {
      Alert.alert(
        "Error",
        `No se encontró un curso con el NRC: ${nrcNumber}`
      );
      return;
    }

    // Ya inscrito
    if (course.enrolledUsers.includes(user!.email)) {
      Alert.alert(
        "Ya Inscrito",
        `Ya estás inscrito en este curso: ${course.name}`
      );
      return;
    }

    // Cupo lleno
    if (course.enrolledUsers.length >= course.maxStudents) {
      Alert.alert(
        "Cupo Lleno",
        `El curso ${course.name} no tiene cupos disponibles`
      );
      return;
    }

    // Inscribir
    try {
      await enrollUser(course.id);
      router.back();

      Alert.alert(
        "Inscripción Exitosa",
        `Te has inscrito al curso: ${course.name}`
      );
    } catch (err: any) {
      Alert.alert("Error", err.message || "Ocurrió un error");
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

        {/* Card con NRC de ejemplo */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cursos disponibles para prueba:</Text>
          <Text style={styles.cardItem}>• Programación Avanzada - NRC: 12345</Text>
          <Text style={styles.cardItem}>• Diseño de Interfaces - NRC: 67890</Text>
          <Text style={styles.cardHint}>Usa estos NRC para probar la inscripción</Text>
        </View>

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

        {error ? <Text style={styles.error}>{error}</Text> : null}

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
