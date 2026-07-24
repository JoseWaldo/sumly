import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50),
  type: z.enum(["INCOME", "EXPENSE"], {
    required_error: "El tipo es requerido",
  }),
  icon: z.string().min(1, "El icono es requerido"),
});

export const updateCategorySchema = z.object({
  name: z.string().min(2).max(50).optional(),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  icon: z.string().min(1).optional(),
});

export type CreateCategoryDTO = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDTO = z.infer<typeof updateCategorySchema>;
