// src/features/courses/presentation/screens/AddCourseTeacherScreen.tsx

import { useAuth } from '@/src/features/auth/presentation/context/authContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
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

export default function AddCourseTeacherScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();
  const { addCourse, isLoading } = useCourse();

  const [courseName, setCourseName] = useState('');
  const [nrc, setNrc] = useState('');
  const [maxStudents, setMaxStudents] = useState('30');
  const [category, setCategory] = useState('General');

  const [nameError, setNameError] = useState('');
  const [nrcError, setNrcError] = useState('');
  const [maxStudentsError, setMaxStudentsError] = useState('');

  const palette = (theme.colors as any).rolePalette;
  const accentColor = palette.profesorAccent;
  const surfaceColor = palette.surfaceSoft;

  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;

  // Validaciones
  const validateForm = (): boolean => {
    let isValid = true;

    // Validar nombre del curso
    if (!courseName.trim()) {
      setNameError('Ingrese el nombre del curso');
      isValid = false;
    } else if (courseName.trim().length < 3) {
      setNameError('Mínimo 3 caracteres');
      isValid = false;
    } else {
      setNameError('');
    }

    // Validar NRC
    if (!nrc.trim()) {
      setNrcError('Ingrese el NRC del curso');
      isValid = false;
    } else if (!/^\d+$/.test(nrc)) {
      setNrcError('Debe ser un número válido');
      isValid = false;
    } else if (nrc.length !== 5) {
      setNrcError('El NRC debe tener 5 dígitos');
      isValid = false;
    } else {
      setNrcError('');
    }

    // Validar límite de estudiantes
    if (!maxStudents.trim()) {
      setMaxStudentsError('Ingrese el límite de estudiantes');
      isValid = false;
    } else {
      const maxStudentsNum = parseInt(maxStudents);
      if (isNaN(maxStudentsNum)) {
        setMaxStudentsError('Debe ser un número válido');
        isValid = false;
      } else if (maxStudentsNum < 1) {
        setMaxStudentsError('Mínimo 1 estudiante');
        isValid = false;
      } else if (maxStudentsNum > 100) {
        setMaxStudentsError('Máximo 100 estudiantes');
        isValid = false;
      } else {
        setMaxStudentsError('');
      }
    }

    return isValid;
  };

  // Crear curso
  const handleCreateCourse = async () => {
    if (!validateForm()) return;

    if (!user) {
      Alert.alert('Error', 'Usuario no autenticado');
      return;
    }

    try {
      await addCourse(
        courseName.trim(),
        parseInt(nrc),
        category,
        parseInt(maxStudents)
      );

      // Mostrar mensaje de éxito y regresar
      Alert.alert(
        'Curso Creado',
        `El curso "${courseName}" se creó exitosamente`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating course:', error);
      Alert.alert(
        'Error',
        'No se pudo crear el curso. Por favor, intente nuevamente.'
      );
    }
  };

  // Componente para campo de texto
  const FormField = ({
    label,
    value,
    onChangeText,
    error,
    keyboardType = 'default',
    placeholder = '',
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    error: string;
    keyboardType?: 'default' | 'numeric';
    placeholder?: string;
  }) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        mode="outlined"
        error={!!error}
        style={styles.textInput}
        outlineColor="#E0E0E0"
        activeOutlineColor={accentColor}
        theme={{
          colors: {
            primary: accentColor,
            background: '#FFFFFF',
          },
        }}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header section with accent background */}
      <View style={[styles.headerSection, { backgroundColor: accentColor }]}>
        <Appbar.Header
          style={{
            backgroundColor: 'transparent',
            elevation: 0,
          }}
        >
          <Appbar.BackAction
            onPress={() => router.back()}
            color="white"
            size={24}
          />
          <Appbar.Content title="" />
          <View style={{ width: 48 }} /> {/* Balance spacing */}
        </Appbar.Header>

        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>🎓</Text>
          </View>
          <Text style={styles.headerTitle}>Nuevo Curso</Text>
        </View>
      </View>

      {/* Form section */}
      <View
        style={[
          styles.formSection,
          {
            backgroundColor: surfaceColor,
            height: screenHeight * 0.75,
          },
        ]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            <Text style={styles.formSubtitle}>
              Completa los datos del curso para crearlo
            </Text>

            <Card style={styles.formCard}>
              <Card.Content style={styles.formCardContent}>
                {/* Course Name Field */}
                <FormField
                  label="Nombre del Curso"
                  value={courseName}
                  onChangeText={setCourseName}
                  error={nameError}
                  placeholder="Ej: Programación Móvil"
                />

                {/* NRC Field */}
                <FormField
                  label="NRC del Curso"
                  value={nrc}
                  onChangeText={setNrc}
                  error={nrcError}
                  keyboardType="numeric"
                  placeholder="12345"
                />

                {/* Category Field */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Categoría</Text>
                  <TextInput
                    value={category}
                    onChangeText={setCategory}
                    mode="outlined"
                    style={styles.textInput}
                    outlineColor="#E0E0E0"
                    activeOutlineColor={accentColor}
                    theme={{
                      colors: {
                        primary: accentColor,
                        background: '#FFFFFF',
                      },
                    }}
                  />
                </View>

                {/* Max Students Field */}
                <FormField
                  label="Límite de Estudiantes"
                  value={maxStudents}
                  onChangeText={setMaxStudents}
                  error={maxStudentsError}
                  keyboardType="numeric"
                  placeholder="30"
                />

                {/* Buttons */}
                <View style={styles.buttonsContainer}>
                  <Button
                    mode="contained"
                    onPress={handleCreateCourse}
                    loading={isLoading}
                    disabled={isLoading}
                    style={[styles.createButton, { backgroundColor: accentColor }]}
                    contentStyle={styles.buttonContent}
                  >
                    Crear Curso
                  </Button>

                  <Button
                    mode="outlined"
                    onPress={() => router.back()}
                    disabled={isLoading}
                    style={styles.cancelButton}
                    contentStyle={styles.buttonContent}
                    textColor={accentColor}
                  >
                    Cancelar
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </View>
        </ScrollView>
      </View>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={accentColor} />
          <Text style={styles.loadingText}>Creando curso...</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerSection: {
    height: Dimensions.get('window').height * 0.25,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  headerIcon: {
    marginBottom: 12,
  },
  headerIconText: {
    fontSize: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    fontFamily: 'Poppins',
  },
  formSection: {
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    paddingHorizontal: Dimensions.get('window').width * 0.08,
    paddingVertical: 30,
  },
  formSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#858597',
    fontFamily: 'Poppins',
    marginBottom: 30,
    textAlign: 'center',
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
  formCardContent: {
    paddingVertical: 8,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#858597',
    fontFamily: 'Poppins',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    fontSize: 14,
  },
  errorText: {
    color: '#B00020',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontFamily: 'Poppins',
  },
  buttonsContainer: {
    marginTop: 8,
  },
  createButton: {
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  cancelButton: {
    borderRadius: 12,
    borderColor: '#026CD2',
    borderWidth: 1.5,
  },
  buttonContent: {
    paddingVertical: 8,
    height: 50,
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
    color: '#026CD2',
    fontFamily: 'Poppins',
  },
});