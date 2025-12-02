// src/core/di/tokens.ts


export const TOKENS = {
  AuthDataSource: Symbol("AuthDataSource"),
  AuthRepo: Symbol("AuthRepo"),
  LoginUC: Symbol("LoginUC"),
  SignupUC: Symbol("SignupUC"),
  LogoutUC: Symbol("LogoutUC"),

  CourseDataSource: Symbol("CourseDataSource"),
  CourseRepo: Symbol("CourseRepo"),
  AddCourseUC: Symbol("AddCourseUseCase"),
  AddStudentUC: Symbol("AddStudentUseCase"),
  DeleteStudentUC: Symbol("DeleteStudentUseCase"),
  DeleteCourseUC: Symbol("DeleteCourseUseCase"),
  GetTeacherCoursesUC: Symbol("GetTeacherCoursesUseCase"),
  GetStudentCoursesUC: Symbol("GetStudentCoursesUseCase"),
  GetStudentsUC: Symbol("GetStudentsUseCase"),

  CategoryDataSource: Symbol("CategoryDataSource"),
  CategoryRepo: Symbol("CategoryRepo"),
  AddCategoryUC: Symbol("AddCategoryUseCase"),
  AddGroupUC: Symbol("AddGroupUseCase"),
  DeleteCategoryUC: Symbol("DeleteCategoryUseCase"),
  DeleteGroupUC: Symbol("DeleteGroupUseCase"),
  GetCategoriesUC: Symbol("GetCategoriesUseCase"),
  GetGroupUC: Symbol("GetGroupUseCase"),

  ActivityDataSource: Symbol("ActivityDataSource"),
  ActivityRepo: Symbol("ActivityRepo"),
  AddActivityUC: Symbol("AddActivityUseCase"),
  AddAssessmentUC: Symbol("AddAssessmentUseCase"),
  AddEvaluationUC: Symbol("AddEvaluationUseCase"),
  DeleteActivityUC: Symbol("DeleteActivityUseCase"),
  DeleteAssessmentUC: Symbol("DeleteAssessmentUseCase"),
  DeleteEvaluationUC: Symbol("DeleteEvaluationUseCase"),
  GetEvaluationsUC: Symbol("GetEvaluationsUseCase"),
  GetActivitiesUC: Symbol("GetActivitiesUseCase"),
  GetAssessmentsUC: Symbol("GetAssessmentsUseCase"),
};


