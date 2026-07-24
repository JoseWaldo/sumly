import type { EntidadFinancieraEntity } from "@/domain/entities/entidad-financiera.entity";
import type { PaginatedResult } from "@/shared/types";

export interface FindEntidadesFinancierasFilters {
  userId: string;
  search?: string;
  page: number;
  limit: number;
}

export interface CreateEntidadFinancieraInput {
  nombre: string;
  gradienteInicio: string;
  gradienteFin: string;
  formatoNumero?: string | null;
  userId: string;
}

export interface UpdateEntidadFinancieraInput {
  nombre?: string;
  gradienteInicio?: string;
  gradienteFin?: string;
  formatoNumero?: string | null;
}

export interface IEntidadFinancieraRepository {
  findAllByUser(filters: FindEntidadesFinancierasFilters): Promise<PaginatedResult<EntidadFinancieraEntity>>;
  findById(id: string): Promise<EntidadFinancieraEntity | null>;
  create(data: CreateEntidadFinancieraInput): Promise<EntidadFinancieraEntity>;
  update(id: string, data: UpdateEntidadFinancieraInput): Promise<EntidadFinancieraEntity>;
  delete(id: string): Promise<void>;
  countFormasPago(id: string): Promise<number>;
}
