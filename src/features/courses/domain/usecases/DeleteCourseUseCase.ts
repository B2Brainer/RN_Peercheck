// DeleteCourseUseCase.ts
import { Course } from "../entities/Course";
import { Student } from "../entities/Student";
import { CourseRepository } from "../repositories/CourseRepository";

export class DeleteCourseUseCase {
  constructor(private repo: CourseRepository) {}

  async execute(nrc: number): Promise<void> {
    console.log("🎓 [DeleteCourseUseCase] Eliminando curso:", nrc);

    // we delete all students enrolled in the course first
    const students = await this.repo.read<Student>("student", { nrc });
    for (const student of students) {
      await this.repo.delete<Student>("student", "id", student.id);
    }

    await this.repo.delete<Course>("course","nrc", nrc);
  }
}