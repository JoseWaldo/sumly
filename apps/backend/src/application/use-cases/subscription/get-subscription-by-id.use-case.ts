import type { ISubscriptionRepository } from "@/domain/repositories/subscription.repository";
import type { SubscriptionEntity } from "@/domain/entities/subscription.entity";
import { NotFoundError } from "@/shared/errors";

export class GetSubscriptionByIdUseCase {
  constructor(private readonly repository: ISubscriptionRepository) {}

  async execute(id: string): Promise<SubscriptionEntity> {
    const subscription = await this.repository.findById(id);
    if (!subscription) {
      throw new NotFoundError("Suscripcion no encontrada");
    }
    return subscription;
  }
}
