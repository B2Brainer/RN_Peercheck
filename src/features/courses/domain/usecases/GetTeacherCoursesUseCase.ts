// src/features/courses/domain/usecases/GetTeacherCoursesUseCase.ts
import { Course } from "../entities/Course";
import { CourseRepository } from "../repositories/CourseRepository";

export class GetTeacherCoursesUseCase {
  constructor(private repository: CourseRepository) {}

  async execute(email: string): Promise<Course[]> {
    console.log("🎓 [GetTeacherCoursesUseCase] Obteniendo cursos del profesor:", email);
    return await this.repository.read<Course>("course", { teacher: email });
  }
}