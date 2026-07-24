import type { ICategoryRepository } from "@/domain/repositories/category.repository";
import { NotFoundError, UnauthorizedError } from "@/shared/errors";

export class DeleteCategoryUseCase {
  constructor(private readonly repository: ICategoryRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const category = await this.repository.findById(id);
    if (!category) {
      throw new NotFoundError("Categoria no encontrada");
    }

    if (category.userId === null) {
      throw new UnauthorizedError("No puedes eliminar una categoria del sistema");
    }

    if (category.userId !== userId) {
      throw new UnauthorizedError("No puedes eliminar una categoria que no te pertenece");
    }

    await this.repository.delete(id);
  }
}
