// AddCourseUseCase.ts
import { Course } from "../entities/Course";
import { CourseRepository } from "../repositories/CourseRepository";

export class AddCourseUseCase {
  constructor(private repo: CourseRepository) {}

  async execute(nrc: number, name: string, teacher: string): Promise<void> {
    console.log("🎓 [AddCourseUseCase] Creando curso:", nrc);
    // we make sure that the teacher does not have more than 3 courses
    const courses = await this.repo.read<Course>("course", { teacher });
    if (courses.length >= 3) {
      throw new Error("El profesor ya tiene 3 cursos asignados.");
    }

    // We make sure tat the NRC is unique
    const existingCourses = await this.repo.read<Course>("course", { nrc });
    if (existingCourses.length > 0) {
      throw new Error("El NRC ya está en uso.");
    }
    
    await this.repo.insert<Course>("course", [{ nrc, name, teacher }]);
  }
}