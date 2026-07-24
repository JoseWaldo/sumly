import type { IEntidadFinancieraRepository } from "@/domain/repositories/entidad-financiera.repository";
import type { EntidadFinancieraEntity } from "@/domain/entities/entidad-financiera.entity";
import type { CreateEntidadFinancieraDTO } from "@/application/dtos/entidad-financiera.dto";

export class CreateEntidadFinancieraUseCase {
  constructor(private readonly repository: IEntidadFinancieraRepository) {}

  async execute(userId: string, data: CreateEntidadFinancieraDTO): Promise<EntidadFinancieraEntity> {
    return this.repository.create({
      nombre: data.nombre,
      gradienteInicio: data.gradienteInicio,
      gradienteFin: data.gradienteFin,
      formatoNumero: data.formatoNumero ?? null,
      userId,
    });
  }
}
