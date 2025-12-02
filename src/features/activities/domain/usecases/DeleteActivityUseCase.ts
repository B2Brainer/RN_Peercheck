// DeleteActivityUseCase.ts
import { Activity } from "../entities/activity";
import { Assessment } from "../entities/assessment";
import { Evaluation } from "../entities/evaluation";
import { ActivityRepository } from "../repositories/ActivityRepository";

export class DeleteActivityUseCase {
    constructor(private repo: ActivityRepository) {}

    async execute(name: string, category: string): Promise<void> {
        console.log("📋 [DeleteActivityUseCase] Eliminando actividad:", name);
        const activityId = `${name}-${category}`;
        
        const activity = await this.repo.read<Activity>("activity", { id: activityId });
        
        if (activity.length === 0) {
            throw new Error("La actividad no existe.");
        }

        // Eliminar todos los assessments relacionados con esta actividad
        const assessments = await this.repo.read<Assessment>("assessment", { activity: activityId });
        for (const assessment of assessments) {
            // Eliminar todas las evaluaciones del assessment
            const evaluations = await this.repo.read<Evaluation>("evaluation", { assessment: assessment.id });
            for (const evaluation of evaluations) {
                await this.repo.delete<Evaluation>("evaluation", "id", evaluation.id!);
            }
            
            // Eliminar el assessment
            await this.repo.delete<Assessment>("assessment", "id", assessment.id!);
        }

        // Eliminar la actividad
        await this.repo.delete<Activity>("activity", "id", activityId);
    }
}
