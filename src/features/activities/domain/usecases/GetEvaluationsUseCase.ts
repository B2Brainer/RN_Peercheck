// GetEvaluationsUseCase.ts
import { Evaluation } from '../entities/evaluation';
import { ActivityRepository } from '../repositories/ActivityRepository';

export class GetEvaluationsUseCase {
    constructor(private repo: ActivityRepository) {}

    async execute(filters: Partial<Evaluation>): Promise<Evaluation[]> {
        console.log("⭐ [GetEvaluationsUseCase] Obteniendo evaluaciones con filtros:", filters);
        return await this.repo.read<Evaluation>("evaluation", filters);
    }
}
