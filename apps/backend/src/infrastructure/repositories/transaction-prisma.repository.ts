import { prisma } from "@/db";
import type { PrismaClient, Prisma } from "@/prisma";
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

export class TransactionPrismaRepository implements ITransactionRepository {
  private db: PrismaClient;

  constructor(client: PrismaClient = prisma) {
    this.db = client;
  }

  async findAllByUser(filters: FindTransactionsFilters): Promise<PaginatedResult<TransactionEntity>> {
    const where: Prisma.TransactionWhereInput = {
      userId: filters.userId,
      ...(filters.search && {
        description: { contains: filters.search, mode: "insensitive" },
      }),
    };

    if (filters.type) {
      where.category = { type: filters.type };
    }

    if (filters.month !== undefined || filters.year !== undefined) {
      const year = filters.year ?? new Date().getFullYear();
      if (filters.month !== undefined) {
        const startDate = new Date(year, filters.month - 1, 1);
        const endDate = new Date(year, filters.month, 1);
        where.date = { gte: startDate, lt: endDate };
      } else {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year + 1, 0, 1);
        where.date = { gte: startDate, lt: endDate };
      }
    }

    const [transactions, total] = await Promise.all([
      this.db.transaction.findMany({
        where,
        include: { category: true },
        orderBy: { date: "desc" },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.db.transaction.count({ where }),
    ]);

    return {
      data: transactions.map((t) => this.toEntity(t)),
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    };
  }

  async findById(id: string): Promise<TransactionEntity | null> {
    const transaction = await this.db.transaction.findUnique({
      where: { id },
      include: { category: true },
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
        userId: data.userId,
      },
      include: { category: true },
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
      },
      include: { category: true },
    });

    return this.toEntity(transaction);
  }

  async delete(id: string): Promise<void> {
    await this.db.transaction.delete({
      where: { id },
    });
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

    const groupedByCategory = new Map<string, { categoryId: string; categoryName: string; categoryIcon: string; total: number }>();

    for (const t of transactions) {
      const existing = groupedByCategory.get(t.categoryId);
      if (existing) {
        existing.total += Number(t.amount);
      } else {
        groupedByCategory.set(t.categoryId, {
          categoryId: t.categoryId,
          categoryName: t.category.name,
          categoryIcon: t.category.icon,
          total: Number(t.amount),
        });
      }
    }

    return Array.from(groupedByCategory.values())
      .map((item) => ({
        ...item,
        total: Math.round(item.total * 100) / 100,
        percentage: Math.round((item.total / totalExpense) * 10000) / 100,
      }))
      .sort((a, b) => b.total - a.total);
  }

  private toEntity(row: {
    id: string;
    amount: { toString(): string };
    date: Date;
    description: string | null;
    categoryId: string;
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
      userId: row.userId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
