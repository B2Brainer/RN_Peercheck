// src/features/activities/presentation/screens/ResultsScreen.tsx
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

type GroupResult = {
  groupNumber: number;
  average: number;
  students: StudentResult[];
};

type StudentResult = {
  email: string;
  average: number;
  criteriaScores: { [criterio: string]: number };
};

const ResultsScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { isProfesor } = useCourse();
  const { selectedCategory, groups, getGroupsByCategory } = useCategory();
  const {
    activities,
    refreshActivities,
    hasAssessment,
    getActivityAverage,
    getGroupAverage,
    getStudentAverage,
    getStudentDetailedScores,
  } = useActivity();

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activitiesWithAssessment, setActivitiesWithAssessment] = useState<any[]>([]);
  const [groupResults, setGroupResults] = useState<GroupResult[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [overallAverage, setOverallAverage] = useState<number>(0);

  const palette = (theme.colors as any).rolePalette;
  const accent = isProfesor ? palette.profesorAccent : palette.estudianteAccent;
  const cardBg = isProfesor ? palette.profesorCard : palette.estudianteCard;
  const surface = palette.surfaceSoft;

  useEffect(() => {
    loadResults();
  }, [selectedCategory]);

  const loadResults = async () => {
    if (!selectedCategory?.id) return;

    try {
      // Refrescar actividades
      await refreshActivities(selectedCategory.id);
      
      // Filtrar actividades que tienen assessments
      const withAssessments = activities.filter((activity) => 
        hasAssessment(activity.id || "")
      );
      setActivitiesWithAssessment(withAssessments);

      // Obtener grupos de la categoría
      const groupsData = await getGroupsByCategory(selectedCategory.id);

      // Calcular promedio general de todas las actividades
      if (withAssessments.length > 0) {
        const activityAverages = await Promise.all(
          withAssessments.map((activity) => getActivityAverage(activity.id || ""))
        );
        const overall = activityAverages.reduce((a, b) => a + b, 0) / activityAverages.length;
        setOverallAverage(overall);
      }

      // Procesar resultados por grupo
      const groupNumbers = new Set<number>();
      for (const groupArray of groupsData) {
        for (const group of groupArray) {
          groupNumbers.add(group.number);
        }
      }

      const results: GroupResult[] = [];
      
      for (const groupNum of Array.from(groupNumbers).sort((a, b) => a - b)) {
        // Obtener promedio del grupo
        const groupAvg = await getGroupAverage(selectedCategory.id, groupNum);

        // Obtener estudiantes del grupo
        const studentsInGroup: string[] = [];
        for (const groupArray of groupsData) {
          for (const group of groupArray) {
            if (group.number === groupNum) {
              studentsInGroup.push(group.student);
            }
          }
        }

        // Calcular datos de cada estudiante
        const studentResults: StudentResult[] = [];
        for (const studentEmail of studentsInGroup) {
          const studentAvg = await getStudentAverage(studentEmail, selectedCategory.id);
          const criteriaScores = await getStudentDetailedScores(
            studentEmail,
            selectedCategory.id,
            groupNum
          );

          studentResults.push({
            email: studentEmail,
            average: studentAvg,
            criteriaScores,
          });
        }

        // Ordenar estudiantes por promedio (mayor a menor)
        studentResults.sort((a, b) => b.average - a.average);

        results.push({
          groupNumber: groupNum,
          average: groupAvg,
          students: studentResults,
        });
      }

      setGroupResults(results);
    } catch (error) {
      console.error("Error loading results:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadResults();
    setRefreshing(false);
  };

  const toggleGroup = (groupNumber: number) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupNumber)) {
      newExpanded.delete(groupNumber);
    } else {
      newExpanded.add(groupNumber);
    }
    setExpandedGroups(newExpanded);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.categoryName}>{selectedCategory?.name}</Text>
          <Text style={styles.roleText}>
            {isProfesor ? "Profesor" : "Estudiante"}
          </Text>
        </View>
      </View>

      <Text style={styles.title}>Resultados</Text>

      <View style={[styles.contentContainer, { backgroundColor: surface }]}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {activitiesWithAssessment.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="chart-box-outline"
                size={80}
                color="#ccc"
              />
              <Text style={styles.emptyTitle}>No hay resultados disponibles</Text>
              <Text style={styles.emptyText}>
                Los resultados aparecerán cuando el profesor inicie la calificación y los estudiantes completen sus evaluaciones.
              </Text>
            </View>
          ) : (
            <>
              {/* Promedio General */}
              <View style={[styles.overallCard, { backgroundColor: accent }]}>
                <View style={styles.overallHeader}>
                  <MaterialCommunityIcons
                    name="trophy-outline"
                    size={32}
                    color="#FFF"
                  />
                  <View style={styles.overallInfo}>
                    <Text style={styles.overallLabel}>Promedio General</Text>
                    <Text style={styles.overallSubtext}>
                      {activitiesWithAssessment.length} actividad(es)
                    </Text>
                  </View>
                </View>
                <Text style={styles.overallScore}>
                  {overallAverage.toFixed(2)}
                </Text>
              </View>

              {/* Resultados por Grupo */}
              {groupResults.map((groupResult) => {
                const isExpanded = expandedGroups.has(groupResult.groupNumber);
                
                return (
                  <View key={groupResult.groupNumber} style={styles.groupSection}>
                    <TouchableOpacity
                      style={[styles.groupCard, { backgroundColor: cardBg }]}
                      onPress={() => toggleGroup(groupResult.groupNumber)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.groupHeader}>
                        <View style={styles.groupInfo}>
                          <Text style={styles.groupName}>
                            Grupo {groupResult.groupNumber}
                          </Text>
                          <Text style={styles.groupMembersCount}>
                            {groupResult.students.length} estudiante(s)
                          </Text>
                        </View>
                        <View style={styles.groupScoreContainer}>
                          <Text style={styles.groupScore}>
                            {groupResult.average.toFixed(2)}
                          </Text>
                          <MaterialCommunityIcons
                            name={isExpanded ? "chevron-up" : "chevron-down"}
                            size={24}
                            color="#666"
                          />
                        </View>
                      </View>
                    </TouchableOpacity>

                    {/* Estudiantes del grupo */}
                    {isExpanded && (
                      <View style={styles.studentsContainer}>
                        {groupResult.students.map((student, index) => (
                          <View
                            key={student.email}
                            style={[
                              styles.studentCard,
                              { backgroundColor: "#FFFFFF" },
                            ]}
                          >
                            <View style={styles.studentHeader}>
                              <View style={styles.studentInfo}>
                                <View style={styles.studentRank}>
                                  <Text style={styles.rankNumber}>#{index + 1}</Text>
                                </View>
                                <View style={styles.studentDetails}>
                                  <Text style={styles.studentEmail} numberOfLines={1}>
                                    {student.email}
                                  </Text>
                                  <Text style={styles.studentAverage}>
                                    Promedio: {student.average.toFixed(2)}
                                  </Text>
                                </View>
                              </View>
                            </View>

                            {/* Puntajes por criterio */}
                            <View style={styles.criteriaScores}>
                              {Object.keys(student.criteriaScores).length > 0 ? (
                                Object.entries(student.criteriaScores).map(
                                  ([criterio, score]) => (
                                    <View key={criterio} style={styles.criteriaItem}>
                                      <Text style={styles.criteriaName}>
                                        {criterio}
                                      </Text>
                                      <Text style={styles.criteriaScore}>
                                        {score.toFixed(2)}
                                      </Text>
                                    </View>
                                  )
                                )
                              ) : (
                                <Text style={styles.noScoresText}>
                                  Sin evaluaciones aún
                                </Text>
                              )}
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
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
  categoryName: {
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
    paddingVertical: 80,
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
  overallCard: {
    padding: 20,
    borderRadius: 18,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  overallHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  overallInfo: {
    marginLeft: 16,
    flex: 1,
  },
  overallLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  overallSubtext: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 2,
  },
  overallScore: {
    fontSize: 48,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "right",
  },
  groupSection: {
    marginBottom: 16,
  },
  groupCard: {
    padding: 18,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  groupMembersCount: {
    fontSize: 14,
    color: "#666",
  },
  groupScoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  groupScore: {
    fontSize: 28,
    fontWeight: "900",
    color: "#333",
  },
  studentsContainer: {
    marginTop: 12,
    gap: 12,
  },
  studentCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9EAEE",
  },
  studentHeader: {
    marginBottom: 12,
  },
  studentInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  studentRank: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F9FF",
    justifyContent: "center",
    alignItems: "center",
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#026CD2",
  },
  studentDetails: {
    flex: 1,
  },
  studentEmail: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  studentAverage: {
    fontSize: 13,
    color: "#666",
  },
  criteriaScores: {
    gap: 8,
  },
  criteriaItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
  },
  criteriaName: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  criteriaScore: {
    fontSize: 15,
    fontWeight: "700",
    color: "#026CD2",
  },
  noScoresText: {
    fontSize: 13,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 8,
  },
});

export default ResultsScreen;
