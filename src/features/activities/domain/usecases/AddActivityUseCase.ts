// AddActivityUseCase.ts
import { Activity } from '../entities/activity';
import { ActivityRepository } from '../repositories/ActivityRepository';

export class AddActivityUseCase {
    constructor(private repo: ActivityRepository) {}
  
    async execute(name: string, category: string): Promise<void> {
        console.log("� [AddActivityUseCase] Creando actividad:", name);

        const id = `${name}-${category}`;

        // Verificar que la actividad no exista ya
        const existingActivities = await this.repo.read<Activity>('activity', { id });
        if (existingActivities.length > 0) {
            throw new Error("Ya existe una actividad con este nombre en la categoría.");
        }

        await this.repo.insert<Activity>("activity", [{ 
            id, 
            name, 
            category 
        }]);
    }
}
