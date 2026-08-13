import { z } from "zod";

export const createDeudaSchema = z.object({
  direccion: z.enum(["ME_DEBEN", "YO_DEBO"], { required_error: "La direccion es requerida" }),
  descripcion: z.string().min(1, "La descripcion es requerida").max(500),
  montoBase: z.number().positive("El monto debe ser mayor a 0"),
  fechaVencimiento: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Fecha invalida" }),
  autoConfirmar: z.boolean().default(true),
  destinatarios: z
    .array(
      z.object({
        amigoId: z.string().optional(),
        nombreLibre: z.string().optional(),
        monto: z.number().positive("El monto debe ser mayor a 0"),
      })
    )
    .min(1, "Al menos un destinatario es requerido")
    .max(10, "Maximo 10 destinatarios por deuda"),
});

export const reportarAbonoSchema = z.object({
  monto: z.number().positive("El monto debe ser mayor a 0"),
  formaPagoId: z.string().min(1, "La forma de pago es requerida"),
  comprobanteFileId: z.string().optional(),
  idempotencyKey: z.string().uuid("Clave de idempotencia invalida"),
});

export const resolverDisputaSchema = z.object({
  accion: z.enum(["regresar_pendiente", "forzar_pagada"], { required_error: "La accion es requerida" }),
});

export type CreateDeudaDTO = z.infer<typeof createDeudaSchema>;
export type ReportarAbonoDTO = z.infer<typeof reportarAbonoSchema>;
export type ResolverDisputaDTO = z.infer<typeof resolverDisputaSchema>;
