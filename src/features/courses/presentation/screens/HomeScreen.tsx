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
  Appbar,
  useTheme
} from "react-native-paper";
import { Course } from "../../domain/entities/Course";
import { useCourse } from "../context/CourseContext";

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { user, logout } = useAuth();
  const {isProfesor, setDataCourse, setIsProfesor} = useCourse();
  const { teacherCourses, studentCourses, refreshCourses, deleteCourse, deleteStudent } = useCourse();

  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Cursos actuales dependiendo del rol
  const currentCourses = isProfesor ? teacherCourses : studentCourses;

  const palette = (theme.colors as any).rolePalette;
  const accent = isProfesor ? palette.profesorAccent : palette.estudianteAccent;
  const cardBg = isProfesor ? palette.profesorCard : palette.estudianteCard;
  const surface = palette.surfaceSoft;

  // Logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      Alert.alert("Error", "Ocurrió un problema al cerrar sesión");
    }
  };

  // Refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshCourses();
    setRefreshing(false);
  };

  // Eliminar o desinscribir estudiante
  const handleDeleteCourse = async (course: Course) => {
  try {
    if (isProfesor) {
      await deleteCourse(course.nrc);
    } else {
      await deleteStudent(user!.email, course.nrc);
    }

    await refreshCourses();
  } catch (error) {
    console.error("Error deleting course:", error);
  }
};

  const handleAddCourse = () => {
    router.push(isProfesor ? "/courses/add-teacher" : "/courses/add-student");
  };

  const handleCoursePress = (course: Course) => {
    setDataCourse(course);
    router.push({
      pathname: isProfesor ? "/categories/detail-teacher" : "/categories/detail-student",
    });
  };

  return (
  <View style={styles.container}>
    <Appbar.Header style={styles.appBar}>
      <Appbar.Content title="" />
      <Appbar.Action icon="logout" onPress={handleLogout} color="#000" />
    </Appbar.Header>

    <View style={styles.content}>
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/Peertrack_LOGO.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.userName}>{user?.email}</Text>
      </View>

      <Text style={styles.title}>Cursos</Text>

      {/* Selector de roles */}
      <RoleSegmented
        isProfesor={isProfesor}
        accentProfesor={palette.profesorAccent}
        accentEstudiante={palette.estudianteAccent}
        onChange={(value) => setIsProfesor(value)}
      />

      <View style={[styles.coursesContainer, { backgroundColor: surface }]}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {currentCourses.map((course) => (
              <View key={course.nrc} style={styles.courseItem}>
                <ClassCard
                  course={course}
                  bg={cardBg}
                  onPress={() => handleCoursePress(course)}
                  onDelete={() => handleDeleteCourse(course)}
                />
              </View>
            ))
          }

          {/* Always show Add card */}
          <AddBigCard
            accentBg={cardBg}
            isProfesor={isProfesor}
            onAdd={handleAddCourse}
          />
        </ScrollView>
      </View>
    </View>
  </View>
);
};

/*───────────────────────*/
/* RoleSegmented (booleans)
────────────────────────*/
const RoleSegmented = ({
  isProfesor,
  accentProfesor,
  accentEstudiante,
  onChange,
}: {
  isProfesor: boolean;
  accentProfesor: string;
  accentEstudiante: string;
  onChange: (value: boolean) => void;
}) => {
  return (
    <View style={styles.roleContainer}>
      <TouchableOpacity
        style={[styles.roleButton, isProfesor && { backgroundColor: accentProfesor }]}
        onPress={() => onChange(true)}
      >
        <Text style={[styles.roleButtonText, isProfesor && styles.roleButtonTextSelected]}>
          Profesor
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.roleButton, !isProfesor && { backgroundColor: accentEstudiante }]}
        onPress={() => onChange(false)}
      >
        <Text style={[styles.roleButtonText, !isProfesor && styles.roleButtonTextSelected]}>
          Estudiante
        </Text>
      </TouchableOpacity>
    </View>
  );
};

/* ─────────────────────────────────────────────────────────────── */
/* CARD DE CURSO (estética idéntica a tu versión original)        */
/* ─────────────────────────────────────────────────────────────── */
import { MaterialCommunityIcons } from "@expo/vector-icons";

const ClassCard = ({
  course,
  bg,
  onPress,
  onDelete,
}: {
  course: Course;
  bg: string;
  onPress: () => void;
  onDelete: () => void;
}) => {
  return (
    <TouchableOpacity
      style={[styles.classCard, { backgroundColor: bg }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeaderSimple}>
        <Text style={styles.courseName}>{course.name}</Text>

        <TouchableOpacity onPress={onDelete} style={styles.deleteIconButton}>
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={20}
            color="#555"   
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};


/* ─────────────────────────────────────────────────────────────── */
/* BIG CARD PARA AGREGAR                                          */
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
  cardHeaderSimple: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

deleteIconButton: {
  padding: 6,
  borderRadius: 8,
  backgroundColor: "rgba(0,0,0,0.05)", // Fondo súper suave
},

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
