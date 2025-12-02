// ActivityContext.tsx
import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import React, { createContext, useContext, useState } from "react";
import { Activity } from "../../domain/entities/activity";
import { Assessment } from "../../domain/entities/assessment";
import { Evaluation } from "../../domain/entities/evaluation";
import { AddActivityUseCase } from "../../domain/usecases/AddActivityUseCase";
import { AddAssessmentUseCase } from "../../domain/usecases/AddAssessmentUseCase";
import { AddEvaluationUseCase } from "../../domain/usecases/AddEvaluationUseCase";
import { DeleteActivityUseCase } from "../../domain/usecases/DeleteActivityUseCase";
import { DeleteAssessmentUseCase } from "../../domain/usecases/DeleteAssessmentUseCase";
import { DeleteEvaluationUseCase } from "../../domain/usecases/DeleteEvaluationUseCase";
import { GetActivitiesUseCase } from "../../domain/usecases/GetActivitiesUseCase";
import { GetAssessmentUseCase } from "../../domain/usecases/GetAssessmentUseCase";
import { GetEvaluationsUseCase } from "../../domain/usecases/GetEvaluationsUseCase";

type ActivityContextType = {
  // State
  activities: Activity[];
  selectedActivity: Activity | null;
  selectedAssessment: Assessment | null;
  assessments: Assessment[]; // Lista de assessments (criterios) de la actividad seleccionada
  evaluations: Evaluation[];
  activityAssessments: Map<string, boolean>; // Map de activityId -> tiene assessment

  // Activity operations
  refreshActivities: (categoryId: string) => Promise<void>;
  addActivity: (name: string, categoryId: string) => Promise<void>;
  deleteActivity: (name: string, categoryId: string) => Promise<void>;
  setSelectedActivity: (activity: Activity | null) => void;
  setSelectedAssessment: (assessment: Assessment | null) => void;
  hasAssessment: (activityId: string) => boolean;

  // Assessment operations (un assessment = un criterio)
  getAssessmentsForActivity: (activityId: string) => Promise<void>;
  addAssessment: (
    name: string,
    activityId: string,
    visibility: string, // "public" | "private"
    max: number
  ) => Promise<void>;
  deleteAssessment: (assessmentId: string) => Promise<void>;
  initializeAssessments: (activityId: string) => Promise<void>; // Crea los 4 criterios automáticamente

  // Evaluation operations
  getEvaluations: (filters: Partial<Evaluation>) => Promise<void>;
  addEvaluation: (
    assessmentId: string,
    evaluator: string,
    evaluated: string,
    group: number,
    categoryId: string,
    score: number
  ) => Promise<void>;
  deleteEvaluation: (evaluationId: string) => Promise<void>;

  // Statistics
  getActivityAverage: (activityId: string) => Promise<number>;
  getGroupAverage: (categoryId: string, group: number) => Promise<number>;
  getStudentAverage: (studentEmail: string, categoryId: string) => Promise<number>;
  getStudentDetailedScores: (
    studentEmail: string,
    categoryId: string,
    group: number
  ) => Promise<{ [criterio: string]: number }>;
};

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const di = useDI();
  const { user } = useAuth();

  // Use Cases
  const getActivitiesUC = di.resolve<GetActivitiesUseCase>(TOKENS.GetActivitiesUC);
  const addActivityUC = di.resolve<AddActivityUseCase>(TOKENS.AddActivityUC);
  const deleteActivityUC = di.resolve<DeleteActivityUseCase>(TOKENS.DeleteActivityUC);

  const getAssessmentUC = di.resolve<GetAssessmentUseCase>(TOKENS.GetAssessmentsUC);
  const addAssessmentUC = di.resolve<AddAssessmentUseCase>(TOKENS.AddAssessmentUC);
  const deleteAssessmentUC = di.resolve<DeleteAssessmentUseCase>(TOKENS.DeleteAssessmentUC);

  const getEvaluationsUC = di.resolve<GetEvaluationsUseCase>(TOKENS.GetEvaluationsUC);
  const addEvaluationUC = di.resolve<AddEvaluationUseCase>(TOKENS.AddEvaluationUC);
  const deleteEvaluationUC = di.resolve<DeleteEvaluationUseCase>(TOKENS.DeleteEvaluationUC);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [activityAssessments, setActivityAssessments] = useState<Map<string, boolean>>(new Map());

  // Helper function to check if activity has assessment
  const hasAssessment = (activityId: string): boolean => {
    return activityAssessments.get(activityId) || false;
  };

  // ==================== ACTIVITY OPERATIONS ====================

  const refreshActivities = async (categoryId: string): Promise<void> => {
    if (!user) return;
    try {
      const activitiesData = await getActivitiesUC.execute(categoryId);
      setActivities(activitiesData);
      
      // Check which activities have assessments
      const assessmentMap = new Map<string, boolean>();
      for (const activity of activitiesData) {
        if (activity.id) {
          try {
            const assessments = await getAssessmentUC.execute(activity.id);
            assessmentMap.set(activity.id, assessments.length > 0);
          } catch {
            assessmentMap.set(activity.id, false);
          }
        }
      }
      setActivityAssessments(assessmentMap);
    } catch (error) {
      console.error("Error refreshing activities:", error);
    }
  };

  const addActivity = async (name: string, categoryId: string): Promise<void> => {
    if (!user) return;
    try {
      await addActivityUC.execute(name, categoryId);
      await refreshActivities(categoryId);
    } catch (error) {
      console.error("Error adding activity:", error);
      throw error;
    }
  };

  const deleteActivity = async (name: string, categoryId: string): Promise<void> => {
    if (!user) return;
    try {
      await deleteActivityUC.execute(name, categoryId);
      await refreshActivities(categoryId);
      if (selectedActivity?.id === `${name}-${categoryId}`) {
        setSelectedActivity(null);
        setAssessments([]);
      }
    } catch (error) {
      console.error("Error deleting activity:", error);
      throw error;
    }
  };

  // ==================== ASSESSMENT OPERATIONS ====================
  // Un assessment = un criterio calificable

  const getAssessmentsForActivity = async (activityId: string): Promise<void> => {
    try {
      // Buscar todos los assessments (criterios) que pertenecen a esta actividad
      const allAssessments = await getAssessmentUC.execute(activityId);
      setAssessments(allAssessments);
    } catch (error) {
      console.error("Error getting assessments:", error);
      setAssessments([]);
    }
  };

  const addAssessment = async (
    name: string,
    activityId: string,
    visibility: string, // "public" | "private"
    max: number
  ): Promise<void> => {
    if (!user) return;
    try {
      await addAssessmentUC.execute(
        name,
        activityId,
        visibility,
        max
      );
      await getAssessmentsForActivity(activityId);
      
      // Refresh activities to update UI
      const categoryId = activityId.split('-').slice(1).join('-');
      await refreshActivities(categoryId);
    } catch (error) {
      console.error("Error adding assessment:", error);
      throw error;
    }
  };

  const initializeAssessments = async (activityId: string): Promise<void> => {
    if (!user) return;
    try {
      const criterios = ["Puntualidad", "Contribucion", "Compromiso", "Actitud"];
      const maxScore = 10; // Puntaje máximo por defecto
      const visibility = "public"; // Visibilidad pública por defecto

      for (const criterio of criterios) {
        await addAssessmentUC.execute(
          criterio,
          activityId,
          visibility,
          maxScore
        );
      }

      await getAssessmentsForActivity(activityId);
      
      // Refresh activities to update UI
      const categoryId = activityId.split('-').slice(1).join('-');
      await refreshActivities(categoryId);
    } catch (error) {
      console.error("Error initializing assessments:", error);
      throw error;
    }
  };

  const deleteAssessment = async (
    assessmentId: string
  ): Promise<void> => {
    if (!user) return;
    try {
      await deleteAssessmentUC.execute(assessmentId);
      setAssessments([]);
      
      // Refresh activities to update UI
      if (selectedActivity?.id) {
        const categoryId = selectedActivity.category;
        await refreshActivities(categoryId);
      }
    } catch (error) {
      console.error("Error deleting assessment:", error);
      throw error;
    }
  };

  // ==================== EVALUATION OPERATIONS ====================

  const getEvaluations = async (filters: Partial<Evaluation>): Promise<void> => {
    try {
      const evaluationsData = await getEvaluationsUC.execute(filters);
      setEvaluations(evaluationsData);
    } catch (error) {
      console.error("Error getting evaluations:", error);
    }
  };

  const addEvaluation = async (
    assessmentId: string,
    evaluator: string,
    evaluated: string,
    group: number,
    categoryId: string,
    score: number
  ): Promise<void> => {
    if (!user) return;
    try {
      await addEvaluationUC.execute(
        assessmentId,
        evaluator,
        evaluated,
        group,
        categoryId,
        score
      );
      // Refresh evaluations after adding
      await getEvaluations({ assessment: assessmentId });
    } catch (error) {
      console.error("Error adding evaluation:", error);
      throw error;
    }
  };

  const deleteEvaluation = async (evaluationId: string): Promise<void> => {
    if (!user) return;
    try {
      await deleteEvaluationUC.execute(evaluationId);
      // Remove from local state
      setEvaluations((prev) => prev.filter((e) => e.id !== evaluationId));
    } catch (error) {
      console.error("Error deleting evaluation:", error);
      throw error;
    }
  };

  // ==================== STATISTICS ====================

  const getActivityAverage = async (activityId: string): Promise<number> => {
    try {
      const assessments = await getAssessmentUC.execute(activityId);
      if (assessments.length === 0) return 0;

      // Obtener todas las evaluaciones de todos los assessments de esta actividad
      const allEvaluations: Evaluation[] = [];
      for (const assessment of assessments) {
        const evaluationsData = await getEvaluationsUC.execute({
          assessment: assessment.id,
        });
        allEvaluations.push(...evaluationsData);
      }

      if (allEvaluations.length === 0) return 0;

      const total = allEvaluations.reduce((sum, e) => sum + e.score, 0);
      return total / allEvaluations.length;
    } catch (error) {
      console.error("Error getting activity average:", error);
      return 0;
    }
  };

  const getGroupAverage = async (
    categoryId: string,
    group: number
  ): Promise<number> => {
    try {
      const evaluationsData = await getEvaluationsUC.execute({
        category: categoryId,
        group,
      });

      if (evaluationsData.length === 0) return 0;

      const total = evaluationsData.reduce((sum, e) => sum + e.score, 0);
      return total / evaluationsData.length;
    } catch (error) {
      console.error("Error getting group average:", error);
      return 0;
    }
  };

  const getStudentAverage = async (
    studentEmail: string,
    categoryId: string
  ): Promise<number> => {
    try {
      const evaluationsData = await getEvaluationsUC.execute({
        evaluated: studentEmail,
        category: categoryId,
      });

      if (evaluationsData.length === 0) return 0;

      const total = evaluationsData.reduce((sum, e) => sum + e.score, 0);
      return total / evaluationsData.length;
    } catch (error) {
      console.error("Error getting student average:", error);
      return 0;
    }
  };

  const getStudentDetailedScores = async (
    studentEmail: string,
    categoryId: string,
    group: number
  ): Promise<{ [criterio: string]: number }> => {
    try {
      const evaluationsData = await getEvaluationsUC.execute({
        evaluated: studentEmail,
        category: categoryId,
        group,
      });

      const scoresByCriterio: { [criterio: string]: number[] } = {};

      evaluationsData.forEach((evaluation) => {
        // El assessment ID tiene formato: "criterio-activityId"
        // Extraer el nombre del criterio desde el assessment ID
        const criterio = evaluation.assessment.split('-')[0];
        
        if (!scoresByCriterio[criterio]) {
          scoresByCriterio[criterio] = [];
        }
        scoresByCriterio[criterio].push(evaluation.score);
      });

      // Calculate average per criterio
      const averages: { [criterio: string]: number } = {};
      Object.keys(scoresByCriterio).forEach((criterio) => {
        const scores = scoresByCriterio[criterio];
        averages[criterio] = scores.reduce((a, b) => a + b, 0) / scores.length;
      });

      return averages;
    } catch (error) {
      console.error("Error getting student detailed scores:", error);
      return {};
    }
  };

  return (
    <ActivityContext.Provider
      value={{
        activities,
        selectedActivity,
        selectedAssessment,
        assessments,
        evaluations,
        activityAssessments,
        hasAssessment,
        refreshActivities,
        addActivity,
        deleteActivity,
        setSelectedActivity,
        setSelectedAssessment,
        getAssessmentsForActivity,
        addAssessment,
        deleteAssessment,
        initializeAssessments,
        getEvaluations,
        addEvaluation,
        deleteEvaluation,
        getActivityAverage,
        getGroupAverage,
        getStudentAverage,
        getStudentDetailedScores,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error("useActivity must be used within an ActivityProvider");
  }
  return context;
}
