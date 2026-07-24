import type { ISubscriptionRepository } from "@/domain/repositories/subscription.repository";
import type { SubscriptionDashboardSummary } from "@/domain/repositories/subscription.repository";

export class GetSubscriptionDashboardUseCase {
  constructor(private readonly repository: ISubscriptionRepository) {}

  async execute(userId: string): Promise<SubscriptionDashboardSummary> {
    return this.repository.getDashboardSummary(userId);
  }
}
