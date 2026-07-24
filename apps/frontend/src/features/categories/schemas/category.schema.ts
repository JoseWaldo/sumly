import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50, "El nombre no puede exceder 50 caracteres"),
  type: z.enum(["INCOME", "EXPENSE"], {
    message: "Selecciona el tipo de categoria",
  }),
  icon: z.string().min(1, "Selecciona un icono"),
});

export type CategoryFormInput = z.infer<typeof categoryFormSchema>;

export type CategoryType = "INCOME" | "EXPENSE";

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon: string;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedCategories {
  data: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
