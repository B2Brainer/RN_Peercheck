// AddCategoryUseCase.ts
import { Category } from '../entities/category';
import { CategoryRepository } from '../repositories/CategoryRepository';

export class AddCategoryUseCase {
    constructor(private repo: CategoryRepository) {}
  
    async execute( name: string, random: boolean, nrc: number, max: number): Promise<void> {
        console.log("📂 [AddCategoryUseCase] Creando categoría:", name);

        const id = `${name}-${nrc}`;

        // we make sure that the category is not already existing
        const existingCategories = await this.repo.read<Category>('category', { id });
        if (existingCategories.length > 0) {
          throw new Error("La categoría ya existe en este curso.");
        }

        await this.repo.insert<Category>("category", [{ id, name, random, nrc, max }]);
    }
}   