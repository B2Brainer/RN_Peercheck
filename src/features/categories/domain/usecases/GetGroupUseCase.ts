// GetGroupsUseCase.ts
import { Group } from "../entities/group";
import { CategoryRepository } from "../repositories/CategoryRepository";

export class GetGroupUseCase {
    constructor(private repo: CategoryRepository) {}

    async execute(category: string, number: number): Promise<Group[]> {
        console.log("📂 [GetGroupUseCase] Obteniendo grupo para la categoría:", category, "y número:", number);
        return await this.repo.read<Group>("group", { category, number });
    }
}   