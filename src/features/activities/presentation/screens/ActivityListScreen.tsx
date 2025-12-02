// src/features/activities/presentation/screens/ActivityListScreen.tsx
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
import { Activity } from "../../domain/entities/activity";
import { useActivity } from "../context/ActivityContext";

const ActivityListScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { isProfesor } = useCourse();
  const { selectedCategory, isStudentInGroup } = useCategory();
  const { user } = useAuth();
  const {
    activities,
    refreshActivities,
    deleteActivity,
    setSelectedActivity,
    hasAssessment,
    initializeAssessments,
  } = useActivity();

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [studentInGroup, setStudentInGroup] = useState<boolean>(true); // true by default for professors

  const palette = (theme.colors as any).rolePalette;
  const accent = isProfesor ? palette.profesorAccent : palette.estudianteAccent;
  const cardBg = isProfesor ? palette.profesorCard : palette.estudianteCard;
  const surface = palette.surfaceSoft;

  useEffect(() => {
    if (selectedCategory?.id) {
      refreshActivities(selectedCategory.id);
    }
  }, [selectedCategory]);

  // Verificar si el estudiante está en un grupo
  useEffect(() => {
    const checkStudentGroup = async () => {
      if (!isProfesor && selectedCategory?.id && user?.email) {
        const inGroup = await isStudentInGroup(selectedCategory.id, user.email);
        setStudentInGroup(inGroup);
      }
    };
    checkStudentGroup();
  }, [selectedCategory, isProfesor, user]);

  const onRefresh = async () => {
    if (!selectedCategory?.id) return;
    setRefreshing(true);
    await refreshActivities(selectedCategory.id);
    setRefreshing(false);
  };

  const handleDeleteActivity = async (activity: Activity) => {
    if (!selectedCategory?.id) return;
    try {
      const activityName = activity.id!.split('-')[0];
      await deleteActivity(activityName, selectedCategory.id);
    } catch (error) {
      console.error("Error deleting activity:", error);
    }
  };

  const handleActivityPress = (activity: Activity) => {
    // Solo los estudiantes pueden ver los assessments (criterios)
    if (!isProfesor) {
      setSelectedActivity(activity);
      router.push("/activities/assessment-detail" as any);
    }
  };

  const handleInitializeAssessments = async (activity: Activity) => {
    if (!activity.id) return;
    try {
      await initializeAssessments(activity.id);
    } catch (error) {
      console.error("Error initializing assessments:", error);
    }
  };

  const handleAddActivity = () => {
    router.push("/activities/add-activity" as any);
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

      <Text style={styles.title}>Actividades</Text>

      <View style={[styles.activitiesContainer, { backgroundColor: surface }]}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Mensaje para estudiantes sin grupo */}
          {!isProfesor && !studentInGroup ? (
            <View style={styles.warningContainer}>
              <MaterialCommunityIcons 
                name="account-group-outline" 
                size={64} 
                color="#FFA500" 
              />
              <Text style={styles.warningTitle}>No estás en un grupo</Text>
              <Text style={styles.warningText}>
                Debes unirte a un grupo para poder ver y participar en las actividades.
              </Text>
              <Text style={styles.warningSubtext}>
                Las evaluaciones son entre compañeros de grupo.
              </Text>
              <TouchableOpacity 
                style={[styles.goToGroupButton, { backgroundColor: accent }]}
                onPress={() => router.back()}
              >
                <Text style={styles.goToGroupButtonText}>Ir a Grupos</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {activities.length === 0 ? (
                <Text style={styles.emptyText}>No hay actividades creadas aún</Text>
              ) : (
                activities.map((activity) => (
                  <View key={activity.id} style={styles.activityItem}>
                    <ActivityCard
                      activity={activity}
                      bg={cardBg}
                      accent={accent}
                      isProfesor={isProfesor}
                      hasAssessment={hasAssessment(activity.id || "")}
                      onPress={() => handleActivityPress(activity)}
                      onDelete={() => handleDeleteActivity(activity)}
                      onInitializeAssessments={() => handleInitializeAssessments(activity)}
                    />
                  </View>
                ))
              )}

              {/* Add card - solo para profesores */}
              {isProfesor && (
                <AddBigCard accentBg={cardBg} onAdd={handleAddActivity} />
              )}
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

/* ─────────────────────────────────────────────────────────────── */
/* CARD DE ACTIVIDAD                                              */
/* ─────────────────────────────────────────────────────────────── */
const ActivityCard = ({
  activity,
  bg,
  accent,
  isProfesor,
  hasAssessment,
  onPress,
  onDelete,
  onInitializeAssessments,
}: {
  activity: Activity;
  bg: string;
  accent: string;
  isProfesor: boolean;
  hasAssessment: boolean;
  onPress: () => void;
  onDelete: () => void;
  onInitializeAssessments: () => void;
}) => {
  return (
    <View>
      <TouchableOpacity
        style={[styles.activityCard, { backgroundColor: bg }]}
        onPress={onPress}
        activeOpacity={isProfesor ? 1 : 0.8} // Deshabilitado para profesores
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.activityName}>{activity.name}</Text>
            <Text style={styles.activityStatus}>
              {hasAssessment ? "📊 Con evaluación" : "📝 Sin evaluación"}
            </Text>
          </View>

          {isProfesor && (
            <TouchableOpacity onPress={onDelete} style={styles.deleteIconButton}>
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={20}
                color="#555"
              />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>

      {/* Botón para iniciar calificación - solo para profesores */}
      {isProfesor && !hasAssessment && (
        <TouchableOpacity
          style={[styles.initializeButton, { backgroundColor: accent }]}
          onPress={onInitializeAssessments}
        >
          <MaterialCommunityIcons name="play-circle" size={20} color="#FFF" />
          <Text style={styles.initializeButtonText}>Iniciar calificación</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

/* ─────────────────────────────────────────────────────────────── */
/* BIG CARD PARA AGREGAR                                          */
/* ─────────────────────────────────────────────────────────────── */
const AddBigCard = ({
  accentBg,
  onAdd,
}: {
  accentBg: string;
  onAdd: () => void;
}) => (
  <TouchableOpacity
    style={[styles.addCard, { backgroundColor: accentBg }]}
    onPress={onAdd}
  >
    <View style={styles.addButton}>
      <Text style={styles.addIcon}>+</Text>
    </View>
  </TouchableOpacity>
);

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
  activitiesContainer: {
    flex: 1,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    marginTop: 14,
  },
  scrollView: {
    padding: 20,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 40,
    fontSize: 16,
  },
  activityItem: {
    marginBottom: 18,
  },
  activityCard: {
    padding: 18,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardHeaderLeft: {
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  activityStatus: {
    fontSize: 14,
    color: "#666",
  },
  deleteIconButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  initializeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
  },
  initializeButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  addCard: {
    height: 110,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  addButton: {
    width: 58,
    height: 58,
    backgroundColor: "#FFFFFF",
    borderRadius: 29,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  addIcon: {
    fontSize: 28,
    color: "#9EA4AE",
  },
  warningContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    marginTop: 60,
  },
  warningTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginTop: 24,
    marginBottom: 12,
    textAlign: "center",
  },
  warningText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 8,
  },
  warningSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 32,
  },
  goToGroupButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  goToGroupButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ActivityListScreen;
