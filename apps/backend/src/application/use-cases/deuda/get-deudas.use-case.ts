import type { IDeudaRepository, FindDeudasFilters } from "@/domain/repositories/deuda.repository";
import type { PaginatedResult } from "@/shared/types";
import type { DeudaEntity } from "@/domain/entities/deuda.entity";

export class GetDeudasUseCase {
  constructor(private readonly repository: IDeudaRepository) {}

  async execute(filters: FindDeudasFilters): Promise<PaginatedResult<DeudaEntity>> {
    return this.repository.findAll(filters);
  }
}
