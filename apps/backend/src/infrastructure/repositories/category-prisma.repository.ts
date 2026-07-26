import { prisma } from "@/db";
import type { PrismaClient } from "@/prisma";
import type {
  ICategoryRepository,
  CreateCategoryInput,
  UpdateCategoryInput,
  FindCategoriesFilters,
} from "@/domain/repositories/category.repository";
import type { CategoryEntity } from "@/domain/entities/category.entity";
import type { PaginatedResult } from "@/shared/types";
import type { CategoryListRow, SpListResult } from "@/domain/types/sp-row-types";

export class CategoryPrismaRepository implements ICategoryRepository {
  private db: PrismaClient;

  constructor(client: PrismaClient = prisma) {
    this.db = client;
  }

  async findAllByUser(filters: FindCategoriesFilters): Promise<PaginatedResult<CategoryEntity>> {
    const rows = await this.db.$queryRaw<[{ sp_list_tbl_categories: SpListResult<CategoryListRow> }]>`
      SELECT sp_list_tbl_categories(
        ${filters.userId}::TEXT,
        ${filters.search || null}::TEXT,
        ${filters.page}::INT,
        ${filters.limit}::INT,
        ${filters.sortBy || null}::TEXT,
        ${filters.sortDir || null}::TEXT,
        ${filters.type || null}::TEXT
      )
    `;

    const result = rows[0]?.sp_list_tbl_categories;

    if (!result) {
      return { data: [], total: 0, page: filters.page, limit: filters.limit, totalPages: 0 };
    }

    return {
      data: (result.data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        type: row.type,
        icon: row.icon,
        userId: row.userId,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      })),
      total: Number(result.total),
      page: filters.page,
      limit: filters.limit,
      totalPages: result.totalPages,
    };
  }

  async findById(id: string): Promise<CategoryEntity | null> {
    const category = await this.db.category.findUnique({ where: { id } });
    return category ? this.toEntity(category) : null;
  }

  async create(data: CreateCategoryInput): Promise<CategoryEntity> {
    const category = await this.db.category.create({
      data: {
        name: data.name,
        type: data.type,
        icon: data.icon,
        userId: data.userId,
      },
    });
    return this.toEntity(category);
  }

  async update(id: string, data: UpdateCategoryInput): Promise<CategoryEntity> {
    const category = await this.db.category.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.icon !== undefined && { icon: data.icon }),
      },
    });
    return this.toEntity(category);
  }

  async delete(id: string): Promise<void> {
    await this.db.category.delete({ where: { id } });
  }

  private toEntity(row: {
    id: string;
    name: string;
    type: "INCOME" | "EXPENSE";
    icon: string;
    userId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): CategoryEntity {
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      icon: row.icon,
      userId: row.userId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
