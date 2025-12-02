// AddStudentUseCase.ts
import { Course } from "../entities/Course";
import { Student } from "../entities/Student";
import { CourseRepository } from "../repositories/CourseRepository";

export class AddStudentUseCase {
  constructor(private repo: CourseRepository) {}

  async execute(email: string, nrc: number): Promise<void> {
    console.log("🎓 [AddStudentUseCase] Inscribiendo usuario:", email, "en curso:", nrc);
    const id = `${email}-${nrc}`;

    // We make sure the student is not already enrolled in the course
    const existingStudents = await this.repo.read<Student>("student", { email, nrc });
    if (existingStudents.length > 0) {
      throw new Error("El estudiante ya está inscrito en este curso.");
    }

    // We make sure the course exists
    const courses = await this.repo.read<Course>("course", { nrc });
    if (courses.length === 0) {
      throw new Error("El curso no existe.");
    }
    await this.repo.insert<Student>("student", [{ id, email, nrc }]);
  }
}