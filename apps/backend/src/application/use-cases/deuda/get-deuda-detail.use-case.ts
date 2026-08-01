import type { IDeudaRepository } from "@/domain/repositories/deuda.repository";
import type { DeudaEntity, DeudaGrupoEntity } from "@/domain/entities/deuda.entity";
import { NotFoundError } from "@/shared/errors";

export class GetDeudaDetailUseCase {
  constructor(private readonly repository: IDeudaRepository) {}

  async execute(id: string): Promise<DeudaEntity & { grupo: DeudaGrupoEntity }> {
    const deuda = await this.repository.findByIdWithGrupo(id);
    if (!deuda) {
      throw new NotFoundError("Deuda no encontrada");
    }
    return deuda;
  }
}
