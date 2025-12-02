// DeleteCategoryUseCase.ts

import { Category } from "../entities/category";
import { Group } from "../entities/group";
import { CategoryRepository } from "../repositories/CategoryRepository";

export class DeleteCategoryUseCase {
    constructor(private repo: CategoryRepository) {}

    async execute(name: string, nrc: number): Promise<void> {
        console.log("📂 [DeleteCategoryUseCase] Eliminando categoría:", name);
        const category = await this.repo.read<Category>("category",{name, nrc});

        // we delete all groups related to this category
        const groups = await this.repo.read<Group>("group",{category: category[0].id});
        for (const group of groups) {
            await this.repo.delete<Group>("group","id", group.id!);
        }

        await this.repo.delete<Category>("category","id", category[0].id!);
    }
}