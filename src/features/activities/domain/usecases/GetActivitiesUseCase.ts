// GetActivitiesUseCase.ts
import { Activity } from '../entities/activity';
import { ActivityRepository } from '../repositories/ActivityRepository';

export class GetActivitiesUseCase {
    constructor(private repo: ActivityRepository) {}

    async execute(category: string): Promise<Activity[]> {
        console.log("📋 [GetActivitiesUseCase] Obteniendo actividades de categoría:", category);
        return await this.repo.read<Activity>("activity", { category });
    }
}
