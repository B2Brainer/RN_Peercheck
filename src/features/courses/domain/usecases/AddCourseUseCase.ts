// src/features/courses/domain/usecases/AddCourseUseCase.ts
import { CreateCourseRequest, ICourseRepository } from "../repositories/ICourseRepository";

export class AddCourseUseCase {
  constructor(private repository: ICourseRepository) {}

  async execute(course: CreateCourseRequest): Promise<void> {
    console.log("🎓 [AddCourseUseCase] Creando curso:", course.name);
    await this.repository.addCourse(course);
  }
}