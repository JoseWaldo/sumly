import type { IDeudaRepository } from "@/domain/repositories/deuda.repository";
import type { DeudaEventoEntity } from "@/domain/entities/deuda.entity";
import { NotFoundError } from "@/shared/errors";

export class GetDeudaEventosUseCase {
  constructor(private readonly repository: IDeudaRepository) {}

  async execute(deudaId: string): Promise<DeudaEventoEntity[]> {
    const deuda = await this.repository.findById(deudaId);
    if (!deuda) {
      throw new NotFoundError("Deuda no encontrada");
    }
    return this.repository.listEventos(deudaId);
  }
}
