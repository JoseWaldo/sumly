import type { ICategoryRepository } from "@/domain/repositories/category.repository";
import type { CategoryEntity } from "@/domain/entities/category.entity";
import type { UpdateCategoryDTO } from "@/application/dtos/category.dto";
import { NotFoundError, UnauthorizedError } from "@/shared/errors";

export class UpdateCategoryUseCase {
  constructor(private readonly repository: ICategoryRepository) {}

  async execute(id: string, userId: string, data: UpdateCategoryDTO): Promise<CategoryEntity> {
    const category = await this.repository.findById(id);
    if (!category) {
      throw new NotFoundError("Categoria no encontrada");
    }

    if (category.userId === null) {
      throw new UnauthorizedError("No puedes modificar una categoria del sistema");
    }

    if (category.userId !== userId) {
      throw new UnauthorizedError("No puedes modificar una categoria que no te pertenece");
    }

    return this.repository.update(id, data);
  }
}
