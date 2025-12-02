// DeleteAssessmentUseCase.ts
import { Assessment } from "../entities/assessment";
import { Evaluation } from "../entities/evaluation";
import { ActivityRepository } from "../repositories/ActivityRepository";

export class DeleteAssessmentUseCase {
    constructor(private repo: ActivityRepository) {}

    async execute(assessmentId: string): Promise<void> {
        console.log("📊 [DeleteAssessmentUseCase] Eliminando assessment:", assessmentId);
        
        const assessment = await this.repo.read<Assessment>("assessment", { id: assessmentId });
        
        if (assessment.length === 0) {
            throw new Error("El assessment no existe.");
        }

        // Eliminar todas las evaluaciones del assessment
        const evaluations = await this.repo.read<Evaluation>("evaluation", { assessment: assessmentId });
        for (const evaluation of evaluations) {
            await this.repo.delete<Evaluation>("evaluation", "id", evaluation.id!);
        }

        // Eliminar el assessment
        await this.repo.delete<Assessment>("assessment", "id", assessmentId);
        
        // No es necesario actualizar Activity ya que hasAssessment se determina por existencia
    }
}
