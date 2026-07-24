import type { TransactionEntity } from "@/domain/entities/transaction.entity";
import type { PaginatedResult } from "@/shared/types";

export interface FindTransactionsFilters {
  userId: string;
  type?: "INCOME" | "EXPENSE";
  month?: number;
  year?: number;
  search?: string;
  page: number;
  limit: number;
}

export interface CreateTransactionInput {
  amount: number;
  date: Date;
  description?: string;
  categoryId: string;
  userId: string;
}

export interface UpdateTransactionInput {
  amount?: number;
  date?: Date;
  description?: string;
  categoryId?: string;
}

export interface DashboardSummary {
  balance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  recentTransactions: TransactionEntity[];
}

export interface ExpenseByCategory {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  total: number;
  percentage: number;
}

export interface ITransactionRepository {
  findAllByUser(filters: FindTransactionsFilters): Promise<PaginatedResult<TransactionEntity>>;
  findById(id: string): Promise<TransactionEntity | null>;
  create(data: CreateTransactionInput): Promise<TransactionEntity>;
  update(id: string, data: UpdateTransactionInput): Promise<TransactionEntity>;
  delete(id: string): Promise<void>;
  getDashboardSummary(userId: string): Promise<DashboardSummary>;
  getExpensesByCategory(userId: string, month: number, year: number): Promise<ExpenseByCategory[]>;
}
