// src/core/di/tokens.ts

// Lista unica de tokens para inyección de dependencias
export const TOKENS = {
  AuthRemoteDS: Symbol("AuthRemoteDS"),
  AuthLocalDS: Symbol("AuthLocalDS"),
  AuthRepo: Symbol("AuthRepo"),
  LoginUC: Symbol("LoginUC"),
  SignupUC: Symbol("SignupUC"),
  LogoutUC: Symbol("LogoutUC"),
  GetCurrentUserUC: Symbol("GetCurrentUserUC"),

  CourseDataSource: Symbol("CourseDataSource"),
  CourseRepo: Symbol("CourseRepository"),
  GetTeacherCoursesUC: Symbol("GetTeacherCoursesUseCase"),
  GetStudentCoursesUC: Symbol("GetStudentCoursesUseCase"),
  AddCourseUC: Symbol("AddCourseUseCase"),
  EnrollUserUC: Symbol("EnrollUserUseCase"),
  // Nuevo: UseCase para desinscribir usuario
  UnenrollUserUC: Symbol("UnenrollUserUseCase"),
  DeleteCourseUC: Symbol("DeleteCourseUseCase"),
};


