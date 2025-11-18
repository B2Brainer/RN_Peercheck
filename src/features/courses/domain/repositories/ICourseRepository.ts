// src/features/courses/domain/repositories/ICourseRepository.ts
import { Course } from "../entities/Course";

export interface CreateCourseRequest {
  name: string;
  nrc: number;
  teacher: string;
  category: string;
  maxStudents: number;
}

export interface ICourseRepository {
  getCourses(): Promise<Course[]>;
  getTeacherCourses(teacherEmail: string): Promise<Course[]>;
  getStudentCourses(userEmail: string): Promise<Course[]>;
  addCourse(course: CreateCourseRequest): Promise<void>;
  enrollUser(courseId: string, userEmail: string): Promise<void>;
  unenrollUser(courseId: string, userEmail: string): Promise<void>;
  deleteCourse(courseId: string): Promise<void>;
}