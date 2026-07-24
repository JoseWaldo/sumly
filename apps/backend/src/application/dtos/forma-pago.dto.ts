import { z } from "zod";

export const createFormaPagoSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50),
  tipo: z.enum(["CREDIT", "DEBIT"], { required_error: "El tipo es requerido" }),
  numero: z.string().min(1, "El numero es requerido").max(50),
  publico: z.boolean().default(false),
  gradienteInicio: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color invalido, usa formato hex (#RRGGBB)"),
  gradienteFin: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color invalido, usa formato hex (#RRGGBB)"),
  entidadFinancieraId: z.string().nullable().optional().default(null),
});

export const updateFormaPagoSchema = z.object({
  nombre: z.string().min(2).max(50).optional(),
  numero: z.string().min(1).max(50).optional(),
  publico: z.boolean().optional(),
  gradienteInicio: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color invalido, usa formato hex (#RRGGBB)").optional(),
  gradienteFin: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color invalido, usa formato hex (#RRGGBB)").optional(),
});

export type CreateFormaPagoDTO = z.infer<typeof createFormaPagoSchema>;
export type UpdateFormaPagoDTO = z.infer<typeof updateFormaPagoSchema>;
