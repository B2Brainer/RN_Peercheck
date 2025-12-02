// AddEvaluationUseCase.ts
import { Assessment } from '../entities/assessment';
import { Evaluation } from '../entities/evaluation';
import { ActivityRepository } from '../repositories/ActivityRepository';

export class AddEvaluationUseCase {
    constructor(private repo: ActivityRepository) {}
  
    async execute(
        assessment: string,
        evaluator: string,
        evaluated: string,
        group: number,
        category: string,
        score: number
    ): Promise<void> {
        console.log("⭐ [AddEvaluationUseCase] Creando evaluación:", evaluator, "→", evaluated);

        // Validar que no sea auto-evaluación
        if (evaluator === evaluated) {
            throw new Error("No se permite la auto-evaluación.");
        }

        const id = `${assessment}-${evaluator}-${evaluated}`;

        // Verificar que no exista ya esta evaluación
        const existingEvaluations = await this.repo.read<Evaluation>('evaluation', { id });
        if (existingEvaluations.length > 0) {
            throw new Error("Ya evaluaste a este estudiante en este criterio.");
        }

        // Verificar que el assessment existe y obtener max
        const assessments = await this.repo.read<Assessment>('assessment', { id: assessment });
        if (assessments.length === 0) {
            throw new Error("El assessment no existe.");
        }

        const max = assessments[0].max;

        // Validar que el score esté en el rango correcto
        if (score < 0 || score > max) {
            throw new Error(`El puntaje debe estar entre 0 y ${max}.`);
        }

        await this.repo.insert<Evaluation>("evaluation", [{ 
            id,
            assessment,
            evaluator,
            evaluated,
            group,
            category,
            score
        }]);
    }
}
