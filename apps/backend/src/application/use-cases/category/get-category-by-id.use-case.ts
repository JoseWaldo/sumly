import type { ICategoryRepository } from "@/domain/repositories/category.repository";
import type { CategoryEntity } from "@/domain/entities/category.entity";
import { NotFoundError } from "@/shared/errors";

export class GetCategoryByIdUseCase {
  constructor(private readonly repository: ICategoryRepository) {}

  async execute(id: string): Promise<CategoryEntity> {
    const category = await this.repository.findById(id);
    if (!category) {
      throw new NotFoundError("Categoria no encontrada");
    }
    return category;
  }
}
