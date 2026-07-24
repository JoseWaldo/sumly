import type { IFormaPagoRepository } from "@/domain/repositories/forma-pago.repository";
import { NotFoundError, UnauthorizedError } from "@/shared/errors";

export class DeleteFormaPagoUseCase {
  constructor(private readonly repository: IFormaPagoRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const formaPago = await this.repository.findById(id);
    if (!formaPago) {
      throw new NotFoundError("Forma de pago no encontrada");
    }

    if (formaPago.tipo === "CASH") {
      throw new UnauthorizedError("No puedes eliminar la forma de pago Efectivo");
    }

    if (formaPago.userId !== userId) {
      throw new UnauthorizedError("No puedes eliminar una forma de pago que no te pertenece");
    }

    await this.repository.delete(id);
  }
}
