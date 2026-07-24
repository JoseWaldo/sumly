import type { ISubscriptionRepository } from "@/domain/repositories/subscription.repository";
import type { SubscriptionEntity } from "@/domain/entities/subscription.entity";
import type { CreateSubscriptionDTO } from "@/application/dtos/subscription.dto";

export class CreateSubscriptionUseCase {
  constructor(private readonly repository: ISubscriptionRepository) {}

  async execute(userId: string, data: CreateSubscriptionDTO): Promise<SubscriptionEntity> {
    return this.repository.create({
      name: data.name,
      amount: data.amount,
      nextPaymentDate: new Date(data.nextPaymentDate),
      frequency: data.frequency,
      status: data.status ?? "ACTIVE",
      formaPagoId: data.formaPagoId,
      tagIds: data.tagIds ?? [],
      userId,
    });
  }
}
