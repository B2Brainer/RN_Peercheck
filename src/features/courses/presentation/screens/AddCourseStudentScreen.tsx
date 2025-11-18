// src/features/courses/presentation/screens/AddCourseStudentScreen.tsx

import { useAuth } from '@/src/features/auth/presentation/context/authContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    View,
} from 'react-native';
import {
    ActivityIndicator,
    Appbar,
    Button,
    Card,
    Text,
    TextInput,
    useTheme,
} from 'react-native-paper';
import { useCourse } from '../context/CourseContext';

export default function AddCourseStudentScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();
  const { enrollUser, isLoading, refreshCourses } = useCourse();

  const [courseCode, setCourseCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const palette = (theme.colors as any).rolePalette;
  const accentColor = palette.estudianteAccent;
  const surfaceColor = palette.surfaceSoft;

  // Validar formulario
  const validateForm = (): boolean => {
    if (!courseCode.trim()) {
      Alert.alert('Error', 'Por favor ingresa el código del curso');
      return false;
    }
    return true;
  };

  // Inscribirse al curso
  const handleEnroll = async () => {
    if (!validateForm()) return;

    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para inscribirte');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('🎓 [AddCourseStudentScreen] Inscribiendo usuario:', user.email, 'en curso:', courseCode);
      
      await enrollUser(courseCode.trim());
      await refreshCourses(); // Actualizar la lista de cursos

      // Mostrar éxito y regresar
      Alert.alert(
        'Inscripción Exitosa',
        'Te has inscrito al curso correctamente.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error enrolling in course:', error);
      
      let errorMessage = 'Ocurrió un error al inscribirse al curso';
      
      // Mensajes de error más específicos
      if (error.message?.includes('no encontrado') || error.message?.includes('not found')) {
        errorMessage = 'Curso no encontrado. Verifica el código e intenta nuevamente.';
      } else if (error.message?.includes('ya inscrito') || error.message?.includes('already enrolled')) {
        errorMessage = 'Ya estás inscrito en este curso.';
      } else if (error.message?.includes('lleno') || error.message?.includes('full')) {
        errorMessage = 'El curso está lleno. No hay cupos disponibles.';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: surfaceColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <Appbar.Header
        style={{
          backgroundColor: 'transparent',
          elevation: 0,
        }}
      >
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content 
          title="Inscribirse a Curso" 
          titleStyle={styles.headerTitle}
        />
      </Appbar.Header>

      {/* Contenido principal */}
      <View style={styles.content}>
        <Card style={styles.formCard}>
          <Card.Content style={styles.cardContent}>
            {/* Título y descripción */}
            <Text variant="titleLarge" style={styles.title}>
              Ingresa el código del curso
            </Text>
            
            <Text variant="bodyMedium" style={styles.description}>
              Pide el código a tu profesor. Es el ID del curso.
            </Text>

            {/* Campo de código del curso */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Código del Curso (ID)</Text>
              <TextInput
                value={courseCode}
                onChangeText={setCourseCode}
                placeholder="Ej: CURSO12345"
                mode="outlined"
                style={styles.textInput}
                outlineColor="#001D3D"
                activeOutlineColor={accentColor}
                autoCapitalize="none"
                autoCorrect={false}
                theme={{
                  colors: {
                    primary: accentColor,
                    background: '#FFFFFF',
                  },
                }}
              />
            </View>

            {/* Botones de acción */}
            <View style={styles.buttonsContainer}>
              <Button
                mode="outlined"
                onPress={() => router.back()}
                disabled={isSubmitting}
                style={styles.cancelButton}
                contentStyle={styles.buttonContent}
                textColor={accentColor}
              >
                Cancelar
              </Button>

              <Button
                mode="contained"
                onPress={handleEnroll}
                loading={isSubmitting}
                disabled={isSubmitting || !courseCode.trim()}
                style={[styles.enrollButton, { backgroundColor: accentColor }]}
                contentStyle={styles.buttonContent}
              >
                Ingresar
              </Button>
            </View>

            {/* Información adicional */}
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                💡 El código del curso es el ID único que el profesor puede ver en la pantalla de gestión del curso.
              </Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Loading Overlay */}
      {(isSubmitting || isLoading) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={accentColor} />
          <Text style={styles.loadingText}>Inscribiendo al curso...</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000814',
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardContent: {
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000814',
    marginBottom: 8,
    textAlign: 'left',
  },
  description: {
    color: '#5B616E',
    marginBottom: 32,
    textAlign: 'left',
    lineHeight: 20,
  },
  fieldContainer: {
    marginBottom: 32,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#858597',
    marginBottom: 8,
    fontFamily: 'Poppins',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    fontSize: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 12,
    borderColor: '#FFD60A',
    borderWidth: 1.5,
  },
  enrollButton: {
    flex: 1,
    borderRadius: 12,
    elevation: 2,
  },
  buttonContent: {
    paddingVertical: 8,
    height: 50,
  },
  infoContainer: {
    backgroundColor: '#FFF8E1',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD60A',
  },
  infoText: {
    fontSize: 14,
    color: '#5B616E',
    lineHeight: 20,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#FFD60A',
    fontFamily: 'Poppins',
  },
});