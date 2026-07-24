import type { ISubscriptionRepository, FindSubscriptionsFilters } from "@/domain/repositories/subscription.repository";
import type { PaginatedResult } from "@/shared/types";
import type { SubscriptionEntity } from "@/domain/entities/subscription.entity";

export class GetSubscriptionsUseCase {
  constructor(private readonly repository: ISubscriptionRepository) {}

  async execute(filters: FindSubscriptionsFilters): Promise<PaginatedResult<SubscriptionEntity>> {
    return this.repository.findAllByUser(filters);
  }
}
