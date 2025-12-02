// src/core/di/DIProvider.tsx
import { createContext, useContext, useMemo } from "react";
import { container } from "./container";
import { TOKENS } from "./tokens";

import { AuthRepositoryImpl } from "@/src/features/auth/data/datasources/AuthRepositoryImpl";
import { AuthRemoteDataSourceImpl } from "@/src/features/auth/data/datasources/remote/AuthRemoteDataSourceImp";
import { LoginUseCase } from "@/src/features/auth/domain/usecases/LoginUseCase";
import { LogoutUseCase } from "@/src/features/auth/domain/usecases/LogoutUseCase";
import { SignupUseCase } from "@/src/features/auth/domain/usecases/SignupUseCase";

import { ActivityRepositoryImpl } from "@/src/features/activities/data/datasources/ActivityRepositoryImpl";
import { ActivityRemoteDataSourceImpl } from "@/src/features/activities/data/datasources/remote/ActivityRemoteDataSourceImp";
import { AddActivityUseCase } from "@/src/features/activities/domain/usecases/AddActivityUseCase";
import { AddAssessmentUseCase } from "@/src/features/activities/domain/usecases/AddAssessmentUseCase";
import { AddEvaluationUseCase } from "@/src/features/activities/domain/usecases/AddEvaluationUseCase";
import { DeleteActivityUseCase } from "@/src/features/activities/domain/usecases/DeleteActivityUseCase";
import { DeleteAssessmentUseCase } from "@/src/features/activities/domain/usecases/DeleteAssessmentUseCase";
import { DeleteEvaluationUseCase } from "@/src/features/activities/domain/usecases/DeleteEvaluationUseCase";
import { GetActivitiesUseCase } from "@/src/features/activities/domain/usecases/GetActivitiesUseCase";
import { GetAssessmentUseCase } from "@/src/features/activities/domain/usecases/GetAssessmentUseCase";
import { GetEvaluationsUseCase } from "@/src/features/activities/domain/usecases/GetEvaluationsUseCase";
import { CategoryRepositoryImpl } from "@/src/features/categories/data/datasources/CategoryRepositoryimpl";
import { CategoryRemoteDataSourceImpl } from "@/src/features/categories/data/datasources/remote/CategoryRemoteDataSourceImp";
import { AddCategoryUseCase } from "@/src/features/categories/domain/usecases/AddCategoryUseCase";
import { AddGroupUseCase } from "@/src/features/categories/domain/usecases/AddGroupUseCase";
import { DeleteCategoryUseCase } from "@/src/features/categories/domain/usecases/DeleteCategoryUseCase";
import { DeleteGroupUseCase } from "@/src/features/categories/domain/usecases/DeleteGroupUseCase";
import { GetCategoriesUseCase } from "@/src/features/categories/domain/usecases/GetCategoriesUseCase";
import { GetGroupUseCase } from "@/src/features/categories/domain/usecases/GetGroupUseCase";
import { CourseRepositoryImpl } from "@/src/features/courses/data/datasources/CourseRepositoryImpl";
import { CourseRemoteDataSourceImpl } from "@/src/features/courses/data/datasources/remote/CourseRemoteDataSourceImp";
import { AddCourseUseCase } from "@/src/features/courses/domain/usecases/AddCourseUseCase";
import { AddStudentUseCase } from "@/src/features/courses/domain/usecases/AddStudentUseCase";
import { DeleteCourseUseCase } from "@/src/features/courses/domain/usecases/DeleteCourseUseCase";
import { DeleteStudentUseCase } from "@/src/features/courses/domain/usecases/DeleteStudentUseCase";
import { GetStudentCoursesUseCase } from "@/src/features/courses/domain/usecases/GetStudentCoursesUseCase";
import { GetStudentsUseCase } from "@/src/features/courses/domain/usecases/GetStudentsUseCase";
import { GetTeacherCoursesUseCase } from "@/src/features/courses/domain/usecases/GetTeacherCoursesUseCase";

const DIContext = createContext<typeof container | null>(null);

