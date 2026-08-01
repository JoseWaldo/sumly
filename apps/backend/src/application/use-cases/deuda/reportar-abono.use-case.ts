import type { IDeudaRepository } from "@/domain/repositories/deuda.repository";
import type { IFormaPagoRepository } from "@/domain/repositories/forma-pago.repository";
import type { DeudaAbonoEntity } from "@/domain/entities/deuda.entity";
import type { ReportarAbonoDTO } from "@/application/dtos/deuda.dto";
import { ValidationError, NotFoundError } from "@/shared/errors";

export class ReportarAbonoUseCase {
  constructor(
    private readonly deudaRepo: IDeudaRepository,
    private readonly formaPagoRepo: IFormaPagoRepository
  ) {}

  async execute(userId: string, deudaId: string, dto: ReportarAbonoDTO): Promise<DeudaAbonoEntity> {
    // Resolve canonical row
    const deuda = await this.deudaRepo.findById(deudaId);
    if (!deuda) throw new NotFoundError("Deuda no encontrada");

    const canonicalId = deuda.espejoDeId ?? deuda.id;
    const canonical = canonicalId !== deuda.id ? await this.deudaRepo.findById(canonicalId) : deuda;
    if (!canonical) throw new NotFoundError("Deuda no encontrada");

    // Determine payer
    const payerId = canonical.deudorUserId ?? canonical.acreedorUserId; // free-text: owner pays on behalf

    if (userId !== payerId) {
      throw new ValidationError("Solo el deudor puede reportar un abono");
    }

    if (dto.monto <= 0 || dto.monto > canonical.saldoPendiente) {
      throw new ValidationError(
        `El monto debe ser mayor a 0 y no superar el saldo pendiente (${canonical.saldoPendiente})`
      );
    }

    // Validate forma de pago belongs to payer
    const formaPago = await this.formaPagoRepo.findById(dto.formaPagoId);
    if (!formaPago || formaPago.userId !== payerId) {
      throw new ValidationError("La forma de pago no te pertenece");
    }

    // Check idempotency
    const existing = await this.deudaRepo.findAbonoByKey(dto.idempotencyKey);
    if (existing) return existing;

    // Create abono
    const abono = await this.deudaRepo.createAbono({
      deudaId: canonicalId,
      monto: dto.monto,
      formaPagoId: dto.formaPagoId,
      idempotencyKey: dto.idempotencyKey,
      comprobanteFileId: dto.comprobanteFileId,
    });

    // Event
    await this.deudaRepo.createEvento({
      deudaId: canonicalId,
      tipoEvento: "abono_reportado",
      actorUserId: userId,
      metadata: { abonoId: abono.id, monto: dto.monto },
    });

    // Auto-confirm if enabled
    if (canonical.autoConfirmar) {
      await this.deudaRepo.confirmarAbono(abono.id);
    } else {
      // Move to ESPERANDO_CONFIRMACION
      await this.deudaRepo.updateEstado(canonicalId, "ESPERANDO_CONFIRMACION");
    }

    return abono;
  }
}
