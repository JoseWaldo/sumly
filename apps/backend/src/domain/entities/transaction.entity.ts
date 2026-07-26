import type { CategoryEntity } from "@/domain/entities/category.entity";
import type { FormaPagoEntity } from "@/domain/entities/forma-pago.entity";

export interface TransactionEntity {
  id: string;
  amount: number;
  date: Date;
  description: string | null;
  categoryId: string;
  category?: CategoryEntity;
  formaPagoId: string;
  formaPago?: Pick<FormaPagoEntity, "id" | "nombre" | "tipo" | "ultimosCuatro" | "gradienteInicio" | "gradienteFin">;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
