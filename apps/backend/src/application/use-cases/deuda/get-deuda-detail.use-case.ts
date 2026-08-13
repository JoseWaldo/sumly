import type { IDeudaRepository } from "@/domain/repositories/deuda.repository";
import type { DeudaEntity, DeudaGrupoEntity, DeudaAbonoEntity } from "@/domain/entities/deuda.entity";
import { NotFoundError } from "@/shared/errors";

export class GetDeudaDetailUseCase {
  constructor(private readonly repository: IDeudaRepository) {}

  async execute(id: string): Promise<{ deuda: DeudaEntity & { grupo: DeudaGrupoEntity }; abonos: DeudaAbonoEntity[] }> {
    const deuda = await this.repository.findByIdWithGrupo(id);
    if (!deuda) {
      throw new NotFoundError("Deuda no encontrada");
    }
    // Abonos always live on the canonical row (espejo_de_id IS NULL)
    const canonicalId = deuda.espejoDeId ?? deuda.id;
    const abonos = await this.repository.listAbonos(canonicalId);
    return { deuda, abonos };
  }
}
