// src/features/courses/domain/usecases/EnrollUserUseCase.ts
import { ICourseRepository } from "../repositories/ICourseRepository";

export class EnrollUserUseCase {
  constructor(private repository: ICourseRepository) {}

  async execute(courseId: string, userEmail: string): Promise<void> {
    console.log("🎓 [EnrollUserUseCase] Inscribiendo usuario:", userEmail, "en curso:", courseId);
    await this.repository.enrollUser(courseId, userEmail);
  }
}