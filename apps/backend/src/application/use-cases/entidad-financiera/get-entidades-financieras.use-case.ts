import type {
  IEntidadFinancieraRepository,
  FindEntidadesFinancierasFilters,
} from "@/domain/repositories/entidad-financiera.repository";
import type { PaginatedResult } from "@/shared/types";
import type { EntidadFinancieraEntity } from "@/domain/entities/entidad-financiera.entity";

export class GetEntidadesFinancierasUseCase {
  constructor(private readonly repository: IEntidadFinancieraRepository) {}

  async execute(filters: FindEntidadesFinancierasFilters): Promise<PaginatedResult<EntidadFinancieraEntity>> {
    return this.repository.findAllByUser(filters);
  }
}
