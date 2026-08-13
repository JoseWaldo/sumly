import type { IDeudaRepository } from "@/domain/repositories/deuda.repository";
import { ValidationError, NotFoundError } from "@/shared/errors";

export class EliminarDeudaUseCase {
  constructor(private readonly deudaRepo: IDeudaRepository) {}

  async execute(userId: string, deudaId: string): Promise<void> {
    const deuda = await this.deudaRepo.findById(deudaId);
    if (!deuda) throw new NotFoundError("Deuda no encontrada");

    if (deuda.acreedorUserId !== userId) {
      throw new ValidationError("Solo el acreedor puede eliminar la deuda");
    }

    await this.deudaRepo.hardDelete(deudaId);
  }
}
