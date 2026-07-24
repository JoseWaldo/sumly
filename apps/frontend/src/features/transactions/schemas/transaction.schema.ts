import { z } from "zod";

export const transactionFormSchema = z.object({
  amount: z.number({ message: "El monto debe ser un numero" }).positive("El monto debe ser mayor a 0"),
  date: z.string().min(1, "La fecha es requerida"),
  description: z.string().max(255, "La descripcion no puede exceder 255 caracteres").optional().or(z.literal("")),
  categoryId: z.string().min(1, "La categoria es requerida"),
});

export type TransactionFormInput = z.infer<typeof transactionFormSchema>;

export interface TransactionCategory {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  icon: string;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string | null;
  categoryId: string;
  category?: TransactionCategory;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedTransactions {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardSummary {
  balance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  recentTransactions: Transaction[];
}

export interface ExpenseByCategory {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  total: number;
  percentage: number;
}
