import { useAuth } from '@/src/features/auth/presentation/context/authContext';
import React, { useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { ActivityIndicator, Appbar, Badge, useTheme } from 'react-native-paper';
import { Course } from '../../domain/entities/Course';
import { UserRole } from '../../domain/entities/UserRole';
import { useCourse } from '../context/CourseContext';

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const {
    isLoading,
    selectedRole,
    setSelectedRole,
    getCurrentCourses,
    refreshCourses,
  } = useCourse();

  const [refreshing, setRefreshing] = useState(false);

  const isProfesor = selectedRole === UserRole.PROFESOR;
  const palette = (theme.colors as any).rolePalette;
  const accent = isProfesor ? palette.profesorAccent : palette.estudianteAccent;
  const cardBg = isProfesor ? palette.profesorCard : palette.estudianteCard;
  const surface = palette.surfaceSoft;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un problema al cerrar sesión');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshCourses();
    setRefreshing(false);
  };

  const handleCoursePress = (course: Course) => {
    Alert.alert('Curso seleccionado', `Has seleccionado: ${course.name}`);
  };

  const handleDeleteCourse = (course: Course) => {
    Alert.alert(
      isProfesor ? 'Eliminar curso' : 'Salir del curso',
      isProfesor 
        ? '¿Estás seguro de que deseas eliminar este curso?'
        : '¿Quieres salir de este curso?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Éxito',
              isProfesor 
                ? 'Curso eliminado correctamente'
                : 'Te has desinscrito del curso'
            );
          }
        },
      ]
    );
  };

  const RoleSegmented: React.FC = () => (
    <View style={styles.roleContainer}>
      <TouchableOpacity
        style={[
          styles.roleButton,
          isProfesor && { backgroundColor: palette.profesorAccent },
        ]}
        onPress={() => setSelectedRole(UserRole.PROFESOR)}
      >
        <Text style={[
          styles.roleButtonText,
          isProfesor && styles.roleButtonTextSelected
        ]}>
          Profesor
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.roleButton,
          !isProfesor && { backgroundColor: palette.estudianteAccent },
        ]}
        onPress={() => setSelectedRole(UserRole.ESTUDIANTE)}
      >
        <Text style={[
          styles.roleButtonText,
          !isProfesor && styles.roleButtonTextSelected
        ]}>
          Estudiante
        </Text>
      </TouchableOpacity>
    </View>
  );

  const ClassCard: React.FC<{ course: Course }> = ({ course }) => (
    <TouchableOpacity
      style={[styles.classCard, { backgroundColor: cardBg }]}
      onPress={() => handleCoursePress(course)}
      onLongPress={() => handleDeleteCourse(course)}
    >
      <View style={styles.cardHeader}>
        <Badge style={[styles.badge, { backgroundColor: accent }]}>
          {`${course.enrolledUsers.length}/${course.maxStudents}`}
        </Badge>
        <TouchableOpacity onPress={() => handleDeleteCourse(course)}>
          <View style={styles.deleteButton} />
        </TouchableOpacity>
      </View>
      <Text style={styles.courseName}>{course.name}</Text>
      <Text style={styles.teacherName}>{course.teacher}</Text>
    </TouchableOpacity>
  );

  const AddBigCard: React.FC = () => (
    <TouchableOpacity
      style={[styles.addCard, { backgroundColor: accent }]}
      onPress={() => Alert.alert(
        'Agregar',
        isProfesor ? 'Agregar nuevo curso' : 'Buscar cursos'
      )}
    >
      <View style={styles.addButton}>
        <Text style={styles.addIcon}>
          {isProfesor ? '+' : '🔍'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appBar}>
        <Appbar.Content title="" />
        <Appbar.Action 
          icon="logout" 
          onPress={handleLogout}
          color={theme.colors.onSurface}
        />
      </Appbar.Header>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>PT</Text>
          <Text style={styles.userName}>
            {user?.email || 'Usuario'}
          </Text>
        </View>

        <Text style={styles.title}>Cursos</Text>

        <RoleSegmented />

        <View style={[styles.coursesContainer, { backgroundColor: surface }]}>
          {isLoading ? (
            <ActivityIndicator size="large" color={accent} style={styles.loader} />
          ) : (
            <ScrollView
              style={styles.scrollView}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              {getCurrentCourses(isProfesor).map((course) => (
                <View key={course.id} style={styles.courseItem}>
                  <ClassCard course={course} />
                </View>
              ))}
              <AddBigCard />
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  appBar: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  logo: {
    width: 40,
    height: 40,
    backgroundColor: '#026CD2',
    borderRadius: 8,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '200',
    marginLeft: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    marginVertical: 12,
  },
  roleContainer: {
    flexDirection: 'row',
    backgroundColor: '#E9EAEE',
    marginHorizontal: 20,
    padding: 4,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 26,
    alignItems: 'center',
  },
  roleButtonText: {
    color: '#5B616E',
    fontWeight: '600',
  },
  roleButtonTextSelected: {
    color: '#FFFFFF',
  },
  coursesContainer: {
    flex: 1,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    marginTop: 14,
  },
  scrollView: {
    padding: 20,
  },
  loader: {
    marginTop: 50,
  },
  courseItem: {
    marginBottom: 18,
  },
  classCard: {
    padding: 18,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#026CD2',
  },
  deleteButton: {
    width: 18,
    height: 4,
    backgroundColor: '#B91C1C',
    borderRadius: 2,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  teacherName: {
    color: '#666666',
    marginTop: 8,
  },
  addCard: {
    height: 110,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  addButton: {
    width: 58,
    height: 58,
    backgroundColor: '#FFFFFF',
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  addIcon: {
    fontSize: 28,
    color: '#9EA4AE',
  },
});

export default HomeScreen;