import type { FormaPagoEntity, FormaPagoTipo } from "@/domain/entities/forma-pago.entity";
import type { PaginatedResult } from "@/shared/types";

export interface FindFormasPagoFilters {
  userId: string;
  search?: string;
  page: number;
  limit: number;
}

export interface CreateFormaPagoInput {
  nombre: string;
  tipo: FormaPagoTipo;
  numeroEncriptado: string | null;
  ultimosCuatro: string | null;
  publico: boolean;
  gradienteInicio: string;
  gradienteFin: string;
  entidadFinancieraId: string | null;
  userId: string;
}

export interface UpdateFormaPagoInput {
  nombre?: string;
  numeroEncriptado?: string;
  ultimosCuatro?: string;
  publico?: boolean;
  gradienteInicio?: string;
  gradienteFin?: string;
}

export interface IFormaPagoRepository {
  findAllByUser(filters: FindFormasPagoFilters): Promise<PaginatedResult<FormaPagoEntity>>;
  findById(id: string): Promise<FormaPagoEntity | null>;
  findEfectivoByUser(userId: string): Promise<FormaPagoEntity | null>;
  create(data: CreateFormaPagoInput): Promise<FormaPagoEntity>;
  update(id: string, data: UpdateFormaPagoInput): Promise<FormaPagoEntity>;
  delete(id: string): Promise<void>;
  revealNumero(id: string, userId: string): Promise<string>;
}
