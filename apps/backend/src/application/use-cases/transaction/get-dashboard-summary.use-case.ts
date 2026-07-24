import type { ITransactionRepository } from "@/domain/repositories/transaction.repository";
import type { DashboardSummary } from "@/domain/repositories/transaction.repository";

export class GetDashboardSummaryUseCase {
  constructor(private readonly repository: ITransactionRepository) {}

  async execute(userId: string): Promise<DashboardSummary> {
    return this.repository.getDashboardSummary(userId);
  }
}
