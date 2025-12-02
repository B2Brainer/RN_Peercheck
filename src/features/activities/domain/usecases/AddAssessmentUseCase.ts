// AddAssessmentUseCase.ts
import { Activity } from '../entities/activity';
import { Assessment } from '../entities/assessment';
import { ActivityRepository } from '../repositories/ActivityRepository';

export class AddAssessmentUseCase {
    constructor(private repo: ActivityRepository) {}
  
    async execute(
        name: string,
        activity: string,
        visibility: string, // "public" | "private"
        max: number
    ): Promise<void> {
        console.log("📊 [AddAssessmentUseCase] Creando assessment:", name);

        const id = `${name}-${activity}`;

        // Verificar que el assessment no exista ya
        const existingAssessments = await this.repo.read<Assessment>('assessment', { id });
        if (existingAssessments.length > 0) {
            throw new Error("Ya existe un assessment con este nombre para esta actividad.");
        }

        // Verificar que la actividad existe
        const activities = await this.repo.read<Activity>('activity', { id: activity });
        if (activities.length === 0) {
            throw new Error("La actividad no existe.");
        }

        await this.repo.insert<Assessment>("assessment", [{ 
            id, 
            name, 
            activity,
            max,
            visibility
        }]);
    }
}
