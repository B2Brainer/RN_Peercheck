// src/features/activities/presentation/screens/AssessmentDetailScreen.tsx
import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import { useCategory } from "@/src/features/categories/presentation/context/CategoryContext";
import { useCourse } from "@/src/features/courses/presentation/context/CourseContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { useActivity } from "../context/ActivityContext";

const AssessmentDetailScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { isProfesor } = useCourse();
  const { selectedCategory, groups, getGroupsByCategory } = useCategory();
  const {
    selectedActivity,
    assessments,
    getAssessmentsForActivity,
    setSelectedAssessment,
    getEvaluations,
    evaluations,
  } = useActivity();

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [completedAssessments, setCompletedAssessments] = useState<Set<string>>(new Set());
  const [myGroup, setMyGroup] = useState<number | null>(null);
  const [groupMembers, setGroupMembers] = useState<string[]>([]);

  const palette = (theme.colors as any).rolePalette;
  const accent = isProfesor ? palette.profesorAccent : palette.estudianteAccent;
  const cardBg = isProfesor ? palette.profesorCard : palette.estudianteCard;
  const surface = palette.surfaceSoft;

  useEffect(() => {
    if (selectedActivity?.id) {
      getAssessmentsForActivity(selectedActivity.id);
    }
    if (selectedCategory?.id) {
      getGroupsByCategory(selectedCategory.id);
    }
    loadEvaluationStatus();
  }, [selectedActivity, selectedCategory]);

  const loadEvaluationStatus = async () => {
    if (!user?.email || !selectedCategory?.id || isProfesor) return;

    try {
      // Obtener mi grupo
      const groupsData = await getGroupsByCategory(selectedCategory.id);
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

      if (userGroup === null) return;
      setMyGroup(userGroup);

      // Obtener miembros de mi grupo (excluyéndome)
      const members: string[] = [];
      for (const groupArray of groupsData) {
        for (const group of groupArray) {
          if (group.number === userGroup && group.student !== user.email) {
            members.push(group.student);
          }
        }
      }
      setGroupMembers(members);

      // Verificar assessments completados
      const completed = new Set<string>();
      for (const assessment of assessments) {
        if (assessment.id) {
          await getEvaluations({
            assessment: assessment.id,
            evaluator: user.email,
          });

          // Verificar si ya evaluó a todos los miembros
          const evaluatedMembers = evaluations
            .filter((e) => e.assessment === assessment.id && e.evaluator === user.email)
            .map((e) => e.evaluated);

          const allEvaluated = members.every((member) => evaluatedMembers.includes(member));
          if (allEvaluated && members.length > 0) {
            completed.add(assessment.id);
          }
        }
      }
      setCompletedAssessments(completed);
    } catch (error) {
      console.error("Error loading evaluation status:", error);
    }
  };

  const onRefresh = async () => {
    if (!selectedActivity?.id) return;
    setRefreshing(true);
    await getAssessmentsForActivity(selectedActivity.id);
    await loadEvaluationStatus();
    setRefreshing(false);
  };

  const handleAssessmentPress = (assessment: any) => {
    if (isProfesor) return; // Profesores no pueden evaluar
    
    setSelectedAssessment(assessment);
    router.push("/activities/evaluation-form" as any);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.activityName}>{selectedActivity?.name}</Text>
          <Text style={styles.roleText}>
            {isProfesor ? "Profesor" : "Estudiante"}
          </Text>
        </View>
      </View>

      <Text style={styles.title}>Criterios de Evaluación</Text>

      <View style={[styles.contentContainer, { backgroundColor: surface }]}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {assessments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons 
                name="clipboard-alert-outline" 
                size={80} 
                color="#FFA500" 
              />
              <Text style={styles.emptyTitle}>
                Aún no se ha iniciado la calificación
              </Text>
              <Text style={styles.emptyText}>
                El profesor debe iniciar la calificación entre compañeros para que puedas evaluar a tus compañeros de grupo.
              </Text>
            </View>
          ) : (
            <View>
              {/* Lista de criterios (assessments) */}
              {assessments.map((assessment) => {
                const isCompleted = completedAssessments.has(assessment.id || "");
                
                return (
                  <TouchableOpacity
                    key={assessment.id}
                    style={[styles.criteriaCard, { backgroundColor: cardBg }]}
                    onPress={() => handleAssessmentPress(assessment)}
                    activeOpacity={isProfesor ? 1 : 0.7}
                    disabled={isProfesor || isCompleted}
                  >
                    <View style={styles.criteriaHeader}>
                      <View style={styles.criteriaHeaderLeft}>
                        <Text style={styles.criteriaName}>{assessment.name}</Text>
                        <Text style={styles.criteriaInfo}>
                          Puntaje máximo: {assessment.max}
                        </Text>
                        <Text style={styles.criteriaInfo}>
                          {assessment.visibility === "public" ? "📊 Público" : "🔒 Privado"}
                        </Text>
                      </View>
                      
                      <View style={styles.scoreIcon}>
                        <MaterialCommunityIcons
                          name={isCompleted ? "star" : "star-outline"}
                          size={32}
                          color={isCompleted ? "#FFD60A" : accent}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* Información adicional para estudiantes */}
              {!isProfesor && (
                <View style={styles.infoContainer}>
                  <MaterialCommunityIcons 
                    name="information-outline" 
                    size={20} 
                    color="#666" 
                  />
                  <Text style={styles.infoText}>
                    Estos son los criterios con los que evaluarás a tus compañeros de grupo.
                  </Text>
                </View>
              )}
            </View>
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
  roleText: {
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
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginTop: 24,
    marginBottom: 12,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
    textAlign: "center",
  },
  criteriaCard: {
    padding: 20,
    borderRadius: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  criteriaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  criteriaHeaderLeft: {
    flex: 1,
  },
  criteriaName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  criteriaInfo: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  scoreIcon: {
    padding: 8,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F0F9FF",
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  // Modal styles (kept for compatibility but unused)
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 20,
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#E9EAEE",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  visibilityContainer: {
    marginTop: 12,
  },
  visibilityButtons: {
    flexDirection: "row",
    gap: 12,
  },
  visibilityButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#E9EAEE",
  },
  visibilityButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  visibilityButtonTextActive: {
    color: "#FFF",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#E9EAEE",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AssessmentDetailScreen;
