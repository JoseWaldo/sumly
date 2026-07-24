import type { ICategoryRepository, FindCategoriesFilters } from "@/domain/repositories/category.repository";
import type { PaginatedResult } from "@/shared/types";
import type { CategoryEntity } from "@/domain/entities/category.entity";

export class GetCategoriesUseCase {
  constructor(private readonly repository: ICategoryRepository) {}

  async execute(filters: FindCategoriesFilters): Promise<PaginatedResult<CategoryEntity>> {
    return this.repository.findAllByUser(filters);
  }
}
