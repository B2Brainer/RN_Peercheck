// src/features/courses/domain/usecases/GetTeacherCoursesUseCase.ts
import { Course } from "../entities/Course";
import { ICourseRepository } from "../repositories/ICourseRepository";

export class GetTeacherCoursesUseCase {
  constructor(private repository: ICourseRepository) {}

  async execute(teacherEmail: string): Promise<Course[]> {
    console.log("🎓 [GetTeacherCoursesUseCase] Obteniendo cursos del profesor:", teacherEmail);
    return await this.repository.getTeacherCourses(teacherEmail);
  }
}