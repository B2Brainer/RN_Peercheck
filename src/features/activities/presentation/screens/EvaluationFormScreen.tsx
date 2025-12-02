// src/features/activities/presentation/screens/EvaluationFormScreen.tsx
import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import { useCategory } from "@/src/features/categories/presentation/context/CategoryContext";
import { useCourse } from "@/src/features/courses/presentation/context/CourseContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { useActivity } from "../context/ActivityContext";

const EvaluationFormScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { isProfesor } = useCourse();
  const { selectedCategory, groups, getGroupsByCategory } = useCategory();
  const {
    selectedActivity,
    selectedAssessment,
    addEvaluation,
    getEvaluations,
    evaluations,
  } = useActivity();

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [scores, setScores] = useState<{ [email: string]: string }>({});
  const [myGroup, setMyGroup] = useState<number | null>(null);
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const [alreadyEvaluated, setAlreadyEvaluated] = useState<Set<string>>(new Set());

  const palette = (theme.colors as any).rolePalette;
  const accent = palette.estudianteAccent;
  const cardBg = palette.estudianteCard;
  const surface = palette.surfaceSoft;

  useEffect(() => {
    loadGroupData();
  }, [selectedCategory, user, selectedAssessment]);

  const loadGroupData = async () => {
    if (!selectedCategory?.id || !user?.email || !selectedAssessment?.id) return;

    try {
      // Obtener grupos de la categoría
      const groupsData = await getGroupsByCategory(selectedCategory.id);
      
      // Encontrar mi grupo
      let userGroup: number | null = null;
      for (const groupArray of groupsData) {
        for (const group of groupArray) {
          if (group.student === user.email) {
            userGroup = group.number;
            break;
          }
        }
        if (userGroup !== null) break;
      }

      if (userGroup === null) {
        Alert.alert("Error", "No estás asignado a ningún grupo");
        router.back();
        return;
      }

      setMyGroup(userGroup);

      // Obtener miembros de mi grupo (excluyéndome a mí)
      const members: string[] = [];
      for (const groupArray of groupsData) {
        for (const group of groupArray) {
          if (group.number === userGroup && group.student !== user.email) {
            members.push(group.student);
          }
        }
      }

      setGroupMembers(members);

      // Obtener evaluaciones ya realizadas para este assessment
      await getEvaluations({
        assessment: selectedAssessment.id,
        evaluator: user.email,
      });

      // Marcar estudiantes ya evaluados
      const evaluated = new Set<string>();
      evaluations.forEach((evaluation) => {
        if (evaluation.evaluator === user.email && evaluation.assessment === selectedAssessment.id) {
          evaluated.add(evaluation.evaluated);
        }
      });
      setAlreadyEvaluated(evaluated);

    } catch (error) {
      console.error("Error loading group data:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGroupData();
    setRefreshing(false);
  };

  const handleScoreChange = (email: string, value: string) => {
    setScores((prev) => ({ ...prev, [email]: value }));
  };

  const handleSubmit = async () => {
    if (!user?.email || !selectedAssessment?.id || !selectedCategory?.id || myGroup === null) {
      Alert.alert("Error", "Faltan datos necesarios para guardar");
      return;
    }

    // Validar que todos los miembros tengan puntaje
    const missingScores = groupMembers.filter(
      (member) => !alreadyEvaluated.has(member) && (!scores[member] || scores[member].trim() === "")
    );

    if (missingScores.length > 0) {
      Alert.alert(
        "Campos incompletos",
        "Por favor asigna un puntaje a todos tus compañeros de grupo"
      );
      return;
    }

    try {
      // Guardar cada evaluación
      for (const member of groupMembers) {
        if (!alreadyEvaluated.has(member)) {
          const score = parseFloat(scores[member]);
          
          if (isNaN(score) || score < 0 || score > selectedAssessment.max) {
            Alert.alert(
              "Puntaje inválido",
              `El puntaje para ${member} debe estar entre 0 y ${selectedAssessment.max}`
            );
            return;
          }

          await addEvaluation(
            selectedAssessment.id,
            user.email,
            member,
            myGroup,
            selectedCategory.id,
            score
          );
        }
      }

      Alert.alert("Éxito", "Evaluaciones guardadas correctamente", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudieron guardar las evaluaciones");
    }
  };

  const allEvaluated = groupMembers.every((member) => alreadyEvaluated.has(member));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.activityName}>{selectedActivity?.name}</Text>
          <Text style={styles.assessmentName}>{selectedAssessment?.name}</Text>
        </View>
      </View>

      <Text style={styles.title}>Evaluar Compañeros</Text>

      <View style={[styles.contentContainer, { backgroundColor: surface }]}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {allEvaluated ? (
            <View style={styles.completedContainer}>
              <MaterialCommunityIcons
                name="check-circle"
                size={80}
                color="#059669"
              />
              <Text style={styles.completedTitle}>
                Evaluación completada
              </Text>
              <Text style={styles.completedText}>
                Ya has evaluado a todos tus compañeros de grupo para este criterio.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.infoBox}>
                <MaterialCommunityIcons
                  name="information-outline"
                  size={20}
                  color="#666"
                />
                <Text style={styles.infoText}>
                  Puntaje máximo: {selectedAssessment?.max}
                </Text>
              </View>

              {groupMembers.map((member) => (
                <View
                  key={member}
                  style={[
                    styles.memberCard,
                    { backgroundColor: cardBg },
                    alreadyEvaluated.has(member) && styles.evaluatedCard,
                  ]}
                >
                  <View style={styles.memberHeader}>
                    <MaterialCommunityIcons
                      name="account-circle"
                      size={24}
                      color={accent}
                    />
                    <Text style={styles.memberEmail}>{member}</Text>
                  </View>

                  {alreadyEvaluated.has(member) ? (
                    <View style={styles.evaluatedBadge}>
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={18}
                        color="#059669"
                      />
                      <Text style={styles.evaluatedText}>Ya evaluado</Text>
                    </View>
                  ) : (
                    <View style={styles.scoreInput}>
                      <Text style={styles.scoreLabel}>Puntaje:</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="0"
                        keyboardType="numeric"
                        value={scores[member] || ""}
                        onChangeText={(value) => handleScoreChange(member, value)}
                        maxLength={3}
                      />
                      <Text style={styles.maxScore}>/ {selectedAssessment?.max}</Text>
                    </View>
                  )}
                </View>
              ))}

              {groupMembers.filter((m) => !alreadyEvaluated.has(m)).length > 0 && (
                <TouchableOpacity
                  style={[styles.submitButton, { backgroundColor: accent }]}
                  onPress={handleSubmit}
                >
                  <Text style={styles.submitButtonText}>Guardar Evaluaciones</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

/* ─────────────────────────────────────────────────────────────── */
/* STYLES                                                         */
/* ─────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerContent: {
    marginLeft: 16,
  },
  activityName: {
    fontSize: 20,
    fontWeight: "700",
  },
  assessmentName: {
    fontSize: 14,
    color: "#666",
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
    marginVertical: 12,
  },
  contentContainer: {
    flex: 1,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    marginTop: 14,
  },
  scrollView: {
    padding: 20,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F9FF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  memberCard: {
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  evaluatedCard: {
    opacity: 0.6,
  },
  memberHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  memberEmail: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  scoreInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  scoreLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  input: {
    borderWidth: 2,
    borderColor: "#E9EAEE",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: "600",
    minWidth: 80,
    textAlign: "center",
  },
  maxScore: {
    fontSize: 15,
    color: "#666",
  },
  evaluatedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  evaluatedText: {
    fontSize: 14,
    color: "#059669",
    fontWeight: "600",
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  completedContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 30,
  },
  completedTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#059669",
    marginTop: 24,
    marginBottom: 12,
    textAlign: "center",
  },
  completedText: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
    textAlign: "center",
  },
});

export default EvaluationFormScreen;
