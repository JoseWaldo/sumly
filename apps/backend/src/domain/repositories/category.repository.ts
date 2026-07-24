import type { CategoryEntity, CategoryType } from "@/domain/entities/category.entity";
import type { PaginatedResult } from "@/shared/types";

export interface FindCategoriesFilters {
  userId: string;
  type?: CategoryType;
  search?: string;
  page: number;
  limit: number;
}

export interface ICategoryRepository {
  findAllByUser(filters: FindCategoriesFilters): Promise<PaginatedResult<CategoryEntity>>;
  findById(id: string): Promise<CategoryEntity | null>;
  create(data: CreateCategoryInput): Promise<CategoryEntity>;
  update(id: string, data: UpdateCategoryInput): Promise<CategoryEntity>;
  delete(id: string): Promise<void>;
}

export interface CreateCategoryInput {
  name: string;
  type: CategoryType;
  icon: string;
  userId: string;
}

export interface UpdateCategoryInput {
  name?: string;
  type?: CategoryType;
  icon?: string;
}
