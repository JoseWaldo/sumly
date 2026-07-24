import { prisma } from "@/db";
import type { PrismaClient, Prisma } from "@/prisma";
import type {
  ICategoryRepository,
  CreateCategoryInput,
  UpdateCategoryInput,
  FindCategoriesFilters,
} from "@/domain/repositories/category.repository";
import type { CategoryEntity } from "@/domain/entities/category.entity";
import type { PaginatedResult } from "@/shared/types";

export class CategoryPrismaRepository implements ICategoryRepository {
  private db: PrismaClient;

  constructor(client: PrismaClient = prisma) {
    this.db = client;
  }

  async findAllByUser(filters: FindCategoriesFilters): Promise<PaginatedResult<CategoryEntity>> {
    const where: Prisma.CategoryWhereInput = {
      OR: [{ userId: null }, { userId: filters.userId }],
      ...(filters.type && { type: filters.type }),
      ...(filters.search && { name: { contains: filters.search, mode: "insensitive" } }),
    };

    const [categories, total] = await Promise.all([
      this.db.category.findMany({
        where,
        orderBy: [{ userId: { sort: "asc", nulls: "first" } }, { name: "asc" }],
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.db.category.count({ where }),
    ]);

    return {
      data: categories.map(this.toEntity),
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    };
  }

  async findById(id: string): Promise<CategoryEntity | null> {
    const category = await this.db.category.findUnique({
      where: { id },
    });

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
    await this.db.category.delete({
      where: { id },
    });
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
