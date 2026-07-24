import type { FormaPagoTipo } from "@/domain/entities/forma-pago.entity";

export type SubscriptionFrequency = "MONTHLY" | "YEARLY" | "QUARTERLY" | "BIWEEKLY" | "WEEKLY";
export type SubscriptionStatus = "ACTIVE" | "PAUSED" | "CANCELLED";

export interface SubscriptionTagEntity {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionFormaPagoEntity {
  id: string;
  nombre: string;
  tipo: FormaPagoTipo;
  ultimosCuatro: string | null;
  gradienteInicio: string;
  gradienteFin: string;
  formatoNumero: string | null;
  entidadFinancieraId: string | null;
  entidadFinancieraNombre: string | null;
}

export interface SubscriptionEntity {
  id: string;
  name: string;
  amount: number;
  nextPaymentDate: Date;
  frequency: SubscriptionFrequency;
  status: SubscriptionStatus;
  userId: string;
  formaPago: SubscriptionFormaPagoEntity;
  tags: SubscriptionTagEntity[];
  createdAt: Date;
  updatedAt: Date;
}
