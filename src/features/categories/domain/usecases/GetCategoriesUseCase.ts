// GetCategoryUseCase.ts

import { Category } from "../entities/category";
import { CategoryRepository } from "../repositories/CategoryRepository";

export class GetCategoriesUseCase {
    constructor(private repo: CategoryRepository) {}

    async execute( nrc: number ): Promise<Category[]> {
        console.log("📂 [GetCategoriesUseCase] Obteniendo categorías con NRC:", nrc);
        return await this.repo.read<Category>("category", { nrc });
    }
}   