import type { IEntidadFinancieraRepository } from "@/domain/repositories/entidad-financiera.repository";
import type { EntidadFinancieraEntity } from "@/domain/entities/entidad-financiera.entity";
import { NotFoundError } from "@/shared/errors";

export class GetEntidadFinancieraByIdUseCase {
  constructor(private readonly repository: IEntidadFinancieraRepository) {}

  async execute(id: string): Promise<EntidadFinancieraEntity> {
    const entidad = await this.repository.findById(id);
    if (!entidad) {
      throw new NotFoundError("Entidad financiera no encontrada");
    }
    return entidad;
  }
}
