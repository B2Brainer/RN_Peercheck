// src/features/courses/presentation/context/CourseContext.tsx
import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Course } from "../../domain/entities/Course";
import { Student } from "../../domain/entities/Student";
import { AddCourseUseCase } from "../../domain/usecases/AddCourseUseCase";
import { AddStudentUseCase } from "../../domain/usecases/AddStudentUseCase";
import { DeleteCourseUseCase } from "../../domain/usecases/DeleteCourseUseCase";
import { DeleteStudentUseCase } from "../../domain/usecases/DeleteStudentUseCase";
import { GetStudentCoursesUseCase } from "../../domain/usecases/GetStudentCoursesUseCase";
import { GetStudentsUseCase } from "../../domain/usecases/GetStudentsUseCase";
import { GetTeacherCoursesUseCase } from "../../domain/usecases/GetTeacherCoursesUseCase";

type CourseContextType = {
  teacherCourses: Course[];
  studentCourses: Course[];
  students: Student[];
  course: Course | null;
  isProfesor: boolean;
  setIsProfesor: (value: boolean) => void;
  refreshCourses: () => Promise<void>;
  addCourse: (nrc: number, name: string, teacher: string) => Promise<void>;
  addStudent: (email: string, nrc: number) => Promise<void>;
  deleteCourse: (nrc: number) => Promise<void>;
  deleteStudent: (email: string, nrc: number) => Promise<void>;
  setDataCourse: (course: Course) => Promise<void>;
};

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function CourseProvider({ children }: { children: React.ReactNode }) {
  const di = useDI();
  const { user } = useAuth();
  
  // Use Cases
  const getTeacherCoursesUC = di.resolve<GetTeacherCoursesUseCase>(TOKENS.GetTeacherCoursesUC);
  const getStudentCoursesUC = di.resolve<GetStudentCoursesUseCase>(TOKENS.GetStudentCoursesUC);
  const addCourseUC = di.resolve<AddCourseUseCase>(TOKENS.AddCourseUC);
  const addStudentUC = di.resolve<AddStudentUseCase>(TOKENS.AddStudentUC);
  const deleteCourseUC = di.resolve<DeleteCourseUseCase>(TOKENS.DeleteCourseUC);
  const deleteStudentUC = di.resolve<DeleteStudentUseCase>(TOKENS.DeleteStudentUC);
  const getStudentsUC = di.resolve<GetStudentsUseCase>(TOKENS.GetStudentsUC);

  const [teacherCourses, setTeacherCourses] = useState<Course[]>([]);
  const [studentCourses, setStudentCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [isProfesor, setIsProfesor] = useState<boolean>(true);

  const refreshCourses = async (): Promise<void> => {
    if (!user) return;
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
    }
  };

  const addCourse = async ( nrc: number, name: string, email: string): Promise<void> => {
    if (!user) throw new Error('Usuario no autenticado');
    
    try {
    await addCourseUC.execute( nrc, name, email);
    await refreshCourses();
    } catch (e) {
      console.error("Error adding course:", e);
      throw e;
    }     
  };

  const addStudent = async (email: string, nrc: number): Promise<void> => {
    if (!user) throw new Error('Usuario no autenticado');
    
    try {
    await addStudentUC.execute( email, nrc );
    await refreshCourses();
    } catch (e) {
      console.error("Error adding student:", e);
      throw e;
    }
  };

  const deleteStudent = async ( email: string, nrc: number): Promise<void> => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      await deleteStudentUC.execute(email, nrc);
      await refreshCourses();
    } catch (e) {
      console.error("Error deleting student:", e);
      throw e;
    }
  };

  const deleteCourse = async (nrc: number): Promise<void> => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      await deleteCourseUC.execute(nrc);
      await refreshCourses();
    } catch (e) {
      console.error("Error deleting course:", e);
      throw e;
    }
  };

  const setDataCourse = async (course: Course): Promise<void> => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      const studentsData = await getStudentsUC.execute(course.nrc);
      setStudents(studentsData);
      setCourse(course);
    } catch (e) {
      console.error("Error getting students:", e);
      throw e;
    }
  };

  // Cargar cursos cuando el usuario cambie
  useEffect(() => {
    if ( user ) {
      refreshCourses();
    } else {
      setTeacherCourses([]);
      setStudentCourses([]);
    }
  },  [user]);

  return (
    <CourseContext.Provider value={{
      teacherCourses,
      studentCourses,
      students,
      course,
      isProfesor,
      setIsProfesor,
      refreshCourses,
      addCourse,
      addStudent,
      deleteCourse,
      deleteStudent,
      setDataCourse,
    }}>
      {children}
    </CourseContext.Provider>
  );
};

export function useCourse() {
  const ctx = useContext(CourseContext);
  if (!ctx) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return ctx;
};

