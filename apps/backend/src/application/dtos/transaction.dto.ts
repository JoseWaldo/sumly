import { z } from "zod";

export const createTransactionSchema = z.object({
  amount: z.number().positive("El monto debe ser mayor a 0"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Fecha invalida",
  }),
  description: z.string().max(255).optional(),
  categoryId: z.string().min(1, "La categoria es requerida"),
});

export const updateTransactionSchema = z.object({
  amount: z.number().positive("El monto debe ser mayor a 0").optional(),
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Fecha invalida",
    })
    .optional(),
  description: z.string().max(255).optional(),
  categoryId: z.string().min(1, "La categoria es requerida").optional(),
});

export type CreateTransactionDTO = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionDTO = z.infer<typeof updateTransactionSchema>;
