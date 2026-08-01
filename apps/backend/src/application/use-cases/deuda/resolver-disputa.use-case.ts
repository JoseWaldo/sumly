import type { IDeudaRepository } from "@/domain/repositories/deuda.repository";
import type { DeudaEntity } from "@/domain/entities/deuda.entity";
import type { ResolverDisputaDTO } from "@/application/dtos/deuda.dto";
import { ValidationError, NotFoundError } from "@/shared/errors";

export class ResolverDisputaUseCase {
  constructor(private readonly deudaRepo: IDeudaRepository) {}

  async execute(userId: string, deudaId: string, dto: ResolverDisputaDTO): Promise<DeudaEntity> {
    const deuda = await this.deudaRepo.findById(deudaId);
    if (!deuda) throw new NotFoundError("Deuda no encontrada");

    const canonicalId = deuda.espejoDeId ?? deuda.id;
    const canonical = canonicalId !== deuda.id ? await this.deudaRepo.findById(canonicalId) : deuda;
    if (!canonical) throw new NotFoundError("Deuda no encontrada");

    if (userId !== canonical.acreedorUserId) {
      throw new ValidationError("Solo el acreedor puede resolver una disputa");
    }

    if (canonical.estado !== "DISPUTADA") {
      throw new ValidationError("La deuda no esta en estado de disputa");
    }

    if (dto.accion === "regresar_pendiente") {
      const updated = await this.deudaRepo.updateEstado(canonicalId, "PENDIENTE");
      await this.deudaRepo.createEvento({
        deudaId: canonicalId,
        tipoEvento: "disputa_resuelta",
        actorUserId: userId,
        metadata: { accion: "regresar_pendiente" },
      });
      return updated;
    }

    if (dto.accion === "forzar_pagada") {
      // Find last rejected abono and confirm it
      const abonos = await this.deudaRepo.listAbonos(canonicalId);
      const abonoRechazado = abonos.find((a) => a.estado === "RECHAZADO");

      if (abonoRechazado) {
        // Reactivate the rejected abono as confirmed
        await this.deudaRepo.confirmarAbono(abonoRechazado.id);
      } else {
        // Force PAGADA without abono
        const updated = await this.deudaRepo.updateEstado(canonicalId, "PAGADA");
        await this.deudaRepo.updateSaldo(canonicalId, 0);
        await this.deudaRepo.createEvento({
          deudaId: canonicalId,
          tipoEvento: "disputa_resuelta",
          actorUserId: userId,
          metadata: { accion: "forzar_pagada", nota: "sin abono asociado" },
        });
        return updated;
      }
    }

    const updated = await this.deudaRepo.findById(canonicalId);
    return updated!;
  }
}
