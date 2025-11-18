// src/features/courses/presentation/screens/CourseDetailScreen.tsx

import { useAuth } from '@/src/features/auth/presentation/context/authContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    RefreshControl,
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
    useTheme,
} from 'react-native-paper';
import { useCourse } from '../context/CourseContext';

// Interfaces temporales para las entidades que faltan
interface Category {
  id: string;
  name: string;
  courseId: string;
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

// Mock data temporal - luego reemplazar con implementación real
const mockCategories: Category[] = [
  { id: 'cat1', name: 'Evaluaciones Parciales', courseId: '1' },
  { id: 'cat2', name: 'Trabajos Grupales', courseId: '1' },
  { id: 'cat3', name: 'Proyecto Final', courseId: '1' },
];

const mockActivities: Activity[] = [
  {
    id: 'act1',
    name: 'Evaluación Parcial 1',
    description: 'Primer examen parcial del curso',
    dueDate: new Date('2024-12-20'),
    categoryId: 'cat1',
  },
  {
    id: 'act2',
    name: 'Trabajo Grupal 1',
    description: 'Análisis de caso de estudio',
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
];

export default function CourseDetailScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();
  const { getCurrentCourses, enrollUser, refreshCourses } = useCourse();
  const params = useLocalSearchParams();
  
  const courseId = params.id as string;
  const courseName = params.courseName as string;
  const teacherEmail = params.teacherEmail as string;

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const palette = (theme.colors as any).rolePalette;
  const accent = palette.estudianteAccent;
  const cardBg = palette.estudianteCard;
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

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshCourses();
    await loadInitialData();
    setRefreshing(false);
  };

  // Obtener el grupo del usuario actual
  const getUserGroup = (): Group | null => {
    if (!user) return null;
    return mockGroups.find(group => 
      group.members.some(member => member.email === user.email)
    ) || null;
  };

  const userGroup = getUserGroup();

  // Navegación a otras pantallas (placeholder por ahora)
  const navigateToGroupList = () => {
    Alert.alert('Navegación', 'Ir a lista de grupos - Por implementar');
  };

  const navigateToMyGroup = () => {
    Alert.alert('Navegación', 'Ir a mi grupo - Por implementar');
  };

  const navigateToEvaluate = (activityId: string) => {
    Alert.alert('Evaluación', `Evaluar actividad ${activityId} - Por implementar`);
  };

  // Componente para cuando el usuario no tiene grupo
  const NoGroupCard = () => (
    <Card style={[styles.card, { backgroundColor: cardBg }]}>
      <Card.Content style={styles.noGroupContent}>
        <IconButton
          icon="account-group"
          size={48}
          iconColor="#FF9800"
        />
        <Text variant="titleMedium" style={styles.noGroupTitle}>
          No perteneces a ningún grupo
        </Text>
        <Text variant="bodyMedium" style={styles.noGroupDescription}>
          Debes formar parte de un grupo para poder ver y realizar las actividades de esta categoría.
        </Text>
        <Button
          mode="contained"
          icon="groups"
          onPress={navigateToGroupList}
          style={styles.noGroupButton}
          buttonColor="#FF9800"
        >
          Ver Grupos Disponibles
        </Button>
      </Card.Content>
    </Card>
  );

