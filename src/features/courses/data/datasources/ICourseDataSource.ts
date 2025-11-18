// src/features/courses/data/datasources/ICourseDataSource.ts
import { Course, CreateCourseRequest } from "../../domain/entities/Course";

export interface ICourseDataSource {
  getCourses(): Promise<Course[]>;
  getTeacherCourses(teacherEmail: string): Promise<Course[]>;
  getStudentCourses(userEmail: string): Promise<Course[]>;
  addCourse(course: CreateCourseRequest): Promise<void>;
  enrollUser(courseId: string, userEmail: string): Promise<void>;
  unenrollUser(courseId: string, userEmail: string): Promise<void>;
  deleteCourse(courseId: string): Promise<void>;
}