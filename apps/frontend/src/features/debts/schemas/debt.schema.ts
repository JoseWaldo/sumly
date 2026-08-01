import { z } from "zod";

export const createDeudaSchema = z.object({
  direccion: z.enum(["ME_DEBEN", "YO_DEBO"]),
  descripcion: z.string().min(1, "La descripcion es requerida").max(500),
  montoBase: z.number({ message: "El monto debe ser un numero" }).positive("El monto debe ser mayor a 0"),
  fechaVencimiento: z.string().min(1, "La fecha de vencimiento es requerida"),
  autoConfirmar: z.boolean(),
  destinatarios: z
    .array(
      z.object({
        amigoId: z.string().optional(),
        nombreLibre: z.string().optional(),
        monto: z.number().positive("El monto debe ser mayor a 0"),
      })
    )
    .min(1, "Al menos un destinatario es requerido")
    .max(10, "Maximo 10 destinatarios"),
});

export const reportarAbonoSchema = z.object({
  monto: z.number({ message: "El monto debe ser un numero" }).positive("El monto debe ser mayor a 0"),
  formaPagoId: z.string().min(1, "La forma de pago es requerida"),
  comprobanteFileId: z.string().optional(),
});

export type CreateDeudaInput = z.infer<typeof createDeudaSchema>;
export type ReportarAbonoInput = z.infer<typeof reportarAbonoSchema>;

export interface Debt {
  id: string;
  grupoId: string;
  acreedorUserId: string;
  deudorUserId: string | null;
  deudorNombreLibre: string | null;
  contraparteSnapshotNombre: string;
  contraparteSnapshotAvatar: string | null;
  espejoDeId: string | null;
  monto: number;
  saldoPendiente: number;
  estado: DebtEstado;
  autoConfirmar: boolean;
  createdAt: string;
  updatedAt: string;
  abonos?: { total: number; confirmado: number };
  eventosCount?: number;
}

export type DebtEstado =
  | "PENDIENTE"
  | "ESPERANDO_CONFIRMACION"
  | "PAGADA"
  | "DISPUTADA"
  | "VENCIDA"
  | "CANCELADA"
  | "PERDONADA";

export interface DebtWithGrupo extends Debt {
  grupo: {
    id: string;
    autorId: string;
    direccion: "ME_DEBEN" | "YO_DEBO";
    descripcion: string;
    montoBase: number;
    fechaVencimiento: string;
    autoConfirmar: boolean;
  };
}

export interface Abono {
  id: string;
  deudaId: string;
  monto: number;
  estado: "PENDIENTE_CONFIRMACION" | "CONFIRMADO" | "RECHAZADO";
  formaPagoId: string;
  formaPago?: {
    id: string;
    nombre: string;
    tipo: string;
    ultimosCuatro: string | null;
    gradienteInicio: string;
    gradienteFin: string;
  };
  comprobanteFileId: string | null;
  aiReviewStatus: string | null;
  aiReviewNota: string | null;
  confirmedAt: string | null;
  createdAt: string;
}

export interface DebtEvent {
  id: string;
  deudaId: string;
  tipoEvento: string;
  actorUserId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface DebtDashboard {
  aFavor: number;
  enContra: number;
  proximasAVencer: Debt[];
}

export interface PaginatedDebts {
  data: Debt[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