export function DIProvider({ children }: { children: React.ReactNode }) {
  const appContainer = useMemo(() => {
    const c = container;

    // 🔹 Casos de uso de autenticación
    const authDS = new AuthRemoteDataSourceImpl();
    const authRepo = new AuthRepositoryImpl(authDS);

    c.register(TOKENS.AuthDataSource, authDS)
      .register(TOKENS.AuthRepo, authRepo)
      .register(TOKENS.LoginUC, new LoginUseCase(authRepo))
      .register(TOKENS.SignupUC, new SignupUseCase(authRepo))
      .register(TOKENS.LogoutUC, new LogoutUseCase(authRepo));

    // 🔹 Casos de uso de cursos
    const CourseDS = new CourseRemoteDataSourceImpl();
    const courseRepo = new CourseRepositoryImpl(CourseDS);

    c.register(TOKENS.CourseDataSource, CourseDS)
      .register(TOKENS.CourseRepo, courseRepo)
      .register(TOKENS.GetTeacherCoursesUC, new GetTeacherCoursesUseCase(courseRepo))
      .register(TOKENS.GetStudentCoursesUC, new GetStudentCoursesUseCase(courseRepo))
      .register(TOKENS.AddCourseUC, new AddCourseUseCase(courseRepo))
      .register(TOKENS.AddStudentUC, new AddStudentUseCase(courseRepo))
      .register(TOKENS.DeleteStudentUC, new DeleteStudentUseCase(courseRepo))
      .register(TOKENS.DeleteCourseUC, new DeleteCourseUseCase(courseRepo))
      .register(TOKENS.GetStudentsUC, new GetStudentsUseCase(courseRepo));
    
    // 🔹 Casos de uso de categorías
    const CategoryDS = new CategoryRemoteDataSourceImpl(); 
    const categoryRepo = new CategoryRepositoryImpl(CategoryDS);
    
    c.register(TOKENS.CategoryDataSource, CategoryDS)
      .register(TOKENS.CategoryRepo, categoryRepo)
      .register(TOKENS.GetCategoriesUC, new GetCategoriesUseCase(categoryRepo))
      .register(TOKENS.GetGroupUC, new GetGroupUseCase(categoryRepo))
      .register(TOKENS.AddCategoryUC, new AddCategoryUseCase(categoryRepo))
      .register(TOKENS.DeleteCategoryUC, new DeleteCategoryUseCase(categoryRepo))
      .register(TOKENS.AddGroupUC, new AddGroupUseCase(categoryRepo))
      .register(TOKENS.DeleteGroupUC, new DeleteGroupUseCase(categoryRepo));

    // 🔹 Casos de uso de actividades
    const ActivityDS = new ActivityRemoteDataSourceImpl();
    const activityRepo = new ActivityRepositoryImpl(ActivityDS);

    c.register(TOKENS.ActivityDataSource, ActivityDS)
      .register(TOKENS.ActivityRepo, activityRepo)
      .register(TOKENS.GetActivitiesUC, new GetActivitiesUseCase(activityRepo))
      .register(TOKENS.GetAssessmentsUC, new GetAssessmentUseCase(activityRepo))
      .register(TOKENS.AddActivityUC, new AddActivityUseCase(activityRepo))
      .register(TOKENS.DeleteActivityUC, new DeleteActivityUseCase(activityRepo))
      .register(TOKENS.AddAssessmentUC, new AddAssessmentUseCase(activityRepo))
      .register(TOKENS.DeleteAssessmentUC, new DeleteAssessmentUseCase(activityRepo))
      .register(TOKENS.AddEvaluationUC, new AddEvaluationUseCase(activityRepo))
      .register(TOKENS.DeleteEvaluationUC, new DeleteEvaluationUseCase(activityRepo))
      .register(TOKENS.GetEvaluationsUC, new GetEvaluationsUseCase(activityRepo));
      
    return c;
  }, []);

  return (<DIContext.Provider value={appContainer}>{children}</DIContext.Provider>);
}

export function useDI() {
  const c = useContext(DIContext);
  if (!c) throw new Error("DIProvider missing");
  return c;
}


