// src/features/courses/domain/usecases/UnenrollUserUseCase.ts
import { ICourseRepository } from "../repositories/ICourseRepository";

/**
 * UseCase: Desinscribir un usuario de un curso
 */
export class UnenrollUserUseCase {
  constructor(private repository: ICourseRepository) {}

  async execute(courseId: string, userEmail: string): Promise<void> {
    console.log(
      "🎓 [UnenrollUserUseCase] Desinscribiendo usuario:",
      userEmail,
      "del curso:",
      courseId
    );
    await this.repository.unenrollUser(courseId, userEmail);
  }
}

