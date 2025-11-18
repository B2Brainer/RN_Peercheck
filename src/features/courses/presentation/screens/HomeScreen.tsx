import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Badge,
  useTheme,
} from "react-native-paper";
import { Course } from "../../domain/entities/Course";
import { UserRole } from "../../domain/entities/UserRole";
import { useCourse } from "../context/CourseContext";

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { user, logout } = useAuth();
  const {
    isLoading,
    selectedRole,
    setSelectedRole,
    getCurrentCourses,
    refreshCourses,
  } = useCourse();

  const isProfesor = selectedRole === UserRole.PROFESOR;
  const palette = (theme.colors as any).rolePalette;
  const accent = isProfesor ? palette.profesorAccent : palette.estudianteAccent;
  const cardBg = isProfesor ? palette.profesorCard : palette.estudianteCard;
  const surface = palette.surfaceSoft;

  const [refreshing, setRefreshing] = useState(false);

  // 🔹 Logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      Alert.alert("Error", "Ocurrió un problema al cerrar sesión");
    }
  };

  // 🔹 Refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshCourses();
    setRefreshing(false);
  };

  // 🔹 Abrir curso
  const handleCoursePress = (course: Course) => {
    Alert.alert("Curso seleccionado", `Has seleccionado: ${course.name}`);
  };

  // 🔹 Eliminar curso o salir del curso
  const handleDeleteCourse = (course: Course) => {
    Alert.alert(
      isProfesor ? "Eliminar curso" : "Salir del curso",
      isProfesor
        ? "¿Estás seguro de que deseas eliminar este curso?"
        : "¿Quieres salir de este curso?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          style: "destructive",
          onPress: () =>
            Alert.alert(
              "Éxito",
              isProfesor
                ? "Curso eliminado correctamente"
                : "Te has desinscrito del curso"
            ),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* ─────────────────────────────────────────────────────────────── */}
      {/* APPBAR TRANSPARENTE (como en Flutter) */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <Appbar.Header style={styles.appBar}>
        <Appbar.Content title="" />
        <Appbar.Action icon="logout" onPress={handleLogout} color="#000" />
      </Appbar.Header>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* CONTENIDO PRINCIPAL */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <View style={styles.content}>
        {/* Logo + Nombre del usuario */}
        <View style={styles.header}>
          <Image
            source={require("@/assets/images/Peertrack_LOGO.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.userName}>{user?.email || "Usuario"}</Text>
        </View>

        {/* Título */}
        <Text style={styles.title}>Cursos</Text>

        {/* Selector de roles */}
        <RoleSegmented
          isProfesor={isProfesor}
          accentProfesor={palette.profesorAccent}
          accentEstudiante={palette.estudianteAccent}
          onChange={(role) => setSelectedRole(role)}
        />

        {/* Contenedor blanco superior con borderRadius */}
        <View style={[styles.coursesContainer, { backgroundColor: surface }]}>
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={accent}
              style={styles.loader}
            />
          ) : (
            <ScrollView
              style={styles.scrollView}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              {getCurrentCourses(isProfesor).map((course) => (
                <View key={course.id} style={styles.courseItem}>
                  <ClassCard
                    course={course}
                    accent={accent}
                    bg={cardBg}
                    isProfesor={isProfesor}
                    onPress={() => handleCoursePress(course)}
                    onDelete={() => handleDeleteCourse(course)}
                  />
                </View>
              ))}

              <AddBigCard
                accentBg={cardBg}
                isProfesor={isProfesor}
                onAdd={() =>
                  Alert.alert(
                    isProfesor ? "Agregar curso" : "Buscar curso",
                    "Acción simulada"
                  )
                }
              />
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  );
};

/* ─────────────────────────────────────────────────────────────── */
/* COMPONENTE ROLE SEGMENTED (igual a Flutter estéticamente)       */
/* ─────────────────────────────────────────────────────────────── */
const RoleSegmented = ({
  isProfesor,
  accentProfesor,
  accentEstudiante,
  onChange,
}: {
  isProfesor: boolean;
  accentProfesor: string;
  accentEstudiante: string;
  onChange: (role: UserRole) => void;
}) => {
  return (
    <View style={styles.roleContainer}>
      {/* PROFESOR */}
      <TouchableOpacity
        style={[
          styles.roleButton,
          isProfesor && { backgroundColor: accentProfesor },
        ]}
        onPress={() => onChange(UserRole.PROFESOR)}
      >
        <Text
          style={[
            styles.roleButtonText,
            isProfesor && styles.roleButtonTextSelected,
          ]}
        >
          Profesor
        </Text>
      </TouchableOpacity>

      {/* ESTUDIANTE */}
      <TouchableOpacity
        style={[
          styles.roleButton,
          !isProfesor && { backgroundColor: accentEstudiante },
        ]}
        onPress={() => onChange(UserRole.ESTUDIANTE)}
      >
        <Text
          style={[
            styles.roleButtonText,
            !isProfesor && styles.roleButtonTextSelected,
          ]}
        >
          Estudiante
        </Text>
      </TouchableOpacity>
    </View>
  );
};

/* ─────────────────────────────────────────────────────────────── */
/* CARD DE CURSO (estética muy parecida a Flutter)                 */
/* ─────────────────────────────────────────────────────────────── */
const ClassCard = ({
  course,
  isProfesor,
  accent,
  bg,
  onPress,
  onDelete,
}: {
  course: Course;
  isProfesor: boolean;
  accent: string;
  bg: string;
  onPress: () => void;
  onDelete: () => void;
}) => {
  return (
    <TouchableOpacity
      style={[styles.classCard, { backgroundColor: bg }]}
      onPress={onPress}
      onLongPress={onDelete}
    >
      <View style={styles.cardHeader}>
        <Badge style={[styles.badge, { backgroundColor: accent }]}>
          {`${course.enrolledUsers.length}/${course.maxStudents}`}
        </Badge>

        <TouchableOpacity onPress={onDelete}>
          <View style={styles.deleteButton} />
        </TouchableOpacity>
      </View>

      <Text style={styles.courseName}>{course.name}</Text>
      <Text style={styles.teacherName}>{course.teacher}</Text>
    </TouchableOpacity>
  );
};

/* ─────────────────────────────────────────────────────────────── */
/* BIG CARD PARA AGREGAR (idéntico a Flutter)                      */
/* ─────────────────────────────────────────────────────────────── */
const AddBigCard = ({
  accentBg,
  onAdd,
  isProfesor,
}: {
  accentBg: string;
  onAdd: () => void;
  isProfesor: boolean;
}) => (
  <TouchableOpacity
    style={[styles.addCard, { backgroundColor: accentBg }]}
    onPress={onAdd}
  >
    <View style={styles.addButton}>
      <Text style={styles.addIcon}>{isProfesor ? "+" : "🔍"}</Text>
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
  },
  appBar: {
    backgroundColor: "transparent",
    elevation: 0,
    shadowOpacity: 0,
  },
  content: {
    flex: 1,
  },

  /* Header con logo y nombre */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  logo: {
    width: 40,
    height: 40,
  },
  userName: {
    fontSize: 24,
    fontWeight: "200",
    marginLeft: 12,
  },

  /* Títulos */
  title: {
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
    marginVertical: 12,
  },

  /* Role segmented */
  roleContainer: {
    flexDirection: "row",
    backgroundColor: "#E9EAEE",
    marginHorizontal: 20,
    padding: 4,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 26,
    alignItems: "center",
  },
  roleButtonText: {
    color: "#5B616E",
    fontWeight: "600",
  },
  roleButtonTextSelected: {
    color: "#FFFFFF",
  },

  /* Cursos */
  coursesContainer: {
    flex: 1,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    marginTop: 14,
  },
  scrollView: {
    padding: 20,
  },

  /* Cards */
  courseItem: {
    marginBottom: 18,
  },
  classCard: {
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
  badge: {
    backgroundColor: "#026CD2",
  },
  deleteButton: {
    width: 18,
    height: 4,
    backgroundColor: "#B91C1C",
    borderRadius: 2,
  },
  courseName: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
  },
  teacherName: {
    color: "#666666",
    marginTop: 8,
  },

  /* Add big card */
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
  loader: {
  marginTop: 50,
},
});

export default HomeScreen;
