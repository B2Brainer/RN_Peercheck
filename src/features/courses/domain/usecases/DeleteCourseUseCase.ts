// src/features/courses/domain/usecases/DeleteCourseUseCase.ts
import { ICourseRepository } from "../repositories/ICourseRepository";

export class DeleteCourseUseCase {
  constructor(private repository: ICourseRepository) {}

  async execute(courseId: string): Promise<void> {
    console.log("🎓 [DeleteCourseUseCase] Eliminando curso:", courseId);
    await this.repository.deleteCourse(courseId);
  }
}