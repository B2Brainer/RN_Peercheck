// src/features/courses/data/datasources/local/LocalCourseDataSource.ts
import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { Course, createCourse } from "../../../domain/entities/Course";
import { CreateCourseRequest } from "../../../domain/repositories/ICourseRepository";
import { ICourseDataSource } from "../ICourseDataSource";

export class LocalCourseDataSource implements ICourseDataSource {
  private prefs: ILocalPreferences;
  private readonly COURSES_KEY = "courses_data";

  constructor() {
    this.prefs = LocalPreferencesAsyncStorage.getInstance();
  }

  async getCourses(): Promise<Course[]> {
    return await this.prefs.getAllEntries<Course>(this.COURSES_KEY);
  }

  async getTeacherCourses(teacherEmail: string): Promise<Course[]> {
    const courses = await this.getCourses();
    return courses.filter(course => course.teacher === teacherEmail);
  }

  async getStudentCourses(userEmail: string): Promise<Course[]> {
    const courses = await this.getCourses();
    return courses.filter(course => course.enrolledUsers.includes(userEmail));
  }

  async addCourse(courseData: CreateCourseRequest): Promise<void> {
    const courses = await this.getCourses();
    
    // Generar ID único (simulando backend)
    const newCourse: Course = {
      id: `course_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: courseData.name,
      nrc: courseData.nrc,
      teacher: courseData.teacher,
      category: courseData.category,
      enrolledUsers: [courseData.teacher], // El profesor se auto-inscribe
      maxStudents: courseData.maxStudents,
    };

    courses.push(newCourse);
    await this.prefs.replaceEntries(this.COURSES_KEY, courses);
  }

  async enrollUser(courseId: string, userEmail: string): Promise<void> {
    const courses = await this.getCourses();
    const courseIndex = courses.findIndex(course => course.id === courseId);
    
    if (courseIndex === -1) {
      throw new Error("Curso no encontrado");
    }

    if (courses[courseIndex].enrolledUsers.includes(userEmail)) {
      throw new Error("El usuario ya está inscrito en este curso");
    }

    if (courses[courseIndex].enrolledUsers.length >= courses[courseIndex].maxStudents) {
      throw new Error("El curso está lleno");
    }

    courses[courseIndex].enrolledUsers.push(userEmail);
    await this.prefs.replaceEntries(this.COURSES_KEY, courses);
  }

  async unenrollUser(courseId: string, userEmail: string): Promise<void> {
    const courses = await this.getCourses();
    const courseIndex = courses.findIndex(course => course.id === courseId);
    
    if (courseIndex === -1) {
      throw new Error("Curso no encontrado");
    }

    courses[courseIndex].enrolledUsers = courses[courseIndex].enrolledUsers.filter(
      email => email !== userEmail
    );
    
    await this.prefs.replaceEntries(this.COURSES_KEY, courses);
  }

  async deleteCourse(courseId: string): Promise<void> {
    const courses = await this.getCourses();
    const filteredCourses = courses.filter(course => course.id !== courseId);
    await this.prefs.replaceEntries(this.COURSES_KEY, filteredCourses);
  }

  // Método para inicializar datos de prueba (opcional)
  async seedMockData(): Promise<void> {
    const existingCourses = await this.getCourses();
    if (existingCourses.length === 0) {
      const mockCourses: Course[] = [
        createCourse({
          id: '1',
          name: 'Programación Móvil',
          nrc: 12345,
          teacher: 'profesor@example.com',
          category: 'Tecnología',
          enrolledUsers: ['profesor@example.com', 'estudiante1@example.com', 'estudiante2@example.com'],
          maxStudents: 30,
        }),
        createCourse({
          id: '2',
          name: 'Base de Datos',
          nrc: 12346,
          teacher: 'profesor@example.com',
          category: 'Tecnología',
          enrolledUsers: ['profesor@example.com', 'estudiante1@example.com'],
          maxStudents: 25,
        }),
        createCourse({
          id: '3',
          name: 'Inteligencia Artificial',
          nrc: 12347,
          teacher: 'otroprofesor@example.com',
          category: 'Tecnología',
          enrolledUsers: ['usuario@example.com'],
          maxStudents: 20,
        }),
      ];
      await this.prefs.replaceEntries(this.COURSES_KEY, mockCourses);
    }
  }
}