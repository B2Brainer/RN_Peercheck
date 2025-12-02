// src/features/activities/presentation/screens/AddActivityScreen.tsx
import { useCategory } from "@/src/features/categories/presentation/context/CategoryContext";
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
import { useActivity } from "../context/ActivityContext";

const AddActivityScreen: React.FC = () => {
  const router = useRouter();
  const theme = useTheme();
  const palette = (theme.colors as any).rolePalette;

  const { selectedCategory } = useCategory();
  const { addActivity } = useActivity();

  const [name, setName] = useState("");
  const [errors, setErrors] = useState<any>({});

  const validate = () => {
    const e: any = {};

    if (!name.trim()) e.name = "Por favor ingresa el nombre de la actividad";
    else if (name.trim().length < 3)
      e.name = "El nombre debe tener al menos 3 caracteres";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !selectedCategory?.id) return;
    try {
      await addActivity(name.trim(), selectedCategory.id);
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
        <Text style={styles.title}>Crear Nueva Actividad</Text>
        <Text style={styles.subtitle}>
          Agrega una actividad a la categoría {selectedCategory?.name}
        </Text>

        {/* Campo nombre */}
        <TextInput
          style={[
            styles.input,
            { borderColor: palette.profesorAccent },
          ]}
          placeholder="Nombre de la Actividad"
          value={name}
          onChangeText={setName}
        />
        {errors.name && <Text style={styles.error}>{errors.name}</Text>}

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
            <Text style={styles.buttonFilledText}>Crear Actividad</Text>
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

export default AddActivityScreen;
