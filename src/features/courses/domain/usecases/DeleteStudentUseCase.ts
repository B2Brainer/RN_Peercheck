// DeleteCourseUseCase.ts

import { Student } from "../entities/Student";
import { CourseRepository } from "../repositories/CourseRepository";

export class DeleteStudentUseCase {
  constructor(private repo: CourseRepository) {}

  async execute(email: string, nrc: number): Promise<void> {
    console.log("🎓 [DeleteStudentUseCase] Eliminando estudiante:", email, "del curso:", nrc);
    const student = await this.repo.read<Student>("student",{email, nrc});
    // We make sure the student is enrolled in the course
    if (student.length === 0) {
      throw new Error("El estudiante no está inscrito en este curso.");
    }
    await this.repo.delete<Student>("student","id", student[0].id!);
  }
}

