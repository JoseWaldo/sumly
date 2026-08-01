import { prisma } from "@/db";
import type { PrismaClient } from "@/prisma";
import type { IDeudaRepository, FindDeudasFilters, CreateDeudaGrupoInput, DeudaDashboard } from "@/domain/repositories/deuda.repository";
import type { DeudaEntity, DeudaGrupoEntity, DeudaAbonoEntity, DeudaEventoEntity, DeudaEstado } from "@/domain/entities/deuda.entity";
import type { PaginatedResult } from "@/shared/types";
import type { DebtListRow, SpListResult } from "@/domain/types/sp-row-types";

function toMoney(val: { toString(): string }): number {
  return Number(val);
}

export class DeudaPrismaRepository implements IDeudaRepository {
  private db: PrismaClient;

  constructor(client: PrismaClient = prisma) {
    this.db = client;
  }

  async createGrupo(input: CreateDeudaGrupoInput): Promise<{ grupo: DeudaGrupoEntity; deudas: DeudaEntity[] }> {
    return this.db.$transaction(async (tx) => {
      const grupoRow = await tx.deudaGrupo.create({
        data: {
          autorId: input.autorId,
          direccion: input.direccion,
          descripcion: input.descripcion,
          montoBase: input.montoBase,
          fechaVencimiento: input.fechaVencimiento,
          autoConfirmar: input.autoConfirmar,
        },
      });

      const grupo: DeudaGrupoEntity = {
        id: grupoRow.id,
        autorId: grupoRow.autorId,
        direccion: grupoRow.direccion as DeudaGrupoEntity["direccion"],
        descripcion: grupoRow.descripcion,
        montoBase: toMoney(grupoRow.montoBase),
        fechaVencimiento: grupoRow.fechaVencimiento,
        autoConfirmar: grupoRow.autoConfirmar,
        createdAt: grupoRow.createdAt,
        updatedAt: grupoRow.updatedAt,
      };

      const deudas: DeudaEntity[] = [];

      for (const dest of input.destinatarios) {
        const monto = dest.monto;
        const acreedorUserId = input.direccion === "ME_DEBEN" ? input.autorId : dest.amigoId;
        const deudorUserId = input.direccion === "ME_DEBEN" ? (dest.amigoId ?? null) : input.autorId;
        const deudorNombre = dest.nombreLibre ?? null;

        const esAmigo = !!dest.amigoId;
        let contraparteNombre: string;
        let contraparteAvatar: string | null = null;

        if (input.direccion === "ME_DEBEN") {
          if (esAmigo) {
            const amigo = await tx.user.findUniqueOrThrow({
              where: { id: dest.amigoId },
              select: { name: true, image: true },
            });
            contraparteNombre = amigo.name;
            contraparteAvatar = amigo.image;
          } else {
            contraparteNombre = deudorNombre!;
          }
        } else {
          const amigo = await tx.user.findUniqueOrThrow({
            where: { id: dest.amigoId },
            select: { name: true, image: true },
          });
          contraparteNombre = amigo.name;
          contraparteAvatar = amigo.image;
        }

        const deudaRow = await tx.deuda.create({
          data: {
            grupoId: grupo.id,
            acreedorId: acreedorUserId!,
            deudorId: deudorUserId,
            deudorNombreLibre: deudorNombre,
            contraparteSnapshotNombre: contraparteNombre,
            contraparteSnapshotAvatar: contraparteAvatar,
            monto,
            saldoPendiente: monto,
            estado: "PENDIENTE",
            autoConfirmar: input.autoConfirmar,
          },
        });

        await tx.movimiento.create({
          data: {
            userId: acreedorUserId!,
            tipo: "SALIDA",
            naturaleza: "NEUTRAL",
            monto,
            origenTipo: "DEUDA",
            origenId: deudaRow.id,
            editable: false,
          },
        });

        if (deudorUserId) {
          await tx.movimiento.create({
            data: {
              userId: deudorUserId,
              tipo: "ENTRADA",
              naturaleza: "NEUTRAL",
              monto,
              origenTipo: "DEUDA",
              origenId: deudaRow.id,
              editable: false,
            },
          });
        }

        if (esAmigo && dest.amigoId) {
          const creatorSnapshotN = await tx.user.findUniqueOrThrow({ where: { id: input.autorId }, select: { name: true, image: true } });
          await tx.deuda.create({
            data: {
              grupoId: grupo.id,
              acreedorId: dest.amigoId,
              deudorId: input.autorId,
              contraparteSnapshotNombre: creatorSnapshotN.name,
              contraparteSnapshotAvatar: creatorSnapshotN.image,
              espejoDeId: deudaRow.id,
              monto,
              saldoPendiente: monto,
              estado: "PENDIENTE",
              autoConfirmar: input.autoConfirmar,
            },
          });
        }

        await tx.deudaEvento.create({
          data: {
            deudaId: deudaRow.id,
            tipoEvento: "creada",
            actorUserId: input.autorId,
            metadata: {},
          },
        });

        deudas.push({
          id: deudaRow.id,
          grupoId: deudaRow.grupoId!,
          acreedorUserId: deudaRow.acreedorId,
          deudorUserId: deudaRow.deudorId,
          deudorNombreLibre: deudaRow.deudorNombreLibre,
          contraparteSnapshotNombre: deudaRow.contraparteSnapshotNombre,
          contraparteSnapshotAvatar: deudaRow.contraparteSnapshotAvatar,
          espejoDeId: deudaRow.espejoDeId,
          monto,
          saldoPendiente: monto,
          estado: deudaRow.estado as DeudaEstado,
          autoConfirmar: deudaRow.autoConfirmar,
          createdAt: deudaRow.createdAt,
          updatedAt: deudaRow.updatedAt,
        });
      }

      return { grupo, deudas };
    });
  }

