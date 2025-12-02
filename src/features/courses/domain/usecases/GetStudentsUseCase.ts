import { Student } from "../../domain/entities/Student";
import { CourseRepository } from "../repositories/CourseRepository";

export class GetStudentsUseCase {
  constructor(private repository: CourseRepository) {}

  async execute(nrc: number): Promise<Student[]> {
    console.log("🎓 [GetStudentsUseCase] Obteniendo estudiantes del curso:", nrc);
    const students = await this.repository.read<Student>("student", { nrc });
    return students;
  }
}