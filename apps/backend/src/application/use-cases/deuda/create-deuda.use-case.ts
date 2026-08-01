import type { IDeudaRepository } from "@/domain/repositories/deuda.repository";
import type { IFriendshipRepository } from "@/domain/repositories/friendship.repository";
import type { DeudaEntity } from "@/domain/entities/deuda.entity";
import type { CreateDeudaDTO } from "@/application/dtos/deuda.dto";
import { ValidationError } from "@/shared/errors";

export class CreateDeudaUseCase {
  constructor(
    private readonly deudaRepo: IDeudaRepository,
    private readonly friendshipRepo: IFriendshipRepository
  ) {}

  async execute(userId: string, dto: CreateDeudaDTO): Promise<{ deudas: DeudaEntity[] }> {
    const dests = dto.destinatarios;

    // Deduplicate: amigoId must be unique; nombreLibre must be unique
    const amigoIds = dests.filter((d) => d.amigoId).map((d) => d.amigoId!);
    const uniqueAmigos = new Set(amigoIds);
    if (uniqueAmigos.size !== amigoIds.length) {
      throw new ValidationError("Hay amigos duplicados en la seleccion");
    }

    const nombresLibres = dests.filter((d) => d.nombreLibre).map((d) => d.nombreLibre!);
    const uniqueNombres = new Set(nombresLibres);
    if (uniqueNombres.size !== nombresLibres.length) {
      throw new ValidationError("Hay destinatarios de texto libre duplicados");
    }

    // No self
    if (amigoIds.includes(userId)) {
      throw new ValidationError("No puedes seleccionarte a ti mismo como destinatario");
    }

    // Must not mix amigos and texto libre in same group
    const hasAmigos = dests.some((d) => !!d.amigoId);
    const hasNombresLibres = dests.some((d) => !!d.nombreLibre);

    if (hasAmigos && hasNombresLibres) {
      throw new ValidationError("No se pueden mezclar amigos y texto libre en la misma deuda. Crealas por separado.");
    }

    // For YO_DEBO, only amigos (since there's no mirror for free text... actually the spec allows YO_DEBO to texto libre)
    // Actually, YO_DEBO to texto libre makes sense: I owe money to "Juan Perez" (free text)
    // OK, allowed.

    // Validate friendships for amigos
    for (const amigoId of amigoIds) {
      const friendship = await this.friendshipRepo.findByPair(userId, amigoId);
      if (!friendship || friendship.status !== "ACCEPTED") {
        throw new ValidationError("Todos los destinatarios deben ser amigos aceptados");
      }
    }

    const fecha = new Date(dto.fechaVencimiento);

    const result = await this.deudaRepo.createGrupo({
      autorId: userId,
      direccion: dto.direccion,
      descripcion: dto.descripcion,
      montoBase: dto.montoBase,
      fechaVencimiento: fecha,
      autoConfirmar: dto.autoConfirmar,
      destinatarios: dests.map((d) => ({
        amigoId: d.amigoId,
        nombreLibre: d.nombreLibre,
        monto: d.monto,
      })),
    });

    return { deudas: result.deudas };
  }
}
