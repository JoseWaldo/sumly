import type { IFormaPagoRepository, FindFormasPagoFilters } from "@/domain/repositories/forma-pago.repository";
import type { PaginatedResult } from "@/shared/types";
import type { FormaPagoEntity } from "@/domain/entities/forma-pago.entity";

export class GetFormasPagoUseCase {
  constructor(private readonly repository: IFormaPagoRepository) {}

  async execute(filters: FindFormasPagoFilters): Promise<PaginatedResult<FormaPagoEntity>> {
    return this.repository.findAllByUser(filters);
  }
}
