// src/features/categories/presentation/screens/CategoryListScreen.tsx
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
import { Category } from "../../domain/entities/category";
import { useCategory } from "../context/CategoryContext";

const CategoryListScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { course, isProfesor } = useCourse();
  const { 
    categories, 
    refreshCategories, 
    deleteCategory, 
    setSelectedCategory 
  } = useCategory();

  const [refreshing, setRefreshing] = useState<boolean>(false);

  const palette = (theme.colors as any).rolePalette;
  const accent = isProfesor ? palette.profesorAccent : palette.estudianteAccent;
  const cardBg = isProfesor ? palette.profesorCard : palette.estudianteCard;
  const surface = palette.surfaceSoft;

  useEffect(() => {
    if (course) {
      refreshCategories(course);
    }
  }, [course]);

  const onRefresh = async () => {
    if (!course) return;
    setRefreshing(true);
    await refreshCategories(course);
    setRefreshing(false);
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!course) return;
    try {
      await deleteCategory(category.id!, course);
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleCategoryPress = (category: Category) => {
    setSelectedCategory(category);
    router.push("/categories/groups");
  };

  const handleAddCategory = () => {
    router.push("/categories/add-category");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.courseName}>{course?.name}</Text>
          <Text style={styles.roleText}>
            {isProfesor ? "Profesor" : "Estudiante"}
          </Text>
        </View>
      </View>

      <Text style={styles.title}>Categorías</Text>

      <View style={[styles.categoriesContainer, { backgroundColor: surface }]}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {categories.map((category) => (
            <View key={category.id} style={styles.categoryItem}>
              <CategoryCard
                category={category}
                bg={cardBg}
                isProfesor={isProfesor}
                onPress={() => handleCategoryPress(category)}
                onDelete={() => handleDeleteCategory(category)}
              />
            </View>
          ))}

          {/* Add card - solo para profesores */}
          {isProfesor && (
            <AddBigCard
              accentBg={cardBg}
              onAdd={handleAddCategory}
            />
          )}
        </ScrollView>
      </View>
    </View>
  );
};

/* ─────────────────────────────────────────────────────────────── */
/* CARD DE CATEGORÍA                                              */
/* ─────────────────────────────────────────────────────────────── */
const CategoryCard = ({
  category,
  bg,
  isProfesor,
  onPress,
  onDelete,
}: {
  category: Category;
  bg: string;
  isProfesor: boolean;
  onPress: () => void;
  onDelete: () => void;
}) => {
  const router = useRouter();
  const { setSelectedCategory } = useCategory();

  const handleViewActivities = () => {
    setSelectedCategory(category);
    router.push("/activities/activity-list" as any);
  };

  const handleViewResults = () => {
    setSelectedCategory(category);
    router.push("/activities/results" as any);
  };

  return (
    <TouchableOpacity
      style={[styles.categoryCard, { backgroundColor: bg }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.categoryName}>{category.name}</Text>
          <Text style={styles.categoryType}>
            {category.random ? "🎲 Aleatorio" : "✋ Auto-asignado"}
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

      {/* Botones de acción */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.activitiesButton]}
          onPress={handleViewActivities}
        >
          <MaterialCommunityIcons
            name="clipboard-list-outline"
            size={20}
            color="#026CD2"
          />
          <Text style={styles.activitiesButtonText}>Actividades</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.resultsButton]}
          onPress={handleViewResults}
        >
          <MaterialCommunityIcons
            name="chart-bar"
            size={20}
            color="#059669"
          />
          <Text style={styles.resultsButtonText}>Resultados</Text>
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
  courseName: {
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
  categoriesContainer: {
    flex: 1,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    marginTop: 14,
  },
  scrollView: {
    padding: 20,
  },
  categoryItem: {
    marginBottom: 18,
  },
  categoryCard: {
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
  categoryName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  categoryType: {
    fontSize: 14,
    color: "#666",
  },
  deleteIconButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
    flex: 1,
    justifyContent: "center",
  },
  activitiesButton: {
    backgroundColor: "#E0F2FE",
  },
  activitiesButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#026CD2",
  },
  resultsButton: {
    backgroundColor: "#D1FAE5",
  },
  resultsButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#059669",
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
});

export default CategoryListScreen;
