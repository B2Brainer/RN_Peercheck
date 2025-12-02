// DeleteGroupUseCase.ts

import { Group } from "../entities/group";
import { CategoryRepository } from "../repositories/CategoryRepository";

export class DeleteGroupUseCase {
    constructor (private repo: CategoryRepository) {}

    async execute(number: number, category: string, student: string): Promise<void> {
        console.log("📂 [DeleteGroupUseCase] Eliminando estudiante:", student, "grupo:", number, "en categoria:", category);
        const group = await this.repo.read<Group>("group",{number, category, student});

        // we make sure the student exist in the group
        if (group.length === 0) {
            throw new Error("no existe tal grupo en esa categoria");
        }
        
        await this.repo.delete<Group>("group","id", group[0].id!);
    }
}