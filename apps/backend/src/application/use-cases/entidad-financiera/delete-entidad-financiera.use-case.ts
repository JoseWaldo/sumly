import type { IEntidadFinancieraRepository } from "@/domain/repositories/entidad-financiera.repository";
import { NotFoundError, UnauthorizedError, ConflictError } from "@/shared/errors";

export class DeleteEntidadFinancieraUseCase {
  constructor(private readonly repository: IEntidadFinancieraRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const entidad = await this.repository.findById(id);
    if (!entidad) {
      throw new NotFoundError("Entidad financiera no encontrada");
    }

    if (entidad.userId === null) {
      throw new UnauthorizedError("No puedes eliminar una entidad del sistema");
    }

    if (entidad.userId !== userId) {
      throw new UnauthorizedError("No puedes eliminar una entidad que no te pertenece");
    }

    const formasPagoCount = await this.repository.countFormasPago(id);
    if (formasPagoCount > 0) {
      throw new ConflictError("No puedes eliminar una entidad que tiene formas de pago asociadas");
    }

    await this.repository.delete(id);
  }
}
