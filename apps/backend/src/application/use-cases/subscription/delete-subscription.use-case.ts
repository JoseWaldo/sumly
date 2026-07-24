import type { ISubscriptionRepository } from "@/domain/repositories/subscription.repository";
import { NotFoundError, UnauthorizedError } from "@/shared/errors";

export class DeleteSubscriptionUseCase {
  constructor(private readonly repository: ISubscriptionRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const subscription = await this.repository.findById(id);
    if (!subscription) {
      throw new NotFoundError("Suscripcion no encontrada");
    }

    if (subscription.userId !== userId) {
      throw new UnauthorizedError("No puedes eliminar una suscripcion que no te pertenece");
    }

    await this.repository.delete(id);
  }
}
