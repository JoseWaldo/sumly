import type { IDeudaRepository } from "@/domain/repositories/deuda.repository";
import type { DeudaAbonoEntity } from "@/domain/entities/deuda.entity";
import { ValidationError, NotFoundError } from "@/shared/errors";

export class RechazarAbonoUseCase {
  constructor(private readonly deudaRepo: IDeudaRepository) {}

  async execute(userId: string, deudaId: string, abonoId: string): Promise<DeudaAbonoEntity> {
    const deuda = await this.deudaRepo.findById(deudaId);
    if (!deuda) throw new NotFoundError("Deuda no encontrada");

    const canonicalId = deuda.espejoDeId ?? deuda.id;
    const canonical = canonicalId !== deuda.id ? await this.deudaRepo.findById(canonicalId) : deuda;
    if (!canonical) throw new NotFoundError("Deuda no encontrada");

    if (userId !== canonical.acreedorUserId) {
      throw new ValidationError("Solo el acreedor puede rechazar un abono");
    }

    const abono = await this.deudaRepo.findAbonoById(abonoId);
    if (!abono || abono.deudaId !== canonicalId) {
      throw new NotFoundError("Abono no encontrado");
    }

    if (abono.estado !== "PENDIENTE_CONFIRMACION") {
      throw new ValidationError("El abono ya fue procesado");
    }

    return this.deudaRepo.rechazarAbono(abonoId);
  }
}
