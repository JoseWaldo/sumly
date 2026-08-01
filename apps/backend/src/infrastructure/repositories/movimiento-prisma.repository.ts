import { prisma } from "@/db";
import type { PrismaClient } from "@/prisma";
import type { IMovimientoRepository, CreateMovimientoInput, CreateReversaInput } from "@/domain/repositories/movimiento.repository";
import type { MovimientoEntity } from "@/domain/entities/movimiento.entity";

export class MovimientoPrismaRepository implements IMovimientoRepository {
  private db: PrismaClient;

  constructor(client: PrismaClient = prisma) {
    this.db = client;
  }

  async create(input: CreateMovimientoInput): Promise<MovimientoEntity> {
    const row = await this.db.movimiento.create({
      data: {
        userId: input.userId,
        tipo: input.tipo,
        naturaleza: "NEUTRAL",
        monto: input.monto,
        origenTipo: input.origenTipo,
        origenId: input.origenId,
        editable: false,
      },
    });
    return this.toEntity(row);
  }

  async createReversa(input: CreateReversaInput): Promise<MovimientoEntity> {
    const original = await this.db.movimiento.findUniqueOrThrow({
      where: { id: input.movimientoOriginalId },
    });

    const tipoInverso = original.tipo === "ENTRADA" ? ("SALIDA" as const) : ("ENTRADA" as const);

    const row = await this.db.movimiento.create({
      data: {
        userId: original.userId,
        tipo: tipoInverso,
        naturaleza: "NEUTRAL",
        monto: original.monto,
        origenTipo: original.origenTipo,
        origenId: original.origenId,
        reversaDeId: original.id,
        editable: false,
      },
    });
    return this.toEntity(row);
  }

  async findById(id: string): Promise<MovimientoEntity | null> {
    const row = await this.db.movimiento.findUnique({ where: { id } });
    if (!row) return null;
    return this.toEntity(row);
  }

  async getNeutralNet(userId: string): Promise<number> {
    const entradas = await this.db.movimiento.aggregate({
      _sum: { monto: true },
      where: { userId, naturaleza: "NEUTRAL", tipo: "ENTRADA" },
    });

    const salidas = await this.db.movimiento.aggregate({
      _sum: { monto: true },
      where: { userId, naturaleza: "NEUTRAL", tipo: "SALIDA" },
    });

    const entradasTotal = entradas._sum.monto ? Number(entradas._sum.monto) : 0;
    const salidasTotal = salidas._sum.monto ? Number(salidas._sum.monto) : 0;

    return entradasTotal - salidasTotal;
  }

  private toEntity(row: any): MovimientoEntity {
    return {
      id: row.id,
      userId: row.userId,
      tipo: row.tipo as MovimientoEntity["tipo"],
      naturaleza: row.naturaleza as MovimientoEntity["naturaleza"],
      monto: Number(row.monto),
      origenTipo: row.origenTipo as MovimientoEntity["origenTipo"],
      origenId: row.origenId,
      reversaDeId: row.reversaDeId,
      editable: row.editable,
      createdAt: row.createdAt,
    };
  }
}
