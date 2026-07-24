import { z } from "zod";

export const formaPagoFormSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50),
  tipo: z.enum(["CREDIT", "DEBIT"], {
    message: "Selecciona el tipo",
  }),
  numero: z.string().min(1, "El numero es requerido").max(50),
  publico: z.boolean(),
  gradienteInicio: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color invalido"),
  gradienteFin: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color invalido"),
  entidadFinancieraId: z.string().nullable(),
});

export type FormaPagoFormInput = z.infer<typeof formaPagoFormSchema>;

export function formatWithPattern(digits: string, pattern: string | null): string {
  if (!pattern) return digits;
  const cleaned = digits.replace(/\D/g, "");
  let result = "";
  let di = 0;
  for (const ch of pattern) {
    if (di >= cleaned.length) break;
    if (ch === "X") {
      result += cleaned[di++];
    } else {
      result += ch;
    }
  }
  return result;
}

export function unformat(value: string): string {
  return value.replace(/[\s-]/g, "");
}

export type FormaPagoTipo = "CREDIT" | "DEBIT" | "CASH";

export interface FormaPago {
  id: string;
  nombre: string;
  tipo: FormaPagoTipo;
  numeroEncriptado: string | null;
  ultimosCuatro: string | null;
  publico: boolean;
  gradienteInicio: string;
  gradienteFin: string;
  entidadFinancieraId: string | null;
  formatoNumero: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedFormasPago {
  data: FormaPago[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EntidadFinanciera {
  id: string;
  nombre: string;
  gradienteInicio: string;
  gradienteFin: string;
  formatoNumero: string | null;
  esSistema: boolean;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedEntidadesFinancieras {
  data: EntidadFinanciera[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
