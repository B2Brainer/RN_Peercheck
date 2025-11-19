// src/features/courses/presentation/context/CourseContext.tsx
import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Course } from "../../domain/entities/Course";
import { UserRole } from "../../domain/entities/UserRole";
import { AddCourseUseCase } from "../../domain/usecases/AddCourseUseCase";
import { DeleteCourseUseCase } from "../../domain/usecases/DeleteCourseUseCase";
import { EnrollUserUseCase } from "../../domain/usecases/EnrollUserUseCase";
import { GetStudentCoursesUseCase } from "../../domain/usecases/GetStudentCoursesUseCase";
import { GetTeacherCoursesUseCase } from "../../domain/usecases/GetTeacherCoursesUseCase";
import { UnenrollUserUseCase } from "../../domain/usecases/UnenrollUserUseCase";

interface CourseContextType {
  teacherCourses: Course[];
  studentCourses: Course[];
  isLoading: boolean;
  selectedRole: UserRole;
  setSelectedRole: (role: UserRole) => void;
  getCurrentCourses: () => Course[];
  refreshCourses: () => Promise<void>;
  addCourse: (name: string, nrc: number, category: string, maxStudents: number) => Promise<void>;
  enrollUser: (courseId: string) => Promise<void>;
  unenrollUser: (courseId: string) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const di = useDI();
  const { user, isLoggedIn } = useAuth();
  
  // Use Cases
  const getTeacherCoursesUC = di.resolve<GetTeacherCoursesUseCase>(TOKENS.GetTeacherCoursesUC);
  const getStudentCoursesUC = di.resolve<GetStudentCoursesUseCase>(TOKENS.GetStudentCoursesUC);
  const addCourseUC = di.resolve<AddCourseUseCase>(TOKENS.AddCourseUC);
  const enrollUserUC = di.resolve<EnrollUserUseCase>(TOKENS.EnrollUserUC);
  const deleteCourseUC = di.resolve<DeleteCourseUseCase>(TOKENS.DeleteCourseUC);
  const unenrollUserUC = di.resolve<UnenrollUserUseCase>(TOKENS.UnenrollUserUC);

  const [teacherCourses, setTeacherCourses] = useState<Course[]>([]);
  const [studentCourses, setStudentCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.PROFESOR);

  const getCurrentCourses = (): Course[] => {
    return selectedRole === UserRole.PROFESOR ? teacherCourses : studentCourses;
  };

  const refreshCourses = async (): Promise<void> => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const [teacherCoursesData, studentCoursesData] = await Promise.all([
        getTeacherCoursesUC.execute(user.email),
        getStudentCoursesUC.execute(user.email),
      ]);
      
      setTeacherCourses(teacherCoursesData);
      setStudentCourses(studentCoursesData);
    } catch (error) {
      console.error('Error refreshing courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addCourse = async (
    name: string, 
    nrc: number, 
    category: string, 
    maxStudents: number
  ): Promise<void> => {
    if (!user) throw new Error('Usuario no autenticado');
    
    await addCourseUC.execute({
      name,
      nrc,
      teacher: user.email,
      category,
      maxStudents,
    });
    
    await refreshCourses();
  };

  const enrollUser = async (courseId: string): Promise<void> => {
    if (!user) throw new Error('Usuario no autenticado');
    
    await enrollUserUC.execute(courseId, user.email);
    await refreshCourses();
  };

  const unenrollUser = async (courseId: string): Promise<void> => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      await unenrollUserUC.execute(courseId, user.email);
      await refreshCourses();
    } catch (err) {
      // Manejamos error de forma similar a Flutter: log + rethrow para que la UI lo muestre
      console.error("Error unenrolling user:", err);
      throw err;
    }
  };

  const deleteCourse = async (courseId: string): Promise<void> => {
    await deleteCourseUC.execute(courseId);
    await refreshCourses();
  };

  // Cargar cursos cuando el usuario cambie
  useEffect(() => {
    if (isLoggedIn && user) {
      refreshCourses();
    } else {
      setTeacherCourses([]);
      setStudentCourses([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, user]);

  const value: CourseContextType = {
    teacherCourses,
    studentCourses,
    isLoading,
    selectedRole,
    setSelectedRole,
    getCurrentCourses,
    refreshCourses,
    addCourse,
    enrollUser,
    unenrollUser,
    deleteCourse,
  };

  return (
    <CourseContext.Provider value={value}>
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

