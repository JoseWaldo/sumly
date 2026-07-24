import { prisma } from "@/db";
import type { PrismaClient } from "@/prisma";
import type {
  IEntidadFinancieraRepository,
  CreateEntidadFinancieraInput,
  UpdateEntidadFinancieraInput,
  FindEntidadesFinancierasFilters,
} from "@/domain/repositories/entidad-financiera.repository";
import type { EntidadFinancieraEntity } from "@/domain/entities/entidad-financiera.entity";
import type { PaginatedResult } from "@/shared/types";
import { ConflictError } from "@/shared/errors";

export class EntidadFinancieraPrismaRepository implements IEntidadFinancieraRepository {
  private db: PrismaClient;

  constructor(client: PrismaClient = prisma) {
    this.db = client;
  }

  async findAllByUser(filters: FindEntidadesFinancierasFilters): Promise<PaginatedResult<EntidadFinancieraEntity>> {
    const where = {
      OR: [{ userId: null }, { userId: filters.userId }],
      ...(filters.search && { nombre: { contains: filters.search, mode: "insensitive" as const } }),
    };

    const [entidades, total] = await Promise.all([
      this.db.entidadFinanciera.findMany({
        where,
        orderBy: [{ esSistema: "desc" }, { nombre: "asc" }],
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.db.entidadFinanciera.count({ where }),
    ]);

    return {
      data: entidades.map((e) => this.toEntity(e)),
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    };
  }

  async findById(id: string): Promise<EntidadFinancieraEntity | null> {
    const entidad = await this.db.entidadFinanciera.findUnique({ where: { id } });
    return entidad ? this.toEntity(entidad) : null;
  }

  async create(data: CreateEntidadFinancieraInput): Promise<EntidadFinancieraEntity> {
    const existing = await this.db.entidadFinanciera.findFirst({
      where: { nombre: data.nombre, userId: data.userId },
    });

    if (existing) {
      throw new ConflictError("Ya tienes una entidad con ese nombre");
    }

    const entidad = await this.db.entidadFinanciera.create({
      data: {
        nombre: data.nombre,
        gradienteInicio: data.gradienteInicio,
        gradienteFin: data.gradienteFin,
        formatoNumero: data.formatoNumero ?? null,
        userId: data.userId,
      },
    });

    return this.toEntity(entidad);
  }

  async update(id: string, data: UpdateEntidadFinancieraInput): Promise<EntidadFinancieraEntity> {
    const entidad = await this.db.entidadFinanciera.update({
      where: { id },
      data: {
        ...(data.nombre !== undefined && { nombre: data.nombre }),
        ...(data.gradienteInicio !== undefined && { gradienteInicio: data.gradienteInicio }),
        ...(data.gradienteFin !== undefined && { gradienteFin: data.gradienteFin }),
        ...(data.formatoNumero !== undefined && { formatoNumero: data.formatoNumero }),
      },
    });

    return this.toEntity(entidad);
  }

  async delete(id: string): Promise<void> {
    await this.db.entidadFinanciera.delete({ where: { id } });
  }

  async countFormasPago(id: string): Promise<number> {
    return this.db.formaPago.count({ where: { entidadFinancieraId: id } });
  }

  private toEntity(row: {
    id: string;
    nombre: string;
    gradienteInicio: string;
    gradienteFin: string;
    formatoNumero: string | null;
    esSistema: boolean;
    userId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): EntidadFinancieraEntity {
    return {
      id: row.id,
      nombre: row.nombre,
      gradienteInicio: row.gradienteInicio,
      gradienteFin: row.gradienteFin,
      formatoNumero: row.formatoNumero,
      esSistema: row.esSistema,
      userId: row.userId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
