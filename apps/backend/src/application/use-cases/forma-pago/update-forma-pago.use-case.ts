import type { IFormaPagoRepository } from "@/domain/repositories/forma-pago.repository";
import type { FormaPagoEntity } from "@/domain/entities/forma-pago.entity";
import type { UpdateFormaPagoDTO } from "@/application/dtos/forma-pago.dto";
import { NotFoundError, UnauthorizedError } from "@/shared/errors";
import { encrypt, extractLastFour } from "@/shared/utils/encryption";

export class UpdateFormaPagoUseCase {
  constructor(private readonly repository: IFormaPagoRepository) {}

  async execute(id: string, userId: string, data: UpdateFormaPagoDTO): Promise<FormaPagoEntity> {
    const formaPago = await this.repository.findById(id);
    if (!formaPago) {
      throw new NotFoundError("Forma de pago no encontrada");
    }

    if (formaPago.tipo === "CASH") {
      throw new UnauthorizedError("No puedes modificar la forma de pago Efectivo");
    }

    if (formaPago.userId !== userId) {
      throw new UnauthorizedError("No puedes modificar una forma de pago que no te pertenece");
    }

    const updateData: {
      nombre?: string;
      numeroEncriptado?: string;
      ultimosCuatro?: string;
      publico?: boolean;
      gradienteInicio?: string;
      gradienteFin?: string;
    } = {};

    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.numero !== undefined) {
      updateData.numeroEncriptado = encrypt(data.numero);
      updateData.ultimosCuatro = extractLastFour(data.numero);
    }
    if (data.publico !== undefined) updateData.publico = data.publico;
    if (data.gradienteInicio !== undefined) updateData.gradienteInicio = data.gradienteInicio;
    if (data.gradienteFin !== undefined) updateData.gradienteFin = data.gradienteFin;

    return this.repository.update(id, updateData);
  }
}
