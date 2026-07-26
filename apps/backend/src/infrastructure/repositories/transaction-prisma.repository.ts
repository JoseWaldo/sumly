import { prisma } from "@/db";
import type { PrismaClient } from "@/prisma";
import type {
  ITransactionRepository,
  CreateTransactionInput,
  UpdateTransactionInput,
  FindTransactionsFilters,
  DashboardSummary,
  ExpenseByCategory,
} from "@/domain/repositories/transaction.repository";
import type { TransactionEntity } from "@/domain/entities/transaction.entity";
import type { PaginatedResult } from "@/shared/types";
import type {
  TransactionListRow,
  SpListResult,
} from "@/domain/types/sp-row-types";

export class TransactionPrismaRepository implements ITransactionRepository {
  private db: PrismaClient;

  constructor(client: PrismaClient = prisma) {
    this.db = client;
  }

  async findAllByUser(filters: FindTransactionsFilters): Promise<PaginatedResult<TransactionEntity>> {
    let dateFrom: string | null = filters.dateFrom ?? null;
    let dateTo: string | null = filters.dateTo ?? null;

    if (!dateFrom && !dateTo) {
      const year = filters.year ?? new Date().getFullYear();
      if (filters.month !== undefined) {
        dateFrom = `${year}-${String(filters.month).padStart(2, "0")}-01`;
        const lastDay = new Date(year, filters.month, 0).getDate();
        dateTo = `${year}-${String(filters.month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
      } else if (filters.year !== undefined) {
        dateFrom = `${year}-01-01`;
        dateTo = `${year}-12-31`;
      }
    }

    const rows = await this.db.$queryRaw<[{ sp_list_tbl_transactions: SpListResult<TransactionListRow> }]>`
      SELECT sp_list_tbl_transactions(
        ${filters.userId}::TEXT,
        ${filters.search || null}::TEXT,
        ${filters.page}::INT,
        ${filters.limit}::INT,
        ${filters.sortBy || null}::TEXT,
        ${filters.sortDir || null}::TEXT,
        ${filters.type || null}::TEXT,
        ${filters.categoryId || null}::TEXT,
        ${filters.formaPagoId || null}::TEXT,
        ${dateFrom}::DATE,
        ${dateTo}::DATE
      )
    `;

    const result = rows[0]?.sp_list_tbl_transactions;

    if (!result) {
      return { data: [], total: 0, page: filters.page, limit: filters.limit, totalPages: 0 };
    }

    return {
      data: (result.data ?? []).map((row) => this.rowToEntity(row)),
      total: Number(result.total),
      page: filters.page,
      limit: filters.limit,
      totalPages: result.totalPages,
    };
  }

  async findById(id: string): Promise<TransactionEntity | null> {
    const transaction = await this.db.transaction.findUnique({
      where: { id },
      include: { category: true, formaPago: true },
    });

    return transaction ? this.toEntity(transaction) : null;
  }

  async create(data: CreateTransactionInput): Promise<TransactionEntity> {
    const transaction = await this.db.transaction.create({
      data: {
        amount: data.amount,
        date: data.date,
        description: data.description ?? null,
        categoryId: data.categoryId,
        formaPagoId: data.formaPagoId,
        userId: data.userId,
      },
      include: { category: true, formaPago: true },
    });

    return this.toEntity(transaction);
  }

  async update(id: string, data: UpdateTransactionInput): Promise<TransactionEntity> {
    const transaction = await this.db.transaction.update({
      where: { id },
      data: {
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.date !== undefined && { date: data.date }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.formaPagoId !== undefined && { formaPagoId: data.formaPagoId }),
      },
      include: { category: true, formaPago: true },
    });

    return this.toEntity(transaction);
  }

  async delete(id: string): Promise<void> {
    await this.db.transaction.delete({ where: { id } });
  }

  async getDashboardSummary(userId: string): Promise<DashboardSummary> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [allTransactions, monthlyTransactions, recentTransactions] = await Promise.all([
      this.db.transaction.findMany({
        where: { userId },
        include: { category: true },
      }),
      this.db.transaction.findMany({
        where: {
          userId,
          date: { gte: startOfMonth, lt: endOfMonth },
        },
        include: { category: true },
      }),
      this.db.transaction.findMany({
        where: { userId },
        include: { category: true },
        orderBy: { date: "desc" },
        take: 5,
      }),
    ]);

    const totalIncome = allTransactions
      .filter((t) => t.category.type === "INCOME")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = allTransactions
      .filter((t) => t.category.type === "EXPENSE")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const monthlyIncome = monthlyTransactions
      .filter((t) => t.category.type === "INCOME")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const monthlyExpense = monthlyTransactions
      .filter((t) => t.category.type === "EXPENSE")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      balance: totalIncome - totalExpense,
      monthlyIncome,
      monthlyExpense,
      recentTransactions: recentTransactions.map((t) => this.toEntity(t)),
    };
  }

  async getExpensesByCategory(userId: string, month: number, year: number): Promise<ExpenseByCategory[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const transactions = await this.db.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate, lt: endDate },
        category: { type: "EXPENSE" },
      },
      include: { category: true },
    });

    const totalExpense = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

    if (totalExpense === 0) return [];

    const grouped = new Map<string, { categoryId: string; categoryName: string; categoryIcon: string; total: number }>();

    for (const t of transactions) {
      const existing = grouped.get(t.categoryId);
      if (existing) {
        existing.total += Number(t.amount);
      } else {
        grouped.set(t.categoryId, {
          categoryId: t.categoryId,
          categoryName: t.category.name,
          categoryIcon: t.category.icon,
          total: Number(t.amount),
        });
      }
    }

    return Array.from(grouped.values())
      .map((item) => ({
        ...item,
        total: Math.round(item.total * 100) / 100,
        percentage: Math.round((item.total / totalExpense) * 10000) / 100,
      }))
      .sort((a, b) => b.total - a.total);
  }

  private rowToEntity(row: TransactionListRow): TransactionEntity {
    return {
      id: row.id,
      amount: Number(row.amount),
      date: new Date(row.date),
      description: row.description,
      categoryId: row.categoryId,
      category: row.category
        ? {
            id: row.category.id,
            name: row.category.name,
            type: row.category.type,
            icon: row.category.icon,
            userId: row.category.userId,
            createdAt: new Date(row.category.createdAt),
            updatedAt: new Date(row.category.updatedAt),
          }
        : undefined,
      formaPagoId: row.formaPagoId ?? "",
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
      userId: row.userId,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  private toEntity(row: {
    id: string;
    amount: { toString(): string };
    date: Date;
    description: string | null;
    categoryId: string;
    formaPagoId: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    category?: {
      id: string;
      name: string;
      type: "INCOME" | "EXPENSE";
      icon: string;
      userId: string | null;
      createdAt: Date;
      updatedAt: Date;
    } | null;
    formaPago?: {
      id: string;
      nombre: string;
      tipo: string;
      ultimosCuatro: string | null;
      gradienteInicio: string;
      gradienteFin: string;
    } | null;
  }): TransactionEntity {
    return {
      id: row.id,
      amount: Number(row.amount),
      date: row.date,
      description: row.description,
      categoryId: row.categoryId,
      category: row.category
        ? {
            id: row.category.id,
            name: row.category.name,
            type: row.category.type,
            icon: row.category.icon,
            userId: row.category.userId,
            createdAt: row.category.createdAt,
            updatedAt: row.category.updatedAt,
          }
        : undefined,
      formaPagoId: row.formaPagoId,
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
      userId: row.userId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
