import { prisma } from "@/db";
import type { PrismaClient, Prisma } from "@/prisma";
import type {
  ISubscriptionRepository,
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
  FindSubscriptionsFilters,
  CreateTagInput,
  SubscriptionDashboardSummary,
} from "@/domain/repositories/subscription.repository";
import type { SubscriptionEntity, SubscriptionTagEntity } from "@/domain/entities/subscription.entity";
import type { PaginatedResult } from "@/shared/types";
import { ConflictError, NotFoundError, UnauthorizedError } from "@/shared/errors";

export class SubscriptionPrismaRepository implements ISubscriptionRepository {
  private db: PrismaClient;

  constructor(client: PrismaClient = prisma) {
    this.db = client;
  }

  async findAllByUser(filters: FindSubscriptionsFilters): Promise<PaginatedResult<SubscriptionEntity>> {
    const where: Prisma.SubscriptionWhereInput = {
      userId: filters.userId,
      ...(filters.status && { status: filters.status }),
      ...(filters.search && {
        name: { contains: filters.search, mode: "insensitive" },
      }),
    };

    if (filters.tagId) {
      const taggedSubs = await this.db.$queryRaw<{ A: string }[]>`
        SELECT "A" FROM "_SubscriptionToSubscriptionTag" WHERE "B" = ${filters.tagId}
      `;

      const subscriptionIds = taggedSubs.map((r) => r.A);

      if (subscriptionIds.length === 0) {
        return {
          data: [],
          total: 0,
          page: filters.page,
          limit: filters.limit,
          totalPages: 0,
        };
      }

      where.id = { in: subscriptionIds };
    }

    const [subscriptions, total] = await Promise.all([
      this.db.subscription.findMany({
        where,
      include: { tags: true, formaPago: { include: { entidadFinanciera: true } } },
      orderBy: { nextPaymentDate: "asc" },
      skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.db.subscription.count({ where }),
    ]);

    return {
      data: subscriptions.map((s) => this.toEntity(s)),
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    };
  }

  async findById(id: string): Promise<SubscriptionEntity | null> {
    const subscription = await this.db.subscription.findUnique({
      where: { id },
      include: { tags: true, formaPago: { include: { entidadFinanciera: true } } },
    });

    return subscription ? this.toEntity(subscription) : null;
  }

  async create(data: CreateSubscriptionInput): Promise<SubscriptionEntity> {
    const subscription = await this.db.subscription.create({
      data: {
        name: data.name,
        amount: data.amount,
        nextPaymentDate: data.nextPaymentDate,
        frequency: data.frequency as Prisma.EnumSubscriptionFrequencyFilter["equals"],
        status: data.status as Prisma.EnumSubscriptionStatusFilter["equals"],
        formaPagoId: data.formaPagoId,
        userId: data.userId,
      },
      include: { tags: true },
    });

    if (data.tagIds.length > 0) {
      await this.db.$executeRaw`
        INSERT INTO "_SubscriptionToSubscriptionTag" ("A", "B")
        SELECT ${subscription.id}, unnest(${data.tagIds}::text[])
      `;
    }

    return this.findById(subscription.id).then((s) => s!);
  }

  async update(id: string, data: UpdateSubscriptionInput): Promise<SubscriptionEntity> {
    const updateData: Prisma.SubscriptionUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.nextPaymentDate !== undefined) updateData.nextPaymentDate = data.nextPaymentDate;
    if (data.frequency !== undefined) updateData.frequency = data.frequency as Prisma.EnumSubscriptionFrequencyFilter["equals"];
    if (data.status !== undefined) updateData.status = data.status as Prisma.EnumSubscriptionStatusFilter["equals"];
    if (data.formaPagoId !== undefined) updateData.formaPago = { connect: { id: data.formaPagoId } };

    const subscription = await this.db.subscription.update({
      where: { id },
      data: updateData,
      include: { tags: true, formaPago: { include: { entidadFinanciera: true } } },
    });

    if (data.tagIds !== undefined) {
      await this.db.$executeRaw`
        DELETE FROM "_SubscriptionToSubscriptionTag" WHERE "A" = ${id}
      `;

      if (data.tagIds.length > 0) {
        await this.db.$executeRaw`
          INSERT INTO "_SubscriptionToSubscriptionTag" ("A", "B")
          SELECT ${id}, unnest(${data.tagIds}::text[])
        `;
      }
    }

    return this.findById(id).then((s) => s!);
  }

  async delete(id: string): Promise<void> {
    await this.db.subscription.delete({
      where: { id },
    });
  }

  async getDashboardSummary(userId: string): Promise<SubscriptionDashboardSummary> {
    const subscriptions = await this.db.subscription.findMany({
      where: { userId, status: "ACTIVE" },
      include: { tags: true, formaPago: { include: { entidadFinanciera: true } } },
      orderBy: { nextPaymentDate: "asc" },
    });

    const monthlyTotal = subscriptions.reduce((sum, s) => {
      const amount = Number(s.amount);
      switch (s.frequency) {
        case "MONTHLY": return sum + amount;
        case "YEARLY": return sum + amount / 12;
        case "QUARTERLY": return sum + amount / 3;
        case "BIWEEKLY": return sum + (amount * 26) / 12;
        case "WEEKLY": return sum + (amount * 52) / 12;
        default: return sum + amount;
      }
    }, 0);

    return {
      monthlyTotal: Math.round(monthlyTotal * 100) / 100,
      activeCount: subscriptions.length,
      upcomingPayments: subscriptions.slice(0, 5).map((s) => this.toEntity(s)),
    };
  }

  async findTagsByUser(userId: string): Promise<SubscriptionTagEntity[]> {
    const tags = await this.db.subscriptionTag.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });

