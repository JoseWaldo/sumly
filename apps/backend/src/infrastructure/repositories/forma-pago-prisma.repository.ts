import { prisma } from "@/db";
import type { PrismaClient } from "@/prisma";
import type {
  IFormaPagoRepository,
  CreateFormaPagoInput,
  UpdateFormaPagoInput,
  FindFormasPagoFilters,
} from "@/domain/repositories/forma-pago.repository";
import type { FormaPagoEntity } from "@/domain/entities/forma-pago.entity";
import type { PaginatedResult } from "@/shared/types";
import { NotFoundError } from "@/shared/errors";

export class FormaPagoPrismaRepository implements IFormaPagoRepository {
  private db: PrismaClient;

  constructor(client: PrismaClient = prisma) {
    this.db = client;
  }

  async findAllByUser(filters: FindFormasPagoFilters): Promise<PaginatedResult<FormaPagoEntity>> {
    const where = {
      userId: filters.userId,
      ...(filters.search && { nombre: { contains: filters.search, mode: "insensitive" as const } }),
    };

    const [formasPago, total] = await Promise.all([
      this.db.formaPago.findMany({
        where,
        include: { entidadFinanciera: true },
        orderBy: [{ tipo: "asc" }, { nombre: "asc" }],
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.db.formaPago.count({ where }),
    ]);

    return {
      data: formasPago.map((f) => this.toEntity(f)),
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    };
  }

  async findById(id: string): Promise<FormaPagoEntity | null> {
    const formaPago = await this.db.formaPago.findUnique({
      where: { id },
      include: { entidadFinanciera: true },
    });
    return formaPago ? this.toEntity(formaPago) : null;
  }

  async findEfectivoByUser(userId: string): Promise<FormaPagoEntity | null> {
    const formaPago = await this.db.formaPago.findFirst({
      where: { userId, tipo: "CASH" },
      include: { entidadFinanciera: true },
    });
    return formaPago ? this.toEntity(formaPago) : null;
  }

  async create(data: CreateFormaPagoInput): Promise<FormaPagoEntity> {
    const formaPago = await this.db.formaPago.create({
      data: {
        nombre: data.nombre,
        tipo: data.tipo,
        numeroEncriptado: data.numeroEncriptado,
        ultimosCuatro: data.ultimosCuatro,
        publico: data.publico,
        gradienteInicio: data.gradienteInicio,
        gradienteFin: data.gradienteFin,
        entidadFinancieraId: data.entidadFinancieraId,
        userId: data.userId,
      },
      include: { entidadFinanciera: true },
    });

    return this.toEntity(formaPago);
  }

  async update(id: string, data: UpdateFormaPagoInput): Promise<FormaPagoEntity> {
    const formaPago = await this.db.formaPago.update({
      where: { id },
      data: {
        ...(data.nombre !== undefined && { nombre: data.nombre }),
        ...(data.numeroEncriptado !== undefined && { numeroEncriptado: data.numeroEncriptado }),
        ...(data.ultimosCuatro !== undefined && { ultimosCuatro: data.ultimosCuatro }),
        ...(data.publico !== undefined && { publico: data.publico }),
        ...(data.gradienteInicio !== undefined && { gradienteInicio: data.gradienteInicio }),
        ...(data.gradienteFin !== undefined && { gradienteFin: data.gradienteFin }),
      },
      include: { entidadFinanciera: true },
    });

    return this.toEntity(formaPago);
  }

  async delete(id: string): Promise<void> {
    await this.db.formaPago.delete({ where: { id } });
  }

  async revealNumero(id: string, userId: string): Promise<string> {
    const formaPago = await this.db.formaPago.findUnique({ where: { id } });

    if (!formaPago || formaPago.userId !== userId) {
      throw new NotFoundError("Forma de pago no encontrada");
    }

    if (!formaPago.numeroEncriptado) {
      throw new NotFoundError("Esta forma de pago no tiene un numero asociado");
    }

    return formaPago.numeroEncriptado;
  }

  private toEntity(row: {
    id: string;
    nombre: string;
    tipo: string;
    numeroEncriptado: string | null;
    ultimosCuatro: string | null;
    publico: boolean;
    gradienteInicio: string;
    gradienteFin: string;
    entidadFinancieraId: string | null;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    entidadFinanciera?: { formatoNumero: string | null } | null;
  }): FormaPagoEntity {
    return {
      id: row.id,
      nombre: row.nombre,
      tipo: row.tipo as FormaPagoEntity["tipo"],
      numeroEncriptado: row.numeroEncriptado,
      ultimosCuatro: row.ultimosCuatro,
      publico: row.publico,
      gradienteInicio: row.gradienteInicio,
      gradienteFin: row.gradienteFin,
      entidadFinancieraId: row.entidadFinancieraId,
      formatoNumero: row.entidadFinanciera?.formatoNumero ?? null,
      userId: row.userId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
