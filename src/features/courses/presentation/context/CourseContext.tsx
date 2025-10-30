import React, { createContext, ReactNode, useContext, useState } from 'react';
import { Course } from '../../domain/entities/Course';
import { UserRole } from '../../domain/entities/UserRole';

interface CourseContextType {
  teacherCourses: Course[];
  studentCourses: Course[];
  isLoading: boolean;
  selectedRole: UserRole;
  setSelectedRole: (role: UserRole) => void;
  getCurrentCourses: (isTeacher: boolean) => Course[];
  refreshCourses: () => void;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [teacherCourses, setTeacherCourses] = useState<Course[]>([]);
  const [studentCourses, setStudentCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.PROFESOR);

  // Datos mock iniciales (temporal)
  const mockTeacherCourses: Course[] = [
    {
      id: '1',
      name: 'Programación Móvil',
      nrc: 12345,
      teacher: 'Prof. Augusto Salazar',
      category: 'Tecnología',
      enrolledUsers: ['estudiante1@example.com', 'estudiante2@example.com'],
      maxStudents: 30,
    },
    {
      id: '2',
      name: 'Base de Datos',
      nrc: 12346,
      teacher: 'Prof. Augusto Salazar',
      category: 'Tecnología',
      enrolledUsers: ['estudiante1@example.com'],
      maxStudents: 25,
    },
  ];

  const mockStudentCourses: Course[] = [
    {
      id: '3',
      name: 'Inteligencia Artificial',
      nrc: 12347,
      teacher: 'Prof. Ana García',
      category: 'Tecnología',
      enrolledUsers: ['usuario@example.com'],
      maxStudents: 20,
    },
  ];

  const getCurrentCourses = (isTeacher: boolean): Course[] => {
    return isTeacher ? teacherCourses : studentCourses;
  };

  const refreshCourses = () => {
    setIsLoading(true);
    // Simular carga de datos
    setTimeout(() => {
      setTeacherCourses(mockTeacherCourses);
      setStudentCourses(mockStudentCourses);
      setIsLoading(false);
    }, 1000);
  };

  // Cargar datos iniciales
  React.useEffect(() => {
    refreshCourses();
  }, []);

  return (
    <CourseContext.Provider
      value={{
        teacherCourses,
        studentCourses,
        isLoading,
        selectedRole,
        setSelectedRole,
        getCurrentCourses,
        refreshCourses,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
};