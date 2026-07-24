import type { ICategoryRepository } from "@/domain/repositories/category.repository";
import type { CategoryEntity } from "@/domain/entities/category.entity";
import type { CreateCategoryDTO } from "@/application/dtos/category.dto";

export class CreateCategoryUseCase {
  constructor(private readonly repository: ICategoryRepository) {}

  async execute(userId: string, data: CreateCategoryDTO): Promise<CategoryEntity> {
    return this.repository.create({
      name: data.name,
      type: data.type,
      icon: data.icon,
      userId,
    });
  }
}
