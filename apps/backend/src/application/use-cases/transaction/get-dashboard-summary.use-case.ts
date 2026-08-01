import type { ITransactionRepository } from "@/domain/repositories/transaction.repository";
import type { IMovimientoRepository } from "@/domain/repositories/movimiento.repository";
import type { DashboardSummary } from "@/domain/repositories/transaction.repository";

export class GetDashboardSummaryUseCase {
  constructor(
    private readonly txRepository: ITransactionRepository,
    private readonly movRepository: IMovimientoRepository
  ) {}

  async execute(userId: string): Promise<DashboardSummary> {
    const summary = await this.txRepository.getDashboardSummary(userId);
    const neutralNet = await this.movRepository.getNeutralNet(userId);

    return {
      ...summary,
      disponible: summary.balance + neutralNet,
    };
  }
}