  // Componente para mostrar el grupo del usuario
  const UserGroupCard = ({ group }: { group: Group }) => (
    <Card style={[styles.card, { backgroundColor: cardBg }]}>
      <Card.Content>
        <View style={styles.groupHeader}>
          <IconButton icon="account-group" size={20} iconColor={accent} />
          <Text variant="titleSmall">Mi Grupo</Text>
        </View>
        <View style={styles.groupInfo}>
          <Text variant="titleLarge">Grupo {group.number}</Text>
          <Text variant="bodyMedium" style={styles.memberCount}>
            {group.members.length} miembro{group.members.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={styles.groupActions}>
          <Button
            mode="contained"
            icon="eye"
            onPress={navigateToMyGroup}
            style={styles.groupButton}
            buttonColor={accent}
          >
            Ver Mi Grupo
          </Button>
          <Button
            mode="outlined"
            icon="account-multiple"
            onPress={navigateToGroupList}
            style={styles.groupButton}
            textColor={accent}
          >
            Otros Grupos
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  // Componente para actividades
  const ActivityCard = ({ activity }: { activity: Activity }) => (
    <Card style={[styles.activityCard, { backgroundColor: cardBg }]}>
      <Card.Content>
        <View style={styles.activityHeader}>
          <View style={[styles.activityIcon, { backgroundColor: `${accent}20` }]}>
            <IconButton icon="assignment" size={24} iconColor={accent} />
          </View>
          <View style={styles.activityBadge}>
            <Text variant="labelSmall" style={{ color: accent }}>
              Actividad
            </Text>
          </View>
        </View>
        <Text variant="titleMedium" style={styles.activityTitle}>
          {activity.name}
        </Text>
        <Text variant="bodyMedium" style={styles.activityDueDate}>
          Fecha límite: {activity.dueDate.toLocaleDateString()}
        </Text>
        <Button
          mode="contained"
          icon="rate-review"
          onPress={() => navigateToEvaluate(activity.id)}
          style={styles.evaluateButton}
          buttonColor={accent}
        >
          Evaluar
        </Button>
      </Card.Content>
    </Card>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: surface }]}>
        <Appbar.Header>
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
      {/* Header */}
      <Appbar.Header style={{ backgroundColor: accent }}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content 
          title={courseName} 
          titleStyle={{ color: 'white', fontWeight: 'bold' }}
        />
      </Appbar.Header>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {/* Selector de Categorías */}
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Text variant="titleSmall" style={styles.sectionTitle}>
                Categorías
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoriesContainer}>
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      mode={selectedCategory?.id === category.id ? "contained" : "outlined"}
                      onPress={() => setSelectedCategory(category)}
                      style={styles.categoryButton}
                      buttonColor={selectedCategory?.id === category.id ? accent : undefined}
                    >
                      {category.name}
                    </Button>
                  ))}
                </View>
              </ScrollView>
            </Card.Content>
          </Card>

          {/* Información del Grupo */}
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Text variant="titleSmall" style={styles.sectionTitle}>
                Mi Grupo
              </Text>
              {userGroup ? (
                <UserGroupCard group={userGroup} />
              ) : (
                <NoGroupCard />
              )}
            </Card.Content>
          </Card>

          {/* Actividades */}
          {selectedCategory && (
            <Card style={styles.sectionCard}>
              <Card.Content>
                <Text variant="titleSmall" style={styles.sectionTitle}>
                  Actividades - {selectedCategory.name}
                </Text>
                <View style={styles.activitiesGrid}>
                  {activities
                    .filter(activity => activity.categoryId === selectedCategory.id)
                    .map(activity => (
                      <ActivityCard key={activity.id} activity={activity} />
                    ))}
                </View>
                {activities.filter(activity => activity.categoryId === selectedCategory.id).length === 0 && (
                  <Text variant="bodyMedium" style={styles.noActivities}>
                    No hay actividades disponibles en esta categoría
                  </Text>
                )}
              </Card.Content>
            </Card>
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
  content: {
    padding: 16,
  },
  sectionCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  categoriesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryButton: {
    marginRight: 8,
  },
  card: {
    marginVertical: 4,
  },
  noGroupContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  noGroupTitle: {
    textAlign: 'center',
    marginVertical: 8,
    fontWeight: 'bold',
  },
  noGroupDescription: {
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.7,
  },
  noGroupButton: {
    marginTop: 8,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupInfo: {
    marginBottom: 16,
  },
  memberCount: {
    opacity: 0.7,
    marginTop: 4,
  },
  groupActions: {
    flexDirection: 'row',
    gap: 12,
  },
  groupButton: {
    flex: 1,
  },
  activityCard: {
    marginVertical: 6,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityIcon: {
    borderRadius: 8,
  },
  activityBadge: {
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  activityTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  activityDueDate: {
    opacity: 0.7,
    marginBottom: 12,
  },
  evaluateButton: {
    marginTop: 8,
  },
  activitiesGrid: {
    gap: 12,
  },
  noActivities: {
    textAlign: 'center',
    opacity: 0.7,
    fontStyle: 'italic',
    marginVertical: 16,
  },
});