import { z } from "zod";

export const createSubscriptionSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  amount: z.number().positive("El monto debe ser mayor a 0"),
  nextPaymentDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Fecha invalida",
  }),
  frequency: z.enum(["MONTHLY", "YEARLY", "QUARTERLY", "BIWEEKLY", "WEEKLY"], {
    required_error: "La frecuencia es requerida",
  }),
  status: z.enum(["ACTIVE", "PAUSED", "CANCELLED"]).optional().default("ACTIVE"),
  formaPagoId: z.string().min(1, "La forma de pago es requerida"),
  tagIds: z.array(z.string()).optional().default([]),
});

export const updateSubscriptionSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  amount: z.number().positive("El monto debe ser mayor a 0").optional(),
  nextPaymentDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Fecha invalida" })
    .optional(),
  frequency: z.enum(["MONTHLY", "YEARLY", "QUARTERLY", "BIWEEKLY", "WEEKLY"]).optional(),
  status: z.enum(["ACTIVE", "PAUSED", "CANCELLED"]).optional(),
  formaPagoId: z.string().min(1).optional(),
  tagIds: z.array(z.string()).optional(),
});

export const reportPaymentSchema = z.object({
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Fecha invalida" })
    .optional(),
});

export const createTagSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color invalido, usa formato hex (#RRGGBB)"),
});

export type CreateSubscriptionDTO = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionDTO = z.infer<typeof updateSubscriptionSchema>;
export type ReportPaymentDTO = z.infer<typeof reportPaymentSchema>;
export type CreateTagDTO = z.infer<typeof createTagSchema>;
