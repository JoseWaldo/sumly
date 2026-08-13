import type {
  DeudaEntity,
  DeudaGrupoEntity,
  DeudaAbonoEntity,
  DeudaEventoEntity,
  DeudaDireccion,
  DeudaEstado,
} from "@/domain/entities/deuda.entity";
import type { PaginatedResult } from "@/shared/types";

export interface CreateDeudaDestinatario {
  amigoId?: string;
  nombreLibre?: string;
  monto: number;
}

export interface CreateDeudaGrupoInput {
  autorId: string;
  direccion: DeudaDireccion;
  descripcion: string;
  montoBase: number;
  fechaVencimiento: Date;
  autoConfirmar: boolean;
  destinatarios: CreateDeudaDestinatario[];
}

export interface FindDeudasFilters {
  userId: string;
  direccion?: DeudaDireccion;
  estado?: DeudaEstado;
  search?: string;
  page: number;
  limit: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface DeudaDashboard {
  aFavor: number;
  enContra: number;
  proximasAVencer: DeudaEntity[];
}

export interface IDeudaRepository {
  createGrupo(input: CreateDeudaGrupoInput): Promise<{ grupo: DeudaGrupoEntity; deudas: DeudaEntity[] }>;

  findAll(filters: FindDeudasFilters): Promise<PaginatedResult<DeudaEntity>>;

  findById(id: string): Promise<DeudaEntity | null>;

  findByIdWithGrupo(id: string): Promise<(DeudaEntity & { grupo: DeudaGrupoEntity }) | null>;

  getDashboard(userId: string): Promise<DeudaDashboard>;

  createAbono(data: {
    deudaId: string;
    monto: number;
    formaPagoId: string;
    idempotencyKey: string;
    comprobanteFileId?: string;
  }): Promise<DeudaAbonoEntity>;

  findAbonoByKey(idempotencyKey: string): Promise<DeudaAbonoEntity | null>;

  findAbonoById(id: string): Promise<DeudaAbonoEntity | null>;

  confirmarAbono(abonoId: string): Promise<DeudaAbonoEntity>;

  rechazarAbono(abonoId: string): Promise<DeudaAbonoEntity>;

  listAbonos(deudaId: string): Promise<DeudaAbonoEntity[]>;

  listEventos(deudaId: string): Promise<DeudaEventoEntity[]>;

  cancelar(deudaId: string): Promise<DeudaEntity>;

  perdonar(deudaId: string): Promise<DeudaEntity>;

  hardDelete(deudaId: string): Promise<void>;

  updateEstado(deudaId: string, estado: DeudaEstado): Promise<DeudaEntity>;

  updateSaldo(deudaId: string, saldo: number): Promise<DeudaEntity>;

  createEvento(data: {
    deudaId: string;
    tipoEvento: string;
    actorUserId: string;
    metadata?: Record<string, unknown>;
  }): Promise<DeudaEventoEntity>;
}
