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

export interface SpListResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
