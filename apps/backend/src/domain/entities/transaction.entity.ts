import type { CategoryEntity } from "@/domain/entities/category.entity";

export interface TransactionEntity {
  id: string;
  amount: number;
  date: Date;
  description: string | null;
  categoryId: string;
  category?: CategoryEntity;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