  async findAll(filters: FindDeudasFilters): Promise<PaginatedResult<DeudaEntity>> {
    const rows = await this.db.$queryRaw<[{ sp_list_tbl_deudas: SpListResult<DebtListRow> }]>`
      SELECT sp_list_tbl_deudas(
        ${filters.userId}::TEXT,
        ${filters.search || null}::TEXT,
        ${filters.page}::INT,
        ${filters.limit}::INT,
        ${filters.sortBy || null}::TEXT,
        ${filters.sortDir || null}::TEXT,
        ${filters.direccion || null}::TEXT,
        ${filters.estado || null}::TEXT
      )
    `;

    const result = rows[0]?.sp_list_tbl_deudas;

    if (!result) {
      return { data: [], total: 0, page: filters.page, limit: filters.limit, totalPages: 0 };
    }

    return {
      data: (result.data ?? []).map((row) => this.listRowToEntity(row)),
      total: Number(result.total),
      page: filters.page,
      limit: filters.limit,
      totalPages: result.totalPages,
    };
  }

  async findById(id: string): Promise<DeudaEntity | null> {
    const row = await this.db.deuda.findUnique({ where: { id } });
    if (!row) return null;
    return this.toEntity(row);
  }

  async findByIdWithGrupo(id: string): Promise<(DeudaEntity & { grupo: DeudaGrupoEntity }) | null> {
    const row = await this.db.deuda.findUnique({
      where: { id },
      include: { grupo: true },
    });
    if (!row) return null;
    const entity = this.toEntity(row);
    if (!row.grupo) return null;
    return {
      ...entity,
      grupo: {
        id: row.grupo.id,
        autorId: row.grupo.autorId,
        direccion: row.grupo.direccion as DeudaGrupoEntity["direccion"],
        descripcion: row.grupo.descripcion,
        montoBase: toMoney(row.grupo.montoBase),
        fechaVencimiento: row.grupo.fechaVencimiento,
        autoConfirmar: row.grupo.autoConfirmar,
        createdAt: row.grupo.createdAt,
        updatedAt: row.grupo.updatedAt,
      },
    };
  }

