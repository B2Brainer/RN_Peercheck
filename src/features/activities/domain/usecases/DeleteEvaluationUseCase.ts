// DeleteEvaluationUseCase.ts
import { Evaluation } from "../entities/evaluation";
import { ActivityRepository } from "../repositories/ActivityRepository";

export class DeleteEvaluationUseCase {
    constructor(private repo: ActivityRepository) {}

    async execute(evaluationId: string): Promise<void> {
        console.log("⭐ [DeleteEvaluationUseCase] Eliminando evaluación:", evaluationId);
        
        const evaluation = await this.repo.read<Evaluation>("evaluation", { id: evaluationId });
        
        if (evaluation.length === 0) {
            throw new Error("La evaluación no existe.");
        }

        await this.repo.delete<Evaluation>("evaluation", "id", evaluationId);
    }
}
