export type CategoryType = "INCOME" | "EXPENSE";

export interface CategoryEntity {
  id: string;
  name: string;
  type: CategoryType;
  icon: string;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
