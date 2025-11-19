// src/features/courses/presentation/screens/AddCourseTeacherScreen.tsx

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

const AddCourseTeacherScreen: React.FC = () => {
  const router = useRouter();
  const theme = useTheme();
  const palette = (theme.colors as any).rolePalette;

  const { addCourse } = useCourse();

  const [name, setName] = useState("");
  const [nrc, setNrc] = useState("");
  const [maxStudents, setMaxStudents] = useState("30");

  const [errors, setErrors] = useState<any>({});

  const nameRef = useRef<TextInput>(null);
  const nrcRef = useRef<TextInput>(null);
  const maxRef = useRef<TextInput>(null);

  const validate = () => {
    const e: any = {};

    if (!name.trim()) e.name = "Por favor ingresa el nombre del curso";
    else if (name.trim().length < 3)
      e.name = "El nombre debe tener al menos 3 caracteres";

    if (!nrc.trim()) e.nrc = "Por favor ingresa el NRC del curso";
    else if (isNaN(Number(nrc)))
      e.nrc = "El NRC debe ser un número válido";
    else if (nrc.length !== 5)
      e.nrc = "El NRC debe tener 5 dígitos";

    if (!maxStudents.trim())
      e.max = "Por favor ingresa el límite de estudiantes";
    else if (isNaN(Number(maxStudents)))
      e.max = "Debe ser un número válido";
    else {
      const m = Number(maxStudents);
      if (m < 1) e.max = "Debe haber al menos 1 estudiante";
      if (m > 100) e.max = "Máximo 100 estudiantes por curso";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await addCourse(
        name.trim(),
        Number(nrc),
        "General", // Categoría por defecto
        Number(maxStudents)
      );

      router.back();

      Alert.alert(
        "Curso Creado",
        `El curso '${name}' ha sido creado exitosamente`
      );
    } catch (err: any) {
      Alert.alert("Error", err.message || "Ocurrió un error inesperado");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#FFF" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Crear Nuevo Curso</Text>
        <Text style={styles.subtitle}>
          Completa la información básica del curso
        </Text>

        {/* Campo nombre */}
        <TextInput
          ref={nameRef}
          style={[
            styles.input,
            { borderColor: palette.profesorAccent },
          ]}
          placeholder="Nombre del Curso"
          value={name}
          onChangeText={setName}
        />
        {errors.name && <Text style={styles.error}>{errors.name}</Text>}

        {/* NRC */}
        <TextInput
          ref={nrcRef}
          style={[
            styles.input,
            { borderColor: palette.profesorAccent },
          ]}
          placeholder="NRC del Curso"
          keyboardType="numeric"
          value={nrc}
          onChangeText={setNrc}
        />
        {errors.nrc && <Text style={styles.error}>{errors.nrc}</Text>}

        {/* Máx estudiantes */}
        <TextInput
          ref={maxRef}
          style={[
            styles.input,
            { borderColor: palette.profesorAccent },
          ]}
          placeholder="Límite de Estudiantes"
          keyboardType="numeric"
          value={maxStudents}
          onChangeText={setMaxStudents}
        />
        {errors.max && <Text style={styles.error}>{errors.max}</Text>}

        {/* Botones */}
        <View style={styles.row}>
          <TouchableOpacity
            style={[
              styles.buttonOutline,
              { borderColor: palette.profesorAccent },
            ]}
            onPress={() => router.back()}
          >
            <Text
              style={[
                styles.buttonOutlineText,
                { color: palette.profesorAccent },
              ]}
            >
              Cancelar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.buttonFilled,
              { backgroundColor: palette.profesorAccent },
            ]}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonFilledText}>Crear Curso</Text>
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
    fontSize: 20,
    fontWeight: "700",
    color: "#000814",
    marginBottom: 8,
  },
  subtitle: {
    color: "#5B616E",
    marginBottom: 24,
    fontSize: 14,
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
    marginBottom: 16,
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

export default AddCourseTeacherScreen;

