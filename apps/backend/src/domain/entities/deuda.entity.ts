import type { BaseEntity } from "@/domain/entities/base.entity";

export type DeudaDireccion = "ME_DEBEN" | "YO_DEBO";
export type DeudaEstado =
  | "PENDIENTE"
  | "ESPERANDO_CONFIRMACION"
  | "PAGADA"
  | "DISPUTADA"
  | "VENCIDA"
  | "CANCELADA"
  | "PERDONADA";
export type DeudaAbonoEstado =
  | "PENDIENTE_CONFIRMACION"
  | "CONFIRMADO"
  | "RECHAZADO";

export interface DeudaGrupoEntity extends BaseEntity {
  autorId: string;
  direccion: DeudaDireccion;
  descripcion: string;
  montoBase: number;
  fechaVencimiento: Date;
  autoConfirmar: boolean;
}

export interface DeudaEntity extends BaseEntity {
  grupoId: string;
  grupo?: DeudaGrupoEntity;
  acreedorUserId: string;
  deudorUserId: string | null;
  deudorNombreLibre: string | null;
  contraparteSnapshotNombre: string;
  contraparteSnapshotAvatar: string | null;
  espejoDeId: string | null;
  monto: number;
  saldoPendiente: number;
  estado: DeudaEstado;
  autoConfirmar: boolean;
}

export interface DeudaAbonoEntity extends BaseEntity {
  deudaId: string;
  monto: number;
  estado: DeudaAbonoEstado;
  formaPagoId: string;
  comprobanteFileId: string | null;
  aiReviewStatus: string | null;
  aiReviewNota: string | null;
  idempotencyKey: string;
  confirmedAt: Date | null;
}

export interface DeudaEventoEntity {
  id: string;
  deudaId: string;
  tipoEvento: string;
  actorUserId: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
}
