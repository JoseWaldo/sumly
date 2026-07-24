import type { IEntidadFinancieraRepository } from "@/domain/repositories/entidad-financiera.repository";
import type { EntidadFinancieraEntity } from "@/domain/entities/entidad-financiera.entity";
import type { UpdateEntidadFinancieraDTO } from "@/application/dtos/entidad-financiera.dto";
import { NotFoundError, UnauthorizedError } from "@/shared/errors";

export class UpdateEntidadFinancieraUseCase {
  constructor(private readonly repository: IEntidadFinancieraRepository) {}

  async execute(id: string, userId: string, data: UpdateEntidadFinancieraDTO): Promise<EntidadFinancieraEntity> {
    const entidad = await this.repository.findById(id);
    if (!entidad) {
      throw new NotFoundError("Entidad financiera no encontrada");
    }

    if (entidad.userId === null) {
      throw new UnauthorizedError("No puedes modificar una entidad del sistema");
    }

    if (entidad.userId !== userId) {
      throw new UnauthorizedError("No puedes modificar una entidad que no te pertenece");
    }

    return this.repository.update(id, {
      nombre: data.nombre,
      gradienteInicio: data.gradienteInicio,
      gradienteFin: data.gradienteFin,
      formatoNumero: data.formatoNumero,
    });
  }
}