  async getDashboard(userId: string): Promise<DeudaDashboard> {
    const deudas = await this.db.deuda.findMany({
      where: {
        OR: [
          { acreedorId: userId },
          { deudorId: userId, espejoDeId: null },
        ],
        estado: { in: ["PENDIENTE", "ESPERANDO_CONFIRMACION", "DISPUTADA"] },
      },
      include: { grupo: true },
      orderBy: { createdAt: "desc" },
    });

    const aFavor = deudas
      .filter((d) => d.acreedorId === userId)
      .reduce((sum, d) => sum + toMoney(d.saldoPendiente), 0);

    const enContra = deudas
      .filter((d) => d.deudorId === userId && d.espejoDeId === null)
      .reduce((sum, d) => sum + toMoney(d.saldoPendiente), 0);

    const ahora = new Date();
    const proxVenc = deudas
      .filter((d) => d.grupo && d.grupo.fechaVencimiento > ahora)
      .sort((a, b) => (a.grupo!.fechaVencimiento.getTime() - b.grupo!.fechaVencimiento.getTime()))
      .slice(0, 5);

    return {
      aFavor,
      enContra,
      proximasAVencer: proxVenc.map((d) => this.toEntity(d)),
    };
  }

  async createAbono(data: {
    deudaId: string;
    monto: number;
    formaPagoId: string;
    idempotencyKey: string;
    comprobanteFileId?: string;
  }): Promise<DeudaAbonoEntity> {
    try {
      const row = await this.db.deudaAbono.create({
        data: {
          deudaId: data.deudaId,
          monto: data.monto,
          estado: "PENDIENTE_CONFIRMACION",
          formaPagoId: data.formaPagoId,
          comprobanteFileId: data.comprobanteFileId ?? null,
          idempotencyKey: data.idempotencyKey,
        },
      });
      return this.toAbonoEntity(row);
    } catch (e: any) {
      if (e?.code === "P2002") {
        const existing = await this.db.deudaAbono.findUniqueOrThrow({
          where: { idempotencyKey: data.idempotencyKey },
        });
        return this.toAbonoEntity(existing);
      }
      throw e;
    }
  }

  async findAbonoByKey(idempotencyKey: string): Promise<DeudaAbonoEntity | null> {
    const row = await this.db.deudaAbono.findUnique({ where: { idempotencyKey } });
    if (!row) return null;
    return this.toAbonoEntity(row);
  }

  async findAbonoById(id: string): Promise<DeudaAbonoEntity | null> {
    const row = await this.db.deudaAbono.findUnique({ where: { id } });
    if (!row) return null;
    return this.toAbonoEntity(row);
  }

  async confirmarAbono(abonoId: string): Promise<DeudaAbonoEntity> {
    return this.db.$transaction(async (tx) => {
      const abono = await tx.deudaAbono.findUniqueOrThrow({
        where: { id: abonoId },
        include: { deuda: true },
      });

      if (abono.estado !== "PENDIENTE_CONFIRMACION") {
        throw new Error("El abono ya fue procesado");
      }

      const updated = await tx.deudaAbono.update({
        where: { id: abonoId },
        data: {
          estado: "CONFIRMADO",
          confirmedAt: new Date(),
        },
      });

      const deuda = abono.deuda;
      const nuevoSaldo = toMoney(deuda.saldoPendiente) - toMoney(abono.monto);
      await tx.deuda.update({
        where: { id: deuda.id },
        data: {
          saldoPendiente: nuevoSaldo,
          estado: nuevoSaldo <= 0 ? "PAGADA" : "PENDIENTE",
        },
      });

      await tx.movimiento.create({
        data: {
          userId: deuda.deudorId!,
          tipo: "SALIDA",
          naturaleza: "NEUTRAL",
          monto: abono.monto,
          origenTipo: "DEUDA",
          origenId: abono.id,
          editable: false,
        },
      });
      await tx.movimiento.create({
        data: {
          userId: deuda.acreedorId,
          tipo: "ENTRADA",
          naturaleza: "NEUTRAL",
          monto: abono.monto,
          origenTipo: "DEUDA",
          origenId: abono.id,
          editable: false,
        },
      });

      await this.syncMirrorTx(tx, deuda.id);

      await tx.deudaEvento.create({
        data: {
          deudaId: deuda.id,
          tipoEvento: "confirmada",
          actorUserId: deuda.acreedorId,
          metadata: { abonoId: abono.id, monto: String(abono.monto) },
        },
      });

      return this.toAbonoEntity(updated);
    });
  }

