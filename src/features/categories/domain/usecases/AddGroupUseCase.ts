// AddGroupUseCase.ts

import { Group } from "../entities/group";
import { CategoryRepository } from "../repositories/CategoryRepository";

export class AddGroupUseCase {
    constructor(private repo: CategoryRepository) {}

    async execute(number: number, category: string, student: string): Promise<void> {
        console.log("📂 [AddGroupUseCase] Creando miembro:", student);
        const id = `${category}-${student}-${number}`;

        // we make sure that the student is not already in the group
        const existingGroups = await this.repo.read<Group>('group', { id });
        if (existingGroups.length > 0) {
            throw new Error("El estudiante ya está en este grupo.");
        }

        await this.repo.insert<Group>("group", [{ id, number, category, student }]);
    }
}