// src/features/courses/presentation/screens/CourseEnrollmentScreen.tsx

import { useAuth } from '@/src/features/auth/presentation/context/authContext';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import {
  ActivityIndicator,
  Appbar,
  Button,
  Card,
  IconButton,
  Text,
  useTheme
} from 'react-native-paper';
import { useCourse } from '../context/CourseContext';

// Interfaces temporales - luego reemplazar con implementación real
interface Category {
  id: string;
  name: string;
  courseId: string;
  description?: string;
}

interface Activity {
  id: string;
  name: string;
  description: string;
  dueDate: Date;
  categoryId: string;
}

interface Group {
  id: string;
  number: number;
  name: string;
  categoryId: string;
  members: Array<{
    id: string;
    email: string;
    name: string;
  }>;
}

// Mock data temporal
const mockCategories: Category[] = [
  { 
    id: 'cat1', 
    name: 'Evaluaciones Parciales', 
    courseId: '1',
    description: 'Evaluaciones individuales del curso'
  },
  { 
    id: 'cat2', 
    name: 'Trabajos Grupales', 
    courseId: '1',
    description: 'Actividades colaborativas en equipo'
  },
  { 
    id: 'cat3', 
    name: 'Proyecto Final', 
    courseId: '1',
    description: 'Proyecto integral del semestre'
  },
];

const mockActivities: Activity[] = [
  {
    id: 'act1',
    name: 'Parcial 1 - Fundamentos',
    description: 'Primer examen parcial',
    dueDate: new Date('2024-12-20'),
    categoryId: 'cat1',
  },
  {
    id: 'act2',
    name: 'Análisis de Caso',
    description: 'Trabajo grupal de análisis',
    dueDate: new Date('2024-12-25'),
    categoryId: 'cat2',
  },
];

const mockGroups: Group[] = [
  {
    id: 'group1',
    number: 1,
    name: 'Grupo Innovación',
    categoryId: 'cat1',
    members: [
      { id: '1', email: 'estudiante1@correo.com', name: 'Ana García' },
      { id: '2', email: 'estudiante2@correo.com', name: 'Carlos López' },
    ],
  },
  {
    id: 'group2',
    number: 2,
    name: 'Grupo Tecnología',
    categoryId: 'cat1',
    members: [
      { id: '3', email: 'estudiante3@correo.com', name: 'María Rodríguez' },
    ],
  },
];

