import type { IFormaPagoRepository } from "@/domain/repositories/forma-pago.repository";
import type { FormaPagoEntity } from "@/domain/entities/forma-pago.entity";
import { NotFoundError } from "@/shared/errors";

export class GetFormaPagoByIdUseCase {
  constructor(private readonly repository: IFormaPagoRepository) {}

  async execute(id: string, userId: string): Promise<FormaPagoEntity> {
    const formaPago = await this.repository.findById(id);
    if (!formaPago) {
      throw new NotFoundError("Forma de pago no encontrada");
    }
    if (formaPago.userId !== userId) {
      throw new NotFoundError("Forma de pago no encontrada");
    }
    return formaPago;
  }
}
