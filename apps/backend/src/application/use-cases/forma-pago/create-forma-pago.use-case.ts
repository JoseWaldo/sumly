import type { IFormaPagoRepository } from "@/domain/repositories/forma-pago.repository";
import type { FormaPagoEntity } from "@/domain/entities/forma-pago.entity";
import type { CreateFormaPagoDTO } from "@/application/dtos/forma-pago.dto";
import { encrypt, extractLastFour } from "@/shared/utils/encryption";

export class CreateFormaPagoUseCase {
  constructor(private readonly repository: IFormaPagoRepository) {}

  async execute(userId: string, data: CreateFormaPagoDTO): Promise<FormaPagoEntity> {
    const numeroEncriptado = encrypt(data.numero);
    const ultimosCuatro = extractLastFour(data.numero);

    return this.repository.create({
      nombre: data.nombre,
      tipo: data.tipo,
      numeroEncriptado,
      ultimosCuatro,
      publico: data.publico,
      gradienteInicio: data.gradienteInicio,
      gradienteFin: data.gradienteFin,
      entidadFinancieraId: data.entidadFinancieraId ?? null,
      userId,
    });
  }
}
