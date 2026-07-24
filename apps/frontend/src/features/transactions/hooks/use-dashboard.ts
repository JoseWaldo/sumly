import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import type {
  DashboardSummary,
  ExpenseByCategory,
} from "@/features/transactions/schemas/transaction.schema";

function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: async () => {
      return apiClient<DashboardSummary>("/api/v1/transactions/dashboard");
    },
  });
}

function useExpensesByCategory(month?: number, year?: number) {
  return useQuery({
    queryKey: ["dashboard", "expenses-by-category", { month, year }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (month) params.set("month", String(month));
      if (year) params.set("year", String(year));
      return apiClient<ExpenseByCategory[]>(
        `/api/v1/transactions/dashboard/expenses-by-category?${params.toString()}`
      );
    },
  });
}

export { useDashboardSummary, useExpensesByCategory };
