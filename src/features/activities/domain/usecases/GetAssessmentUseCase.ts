// GetAssessmentUseCase.ts
import { Assessment } from '../entities/assessment';
import { ActivityRepository } from '../repositories/ActivityRepository';

export class GetAssessmentUseCase {
    constructor(private repo: ActivityRepository) {}

    async execute(activity: string): Promise<Assessment[]> {
        console.log("📊 [GetAssessmentUseCase] Obteniendo assessments de actividad:", activity);
        const assessments = await this.repo.read<Assessment>("assessment", { activity });
        
        // Retornar todos los assessments (criterios) de la actividad
        return assessments;
    }
}