export default function CourseEnrollmentScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();
  const { getCurrentCourses } = useCourse();
  const params = useLocalSearchParams();
  
  const courseId = params.id as string;
  const courseName = params.courseName as string;

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const palette = (theme.colors as any).rolePalette;
  const accent = palette.profesorAccent;
  const cardBg = palette.profesorCard;
  const surface = palette.surfaceSoft;

  // Obtener el curso actual
  const currentCourse = getCurrentCourses().find(course => course.id === courseId);

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, [courseId]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCategories(mockCategories);
      setActivities(mockActivities);
      setGroups(mockGroups);
      
      if (mockCategories.length > 0) {
        setSelectedCategory(mockCategories[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos del curso');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para copiar el ID del curso al portapapeles
  const copyCourseId = async () => {
  await Clipboard.setStringAsync(courseId);
  Alert.alert("Copiado", "ID del curso copiado al portapapeles");
};

  // Navegación a otras pantallas (placeholders)
  const navigateToAddCategory = () => {
    Alert.alert('Navegación', 'Agregar categoría - Por implementar');
  };

  const navigateToCategoryOverview = (category: Category) => {
    Alert.alert('Navegación', `Ver categoría ${category.name} - Por implementar`);
  };

  const navigateToEditCategory = (category: Category) => {
    Alert.alert('Navegación', `Editar categoría ${category.name} - Por implementar`);
  };

  const navigateToActivityDetail = (activity: Activity) => {
    Alert.alert('Navegación', `Ver actividad ${activity.name} - Por implementar`);
  };

  const navigateToGroupDetail = (group: Group) => {
    Alert.alert('Navegación', `Ver grupo ${group.name} - Por implementar`);
  };

  // Componente para tarjeta de categoría
  const CategoryCard = ({ 
    category, 
    isSelected 
  }: { 
    category: Category; 
    isSelected: boolean;
  }) => (
    <Card 
      style={[
        styles.categoryCard, 
        { 
          backgroundColor: isSelected ? `${accent}20` : cardBg,
          borderColor: isSelected ? accent : 'transparent',
        }
      ]}
    >
      <Card.Content style={styles.categoryCardContent}>
        <View style={styles.categoryInfo}>
          <IconButton 
            icon="folder" 
            size={20} 
            iconColor={isSelected ? accent : '#666'} 
          />
          <Text 
            variant="titleMedium" 
            style={[
              styles.categoryName,
              { color: isSelected ? accent : '#000' }
            ]}
          >
            {category.name}
          </Text>
        </View>
        <IconButton
          icon="pencil"
          size={18}
          iconColor={isSelected ? accent : '#666'}
          onPress={() => navigateToEditCategory(category)}
        />
      </Card.Content>
    </Card>
  );

  // Componente para tarjeta de actividad
  const ActivityCard = ({ activity }: { activity: Activity }) => (
    <Card 
      style={[styles.itemCard, { backgroundColor: cardBg }]}
      onPress={() => navigateToActivityDetail(activity)}
    >
      <Card.Content style={styles.itemCardContent}>
        <IconButton icon="assignment" size={24} iconColor={accent} />
        <Text variant="titleMedium" style={styles.itemName}>
          {activity.name}
        </Text>
      </Card.Content>
    </Card>
  );

  // Componente para tarjeta de grupo
  const GroupCard = ({ group }: { group: Group }) => (
    <Card 
      style={[styles.itemCard, { backgroundColor: cardBg }]}
      onPress={() => navigateToGroupDetail(group)}
    >
      <Card.Content style={styles.itemCardContent}>
        <IconButton icon="group" size={24} iconColor={accent} />
        <View style={styles.groupInfo}>
          <Text variant="titleMedium" style={styles.itemName}>
            Grupo {group.number}
          </Text>
          <Text variant="bodyMedium" style={styles.memberCount}>
            {group.members.length} miembros
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: surface }]}>
        <Appbar.Header style={{ backgroundColor: accent }}>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Cargando..." />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accent} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: surface }]}>
      {/* Header expandible con ID del curso */}
      <Appbar.Header 
        style={{ 
          backgroundColor: accent,
          elevation: 0,
        }}
        mode="medium"
      >
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content 
          title={courseName} 
          titleStyle={{ color: 'white', fontWeight: 'bold' }}
        />
      </Appbar.Header>

      {/* Sección del ID del curso */}
      <View style={[styles.courseIdSection, { backgroundColor: accent }]}>
        <Text style={styles.courseIdLabel}>Código del curso (ID)</Text>
        <View style={styles.courseIdContainer}>
          <View style={styles.courseIdInput}>
            <Text style={styles.courseIdText} selectable>
              {courseId}
            </Text>
          </View>
          <IconButton
            icon="content-copy"
            iconColor="white"
            size={24}
            onPress={copyCourseId}
            style={styles.copyButton}
          />
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Sección de Categorías */}
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Categorías
            </Text>
            <Button
              mode="contained"
              icon="plus"
              onPress={navigateToAddCategory}
              buttonColor={accent}
              textColor="white"
              style={styles.addButton}
            >
              Agregar
            </Button>
          </View>

          {categories.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <IconButton icon="folder-off" size={48} iconColor="#666" />
                <Text variant="titleMedium" style={styles.emptyText}>
                  No hay categorías creadas
                </Text>
                <Text variant="bodyMedium" style={styles.emptySubtext}>
                  Comienza agregando una categoría para organizar las actividades
                </Text>
              </Card.Content>
            </Card>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScroll}
            >
              <View style={styles.categoriesContainer}>
                {categories.map((category) => (
                  <View key={category.id} style={styles.categoryItem}>
                    <CategoryCard
                      category={category}
                      isSelected={selectedCategory?.id === category.id}
                    />
                  </View>
                ))}
              </View>
            </ScrollView>
          )}

          {/* Mensaje informativo */}
          <Card style={styles.infoCard}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.infoText}>
                Selecciona una categoría para gestionar grupos, actividades y evaluaciones
              </Text>
            </Card.Content>
          </Card>

          {/* Vista previa de la categoría seleccionada */}
          {selectedCategory && (
            <>
              {/* Actividades de la categoría */}
              <Card style={styles.sectionCard}>
                <Card.Content>
                  <Text variant="titleMedium" style={styles.sectionSubtitle}>
                    Actividades - {selectedCategory.name}
                  </Text>
                  {activities
                    .filter(activity => activity.categoryId === selectedCategory.id)
                    .map(activity => (
                      <ActivityCard key={activity.id} activity={activity} />
                    ))}
                  {activities.filter(activity => activity.categoryId === selectedCategory.id).length === 0 && (
                    <Text variant="bodyMedium" style={styles.emptySectionText}>
                      No hay actividades en esta categoría
                    </Text>
                  )}
                </Card.Content>
              </Card>

              {/* Grupos de la categoría */}
              <Card style={styles.sectionCard}>
                <Card.Content>
                  <Text variant="titleMedium" style={styles.sectionSubtitle}>
                    Grupos - {selectedCategory.name}
                  </Text>
                  {groups
                    .filter(group => group.categoryId === selectedCategory.id)
                    .map(group => (
                      <GroupCard key={group.id} group={group} />
                    ))}
                  {groups.filter(group => group.categoryId === selectedCategory.id).length === 0 && (
                    <Text variant="bodyMedium" style={styles.emptySectionText}>
                      No hay grupos en esta categoría
                    </Text>
                  )}
                </Card.Content>
              </Card>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  courseIdSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  courseIdLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
  },
  courseIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseIdInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.24)',
  },
  courseIdText: {
    color: 'white',
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '600',
  },
  copyButton: {
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
  },
  addButton: {
    borderRadius: 8,
  },
  categoriesScroll: {
    marginBottom: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingRight: 16,
  },
  categoryItem: {
    width: 200,
    marginRight: 12,
  },
  categoryCard: {
    borderWidth: 2,
  },
  categoryCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryName: {
    flex: 1,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyCard: {
    marginBottom: 16,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 8,
  },
  emptySubtext: {
    textAlign: 'center',
    opacity: 0.7,
  },
  infoCard: {
    marginBottom: 24,
  },
  infoText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  sectionCard: {
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  itemCard: {
    marginBottom: 8,
  },
  itemCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemName: {
    flex: 1,
    marginLeft: 8,
    fontWeight: '600',
  },
  groupInfo: {
    flex: 1,
    marginLeft: 8,
  },
  memberCount: {
    opacity: 0.7,
    marginTop: 2,
  },
  emptySectionText: {
    textAlign: 'center',
    opacity: 0.7,
    fontStyle: 'italic',
    paddingVertical: 16,
  },
});