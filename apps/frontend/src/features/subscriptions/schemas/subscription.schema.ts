import { z } from "zod";

export const subscriptionFormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  amount: z.number({ message: "El monto debe ser un numero" }).positive("El monto debe ser mayor a 0"),
  nextPaymentDate: z.string().min(1, "La fecha es requerida"),
  frequency: z.enum(["MONTHLY", "YEARLY", "QUARTERLY", "BIWEEKLY", "WEEKLY"], {
    message: "La frecuencia es requerida",
  }),
  status: z.enum(["ACTIVE", "PAUSED", "CANCELLED"]),
  formaPagoId: z.string().min(1, "Selecciona una forma de pago"),
  tagIds: z.array(z.string()),
});

export type SubscriptionFormInput = z.infer<typeof subscriptionFormSchema>;

export const subscriptionTagFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color en formato hex (#RRGGBB)"),
});

export type SubscriptionTagFormInput = z.infer<typeof subscriptionTagFormSchema>;

export interface SubscriptionTag {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionFormaPago {
  id: string;
  nombre: string;
  tipo: "CREDIT" | "DEBIT" | "CASH";
  ultimosCuatro: string | null;
  gradienteInicio: string;
  gradienteFin: string;
  formatoNumero: string | null;
  entidadFinancieraId: string | null;
  entidadFinancieraNombre: string | null;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  nextPaymentDate: string;
  frequency: "MONTHLY" | "YEARLY" | "QUARTERLY" | "BIWEEKLY" | "WEEKLY";
  status: "ACTIVE" | "PAUSED" | "CANCELLED";
  userId: string;
  formaPago: SubscriptionFormaPago;
  tags: SubscriptionTag[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedSubscriptions {
  data: Subscription[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SubscriptionDashboardSummary {
  monthlyTotal: number;
  activeCount: number;
  upcomingPayments: Subscription[];
}
