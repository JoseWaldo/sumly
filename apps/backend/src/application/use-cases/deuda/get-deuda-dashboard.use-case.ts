import type { IDeudaRepository, DeudaDashboard } from "@/domain/repositories/deuda.repository";

export class GetDeudaDashboardUseCase {
  constructor(private readonly repository: IDeudaRepository) {}

  async execute(userId: string): Promise<DeudaDashboard> {
    return this.repository.getDashboard(userId);
  }
}
