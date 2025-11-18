// src/features/courses/data/repositories/CourseRepositoryImpl.ts
import { Course } from "../../domain/entities/Course";
import { CreateCourseRequest, ICourseRepository } from "../../domain/repositories/ICourseRepository";
import { ICourseDataSource } from "../datasources/ICourseDataSource";

export class CourseRepositoryImpl implements ICourseRepository {
  constructor(private dataSource: ICourseDataSource) {}

  async getCourses(): Promise<Course[]> {
    return this.dataSource.getCourses();
  }

  async getTeacherCourses(teacherEmail: string): Promise<Course[]> {
    return this.dataSource.getTeacherCourses(teacherEmail);
  }

  async getStudentCourses(userEmail: string): Promise<Course[]> {
    return this.dataSource.getStudentCourses(userEmail);
  }

  async addCourse(course: CreateCourseRequest): Promise<void> {
    return this.dataSource.addCourse(course);
  }

  async enrollUser(courseId: string, userEmail: string): Promise<void> {
    return this.dataSource.enrollUser(courseId, userEmail);
  }

  async unenrollUser(courseId: string, userEmail: string): Promise<void> {
    return this.dataSource.unenrollUser(courseId, userEmail);
  }

  async deleteCourse(courseId: string): Promise<void> {
    return this.dataSource.deleteCourse(courseId);
  }
}