// src/features/courses/domain/usecases/GetStudentCoursesUseCase.ts
import { Course } from "../entities/Course";
import { Student } from "../entities/Student";
import { CourseRepository } from "../repositories/CourseRepository";

export class GetStudentCoursesUseCase {
  constructor(private repository: CourseRepository) {}

  async execute(email: string): Promise<Course[]> {
    console.log("🎓 [GetStudentCoursesUseCase] Obteniendo cursos del estudiante:", email);
    const students = await this.repository.read<Student>("student", { email });
    const courses: Course[] = [];
    for (const student of students) {
      const course = await this.repository.read<Course>("course", { nrc: student.nrc });
      courses.push(...course);
    }
    return courses;
  }
}