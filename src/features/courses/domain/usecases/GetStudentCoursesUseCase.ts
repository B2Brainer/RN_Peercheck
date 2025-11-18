// src/features/courses/domain/usecases/GetStudentCoursesUseCase.ts
import { Course } from "../entities/Course";
import { ICourseRepository } from "../repositories/ICourseRepository";

export class GetStudentCoursesUseCase {
  constructor(private repository: ICourseRepository) {}

  async execute(userEmail: string): Promise<Course[]> {
    console.log("🎓 [GetStudentCoursesUseCase] Obteniendo cursos del estudiante:", userEmail);
    return await this.repository.getStudentCourses(userEmail);
  }
}