    return tags.map((t) => ({
      id: t.id,
      name: t.name,
      color: t.color,
      userId: t.userId,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));
  }

  async createTag(data: CreateTagInput): Promise<SubscriptionTagEntity> {
    const existing = await this.db.subscriptionTag.findFirst({
      where: { name: data.name, userId: data.userId },
    });

    if (existing) {
      throw new ConflictError("Ya tienes un tag con ese nombre");
    }

    const tag = await this.db.subscriptionTag.create({
      data: {
        name: data.name,
        color: data.color,
        userId: data.userId,
      },
    });

    return {
      id: tag.id,
      name: tag.name,
      color: tag.color,
      userId: tag.userId,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    };
  }

  async deleteTag(id: string, userId: string): Promise<void> {
    const tag = await this.db.subscriptionTag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundError("Tag no encontrado");
    }

    if (tag.userId !== userId) {
      throw new UnauthorizedError("No puedes eliminar un tag que no te pertenece");
    }

    await this.db.subscriptionTag.delete({
      where: { id },
    });
  }

  private toEntity(row: {
    id: string;
    name: string;
    amount: { toString(): string };
    nextPaymentDate: Date;
    frequency: string;
    status: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    formaPago?: {
      id: string;
      nombre: string;
      tipo: string;
      numeroEncriptado: string | null;
      ultimosCuatro: string | null;
      publico: boolean;
      gradienteInicio: string;
      gradienteFin: string;
      entidadFinancieraId: string | null;
      entidadFinanciera?: {
        id: string;
        nombre: string;
        formatoNumero: string | null;
      } | null;
    } | null;
    tags: {
      id: string;
      name: string;
      color: string;
      userId: string;
      createdAt: Date;
      updatedAt: Date;
    }[];
  }): SubscriptionEntity {
    return {
      id: row.id,
      name: row.name,
      amount: Number(row.amount),
      nextPaymentDate: row.nextPaymentDate,
      frequency: row.frequency as SubscriptionEntity["frequency"],
      status: row.status as SubscriptionEntity["status"],
      userId: row.userId,
      formaPago: row.formaPago
        ? {
            id: row.formaPago.id,
            nombre: row.formaPago.nombre,
            tipo: row.formaPago.tipo as SubscriptionEntity["formaPago"]["tipo"],
            ultimosCuatro: row.formaPago.ultimosCuatro,
            gradienteInicio: row.formaPago.gradienteInicio,
            gradienteFin: row.formaPago.gradienteFin,
            formatoNumero: row.formaPago.entidadFinanciera?.formatoNumero ?? null,
            entidadFinancieraId: row.formaPago.entidadFinancieraId,
            entidadFinancieraNombre: row.formaPago.entidadFinanciera?.nombre ?? null,
          }
        : {
            id: "",
            nombre: "",
            tipo: "CASH" as const,
            ultimosCuatro: null,
            gradienteInicio: "#000000",
            gradienteFin: "#000000",
            formatoNumero: null,
            entidadFinancieraId: null,
            entidadFinancieraNombre: null,
          },
      tags: row.tags.map((t) => ({
        id: t.id,
        name: t.name,
        color: t.color,
        userId: t.userId,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