  async rechazarAbono(abonoId: string): Promise<DeudaAbonoEntity> {
    return this.db.$transaction(async (tx) => {
      const abono = await tx.deudaAbono.findUniqueOrThrow({
        where: { id: abonoId },
        include: { deuda: true },
      });

      const updated = await tx.deudaAbono.update({
        where: { id: abonoId },
        data: { estado: "RECHAZADO" },
      });

      await tx.deuda.update({
        where: { id: abono.deuda.id },
        data: { estado: "DISPUTADA" },
      });

      await this.syncMirrorTx(tx, abono.deuda.id);

      await tx.deudaEvento.create({
        data: {
          deudaId: abono.deuda.id,
          tipoEvento: "rechazada",
          actorUserId: abono.deuda.acreedorId,
          metadata: { abonoId: abono.id },
        },
      });

      return this.toAbonoEntity(updated);
    });
  }

  async listAbonos(deudaId: string): Promise<DeudaAbonoEntity[]> {
    const rows = await this.db.deudaAbono.findMany({
      where: { deudaId },
      include: { formaPago: true },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => this.toAbonoEntityWithFormaPago(r));
  }

  async listEventos(deudaId: string): Promise<DeudaEventoEntity[]> {
    const rows = await this.db.deudaEvento.findMany({
      where: { deudaId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => ({
      id: r.id,
      deudaId: r.deudaId,
      tipoEvento: r.tipoEvento,
      actorUserId: r.actorUserId,
      metadata: r.metadata as Record<string, unknown>,
      createdAt: r.createdAt,
    }));
  }

  async cancelar(deudaId: string): Promise<DeudaEntity> {
    return this.db.$transaction(async (tx) => {
      const deuda = await tx.deuda.findUniqueOrThrow({
        where: { id: deudaId },
        include: { abonos: true },
      });

      const hasConfirmados = deuda.abonos.some((a) => a.estado === "CONFIRMADO");
      if (hasConfirmados) {
        throw new Error("No se puede cancelar: la deuda tiene abonos confirmados");
      }

      const updated = await tx.deuda.update({
        where: { id: deudaId },
        data: { estado: "CANCELADA" },
      });

      const movs = await tx.movimiento.findMany({
        where: { origenTipo: "DEUDA", origenId: deudaId },
      });

      for (const mov of movs) {
        const tipoInverso = mov.tipo === "ENTRADA" ? "SALIDA" : "ENTRADA";
        await tx.movimiento.create({
          data: {
            userId: mov.userId,
            tipo: tipoInverso as "ENTRADA" | "SALIDA",
            naturaleza: "NEUTRAL",
            monto: mov.monto,
            origenTipo: "DEUDA",
            origenId: deudaId,
            reversaDeId: mov.id,
            editable: false,
          },
        });
      }

      await this.syncMirrorTx(tx, deudaId);

      await tx.deudaEvento.create({
        data: {
          deudaId,
          tipoEvento: "cancelada",
          actorUserId: deuda.acreedorId,
          metadata: {},
        },
      });

      return this.toEntity(updated);
    });
  }

  async perdonar(deudaId: string): Promise<DeudaEntity> {
    return this.db.$transaction(async (tx) => {
      const deuda = await tx.deuda.findUniqueOrThrow({ where: { id: deudaId } });

      const updated = await tx.deuda.update({
        where: { id: deudaId },
        data: { estado: "PERDONADA" },
      });

      await this.syncMirrorTx(tx, deudaId);

      await tx.deudaEvento.create({
        data: {
          deudaId,
          tipoEvento: "perdonada",
          actorUserId: deuda.acreedorId,
          metadata: {},
        },
      });

      return this.toEntity(updated);
    });
  }

  async hardDelete(deudaId: string): Promise<void> {
    const deuda = await this.db.deuda.findUniqueOrThrow({ where: { id: deudaId } });

    if (deuda.espejoDeId) {
      throw new Error("No se puede eliminar una deuda espejo desde este lado");
    }

    const mirror = await this.db.deuda.findFirst({ where: { espejoDeId: deudaId } });
    if (mirror) {
      throw new Error("La deuda tiene un espejo activo. Cancélala en su lugar.");
    }

    const abonosCount = await this.db.deudaAbono.count({ where: { deudaId } });
    if (abonosCount > 0) {
      throw new Error("La deuda tiene abonos. Cancélala en su lugar.");
    }

    await this.db.$transaction(async (tx) => {
      await tx.deudaEvento.deleteMany({ where: { deudaId } });
      await tx.deuda.delete({ where: { id: deudaId } });
    });
  }

  async updateEstado(deudaId: string, estado: DeudaEstado): Promise<DeudaEntity> {
    const updated = await this.db.deuda.update({
      where: { id: deudaId },
      data: { estado },
    });
    return this.toEntity(updated);
  }

  async updateSaldo(deudaId: string, saldo: number): Promise<DeudaEntity> {
    const updated = await this.db.deuda.update({
      where: { id: deudaId },
      data: { saldoPendiente: saldo },
    });
    return this.toEntity(updated);
  }

  async createEvento(data: {
    deudaId: string;
    tipoEvento: string;
    actorUserId: string;
    metadata?: Record<string, unknown>;
  }): Promise<DeudaEventoEntity> {
    const row = await this.db.deudaEvento.create({
      data: {
        deudaId: data.deudaId,
        tipoEvento: data.tipoEvento,
        actorUserId: data.actorUserId,
        metadata: (data.metadata ?? {}) as any,
      },
    });
    return {
      id: row.id,
      deudaId: row.deudaId,
      tipoEvento: row.tipoEvento,
      actorUserId: row.actorUserId,
      metadata: row.metadata as Record<string, unknown>,
      createdAt: row.createdAt,
    };
  }

  private async syncMirrorTx(tx: any, canonicalId: string): Promise<void> {
    const canonical = await tx.deuda.findUniqueOrThrow({ where: { id: canonicalId } });
    const mirror = await tx.deuda.findFirst({ where: { espejoDeId: canonicalId } });
    if (mirror) {
      await tx.deuda.update({
        where: { id: mirror.id },
        data: {
          estado: canonical.estado,
          saldoPendiente: canonical.saldoPendiente,
        },
      });
    }
  }

  private listRowToEntity(row: DebtListRow): DeudaEntity {
    return {
      id: row.id,
      grupoId: row.grupoId,
      acreedorUserId: row.acreedorUserId,
      deudorUserId: row.deudorUserId,
      deudorNombreLibre: row.deudorNombreLibre,
      contraparteSnapshotNombre: row.contraparteSnapshotNombre,
      contraparteSnapshotAvatar: row.contraparteSnapshotAvatar,
      espejoDeId: row.espejoDeId,
      monto: Number(row.monto),
      saldoPendiente: Number(row.saldoPendiente),
      estado: row.estado as DeudaEstado,
      autoConfirmar: row.autoConfirmar,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  private toEntity(row: any): DeudaEntity {
    return {
      id: row.id,
      grupoId: row.grupoId ?? "",
      acreedorUserId: row.acreedorUserId ?? row.acreedorId,
      deudorUserId: row.deudorUserId ?? row.deudorId,
      deudorNombreLibre: row.deudorNombreLibre,
      contraparteSnapshotNombre: row.contraparteSnapshotNombre,
      contraparteSnapshotAvatar: row.contraparteSnapshotAvatar,
      espejoDeId: row.espejoDeId,
      monto: toMoney(row.monto),
      saldoPendiente: toMoney(row.saldoPendiente),
      estado: row.estado as DeudaEstado,
      autoConfirmar: row.autoConfirmar,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private toAbonoEntity(row: any): DeudaAbonoEntity {
    return {
      id: row.id,
      deudaId: row.deudaId,
      monto: toMoney(row.monto),
      estado: row.estado as DeudaAbonoEntity["estado"],
      formaPagoId: row.formaPagoId,
      comprobanteFileId: row.comprobanteFileId,
      aiReviewStatus: row.aiReviewStatus,
      aiReviewNota: row.aiReviewNota,
      idempotencyKey: row.idempotencyKey,
      confirmedAt: row.confirmedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private toAbonoEntityWithFormaPago(row: any): DeudaAbonoEntity {
    const entity = this.toAbonoEntity(row);
    return {
      ...entity,
      formaPago: row.formaPago
        ? {
            id: row.formaPago.id,
            nombre: row.formaPago.nombre,
            tipo: row.formaPago.tipo as "CREDIT" | "DEBIT" | "CASH",
            ultimosCuatro: row.formaPago.ultimosCuatro,
            gradienteInicio: row.formaPago.gradienteInicio,
            gradienteFin: row.formaPago.gradienteFin,
          }
        : undefined,
    } as any;
  }
}
