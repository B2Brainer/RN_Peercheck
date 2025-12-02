// src/features/categories/presentation/screens/AddCategoryScreen.tsx
import { useCourse } from "@/src/features/courses/presentation/context/CourseContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
import { useCategory } from "../context/CategoryContext";

const AddCategoryScreen: React.FC = () => {
  const router = useRouter();
  const theme = useTheme();
  const palette = (theme.colors as any).rolePalette;

  const { course, students } = useCourse();
  const { addCategory } = useCategory();

  const [name, setName] = useState("");
  const [maxMembers, setMaxMembers] = useState("");
  const [isRandom, setIsRandom] = useState(true);
  const [errors, setErrors] = useState<any>({});

  const validate = () => {
    const e: any = {};

    if (!name.trim()) e.name = "Por favor ingresa el nombre de la categoría";
    else if (name.trim().length < 3)
      e.name = "El nombre debe tener al menos 3 caracteres";

    if (!maxMembers.trim()) e.maxMembers = "Por favor ingresa el número máximo de miembros";
    else if (isNaN(Number(maxMembers)))
      e.maxMembers = "Debe ser un número válido";
    else if (Number(maxMembers) < 1)
      e.maxMembers = "Debe ser al menos 1";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !course) return;
    try {
      await addCategory(
        name.trim(),
        isRandom,
        course,
        students,
        Number(maxMembers)
      );
      router.back();
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
        <Text style={styles.title}>Crear Nueva Categoría</Text>
        <Text style={styles.subtitle}>
          Organiza a los estudiantes en grupos
        </Text>

        {/* Campo nombre */}
        <TextInput
          style={[
            styles.input,
            { borderColor: palette.profesorAccent },
          ]}
          placeholder="Nombre de la Categoría"
          value={name}
          onChangeText={setName}
        />
        {errors.name && <Text style={styles.error}>{errors.name}</Text>}

        {/* Número máximo de miembros */}
        <TextInput
          style={[
            styles.input,
            { borderColor: palette.profesorAccent },
          ]}
          placeholder="Máximo de Miembros por Grupo"
          keyboardType="numeric"
          value={maxMembers}
          onChangeText={setMaxMembers}
        />
        {errors.maxMembers && <Text style={styles.error}>{errors.maxMembers}</Text>}

        {/* Tipo de agrupación */}
        <Text style={styles.label}>Método de Agrupación</Text>
        <View style={styles.groupTypeContainer}>
          <TouchableOpacity
            style={[
              styles.groupTypeButton,
              isRandom && { backgroundColor: palette.profesorAccent },
            ]}
            onPress={() => setIsRandom(true)}
          >
            <Text
              style={[
                styles.groupTypeText,
                isRandom && styles.groupTypeTextSelected,
              ]}
            >
              🎲 Aleatorio
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.groupTypeButton,
              !isRandom && { backgroundColor: palette.profesorAccent },
            ]}
            onPress={() => setIsRandom(false)}
          >
            <Text
              style={[
                styles.groupTypeText,
                !isRandom && styles.groupTypeTextSelected,
              ]}
            >
              ✋ Auto-asignado
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.description}>
          {isRandom
            ? "Los estudiantes se distribuirán automáticamente en grupos."
            : "Los estudiantes podrán elegir su propio grupo."}
        </Text>

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
            <Text style={styles.buttonFilledText}>Crear Categoría</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

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
    fontSize: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 8,
  },
  groupTypeContainer: {
    flexDirection: "row",
    backgroundColor: "#E9EAEE",
    padding: 4,
    borderRadius: 30,
    marginBottom: 12,
  },
  groupTypeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 26,
    alignItems: "center",
  },
  groupTypeText: {
    color: "#5B616E",
    fontWeight: "600",
  },
  groupTypeTextSelected: {
    color: "#FFFFFF",
  },
  description: {
    color: "#666",
    fontSize: 13,
    marginBottom: 24,
    fontStyle: "italic",
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

export default AddCategoryScreen;
