import type { ISubscriptionRepository } from "@/domain/repositories/subscription.repository";
import type { SubscriptionEntity } from "@/domain/entities/subscription.entity";
import type { ReportPaymentDTO } from "@/application/dtos/subscription.dto";
import { NotFoundError, UnauthorizedError } from "@/shared/errors";
import { prisma } from "@/db";

export class ReportPaymentUseCase {
  constructor(private readonly repository: ISubscriptionRepository) {}

  async execute(id: string, userId: string, data: ReportPaymentDTO): Promise<{ subscription: SubscriptionEntity }> {
    const subscription = await this.repository.findById(id);
    if (!subscription) {
      throw new NotFoundError("Suscripcion no encontrada");
    }

    if (subscription.userId !== userId) {
      throw new UnauthorizedError("No puedes reportar un pago de una suscripcion que no te pertenece");
    }

    const suscripcionesCategory = await prisma.category.findFirst({
      where: { name: "Suscripciones", userId: null },
    });

    if (!suscripcionesCategory) {
      throw new NotFoundError("Categoria Suscripciones no encontrada");
    }

    const paymentDate = data.date ? new Date(data.date) : new Date();

    await prisma.transaction.create({
      data: {
        amount: subscription.amount,
        date: paymentDate,
        description: subscription.name,
        categoryId: suscripcionesCategory.id,
        userId,
      },
    });

    const nextDate = this.calculateNextPaymentDate(
      subscription.nextPaymentDate,
      subscription.frequency
    );

    await this.repository.update(id, { nextPaymentDate: nextDate });

    const updated = await this.repository.findById(id);

    return { subscription: updated! };
  }

  private calculateNextPaymentDate(current: Date, frequency: string): Date {
    const next = new Date(current);
    switch (frequency) {
      case "MONTHLY":
        next.setMonth(next.getMonth() + 1);
        break;
      case "YEARLY":
        next.setFullYear(next.getFullYear() + 1);
        break;
      case "QUARTERLY":
        next.setMonth(next.getMonth() + 3);
        break;
      case "BIWEEKLY":
        next.setDate(next.getDate() + 14);
        break;
      case "WEEKLY":
        next.setDate(next.getDate() + 7);
        break;
    }
    return next;
  }
}
