import { z } from "zod";

export const createEntidadFinancieraSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50),
  gradienteInicio: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color invalido, usa formato hex (#RRGGBB)"),
  gradienteFin: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color invalido, usa formato hex (#RRGGBB)"),
  formatoNumero: z.string().max(30).nullable().optional(),
});

export const updateEntidadFinancieraSchema = z.object({
  nombre: z.string().min(2).max(50).optional(),
  gradienteInicio: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color invalido, usa formato hex (#RRGGBB)").optional(),
  gradienteFin: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color invalido, usa formato hex (#RRGGBB)").optional(),
  formatoNumero: z.string().max(30).nullable().optional(),
});

export type CreateEntidadFinancieraDTO = z.infer<typeof createEntidadFinancieraSchema>;
export type UpdateEntidadFinancieraDTO = z.infer<typeof updateEntidadFinancieraSchema>;
