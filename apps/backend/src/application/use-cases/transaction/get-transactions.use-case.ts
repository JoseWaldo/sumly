import type { ITransactionRepository, FindTransactionsFilters } from "@/domain/repositories/transaction.repository";
import type { PaginatedResult } from "@/shared/types";
import type { TransactionEntity } from "@/domain/entities/transaction.entity";

export class GetTransactionsUseCase {
  constructor(private readonly repository: ITransactionRepository) {}

  async execute(filters: FindTransactionsFilters): Promise<PaginatedResult<TransactionEntity>> {
    return this.repository.findAllByUser(filters);
  }
}
