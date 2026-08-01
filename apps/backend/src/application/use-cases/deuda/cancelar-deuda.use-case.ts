import type { IDeudaRepository } from "@/domain/repositories/deuda.repository";
import type { DeudaEntity } from "@/domain/entities/deuda.entity";
import { ValidationError, NotFoundError } from "@/shared/errors";

export class CancelarDeudaUseCase {
  constructor(private readonly deudaRepo: IDeudaRepository) {}

  async execute(userId: string, deudaId: string): Promise<DeudaEntity> {
    const deuda = await this.deudaRepo.findById(deudaId);
    if (!deuda) throw new NotFoundError("Deuda no encontrada");

    const canonicalId = deuda.espejoDeId ?? deuda.id;
    const canonical = canonicalId !== deuda.id ? await this.deudaRepo.findById(canonicalId) : deuda;
    if (!canonical) throw new NotFoundError("Deuda no encontrada");

    if (userId !== canonical.acreedorUserId) {
      throw new ValidationError("Solo el acreedor puede cancelar la deuda");
    }

    if (["PAGADA", "PERDONADA", "CANCELADA"].includes(canonical.estado)) {
      throw new ValidationError(`No se puede cancelar una deuda en estado ${canonical.estado}`);
    }

    return this.deudaRepo.cancelar(canonicalId);
  }
}
