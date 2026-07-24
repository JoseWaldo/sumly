import type { ISubscriptionRepository } from "@/domain/repositories/subscription.repository";
import type { SubscriptionEntity } from "@/domain/entities/subscription.entity";
import type { UpdateSubscriptionDTO } from "@/application/dtos/subscription.dto";
import { NotFoundError, UnauthorizedError } from "@/shared/errors";

export class UpdateSubscriptionUseCase {
  constructor(private readonly repository: ISubscriptionRepository) {}

  async execute(id: string, userId: string, data: UpdateSubscriptionDTO): Promise<SubscriptionEntity> {
    const subscription = await this.repository.findById(id);
    if (!subscription) {
      throw new NotFoundError("Suscripcion no encontrada");
    }

    if (subscription.userId !== userId) {
      throw new UnauthorizedError("No puedes modificar una suscripcion que no te pertenece");
    }

    return this.repository.update(id, {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.amount !== undefined && { amount: data.amount }),
      ...(data.nextPaymentDate !== undefined && { nextPaymentDate: new Date(data.nextPaymentDate) }),
      ...(data.frequency !== undefined && { frequency: data.frequency }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.formaPagoId !== undefined && { formaPagoId: data.formaPagoId }),
      ...(data.tagIds !== undefined && { tagIds: data.tagIds }),
    });
  }
}
