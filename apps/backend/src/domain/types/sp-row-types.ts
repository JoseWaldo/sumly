import type { TransactionEntity } from "@/domain/entities/transaction.entity";
import type { FormaPagoEntity } from "@/domain/entities/forma-pago.entity";

export interface TransactionListRow {
  id: string;
  amount: string;
  date: string;
  description: string | null;
  categoryId: string;
  userId: string;
  formaPagoId: string | null;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    type: "INCOME" | "EXPENSE";
    icon: string;
    userId: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  formaPago: {
    id: string;
    nombre: string;
    tipo: string;
    ultimosCuatro: string | null;
    gradienteInicio: string;
    gradienteFin: string;
  } | null;
}

export interface CategoryListRow {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  icon: string;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionListRow {
  id: string;
  name: string;
  amount: string;
  nextPaymentDate: string;
  frequency: string;
  status: string;
  userId: string;
  formaPagoId: string;
  createdAt: string;
  updatedAt: string;
  formaPago: {
    id: string;
    nombre: string;
    tipo: string;
    ultimosCuatro: string | null;
    gradienteInicio: string;
    gradienteFin: string;
    entidadFinancieraId: string | null;
    entidadFinanciera: {
      id: string;
      nombre: string;
      formatoNumero: string | null;
    } | null;
  } | null;
  tags: {
    id: string;
    name: string;
    color: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
  }[];
}

export interface FormaPagoListRow {
  id: string;
  nombre: string;
  tipo: string;
  numeroEncriptado: string | null;
  ultimosCuatro: string | null;
  publico: boolean;
  gradienteInicio: string;
  gradienteFin: string;
  entidadFinancieraId: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  entidadFinanciera: {
    id: string;
    nombre: string;
    formatoNumero: string | null;
  } | null;
}

export interface EntidadFinancieraListRow {
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

export interface FileRecordListRow {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  s3Key: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FriendshipListRow {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "BLOCKED";
  blockedById: string | null;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
  otherUser: {
    id: string;
    name: string;
    image: string | null;
    email: string | null;
  };
}

export interface SpListResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DebtListRow {
  id: string;
  grupoId: string;
  direccion: "ME_DEBEN" | "YO_DEBO";
  descripcion: string;
  montoBase: string;
  fechaVencimiento: string;
  autoConfirmar: boolean;
  acreedorUserId: string;
  deudorUserId: string | null;
  deudorNombreLibre: string | null;
  contraparteSnapshotNombre: string;
  contraparteSnapshotAvatar: string | null;
  espejoDeId: string | null;
  monto: string;
  saldoPendiente: string;
  estado: string;
  createdAt: string;
  updatedAt: string;
  abonos: {
    total: number;
    confirmado: number;
  };
  eventosCount: number;
}

export interface DebtAbonoRow {
  id: string;
  deudaId: string;
  monto: string;
  estado: "PENDIENTE_CONFIRMACION" | "CONFIRMADO" | "RECHAZADO";
  formaPagoId: string;
  formaPago: {
    id: string;
    nombre: string;
    tipo: string;
    ultimosCuatro: string | null;
    gradienteInicio: string;
    gradienteFin: string;
  } | null;
  comprobanteFileId: string | null;
  aiReviewStatus: string | null;
  aiReviewNota: string | null;
  confirmedAt: string | null;
  createdAt: string;
}

export interface DebtEventRow {
  id: string;
  deudaId: string;
  tipoEvento: string;
  actorUserId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}
