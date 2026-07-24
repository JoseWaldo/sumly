import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import type {
  Transaction,
  PaginatedTransactions,
} from "@/features/transactions/schemas/transaction.schema";

interface UseTransactionsParams {
  type?: "INCOME" | "EXPENSE";
  search?: string;
  month?: number;
  year?: number;
  page: number;
  limit: number;
}

function useTransactions({ type, search, month, year, page, limit }: UseTransactionsParams) {
  return useQuery({
    queryKey: ["transactions", { type, search, month, year, page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (type) params.set("type", type);
      if (search) params.set("search", search);
      if (month) params.set("month", String(month));
      if (year) params.set("year", String(year));
      params.set("page", String(page));
      params.set("limit", String(limit));
      return apiClient<PaginatedTransactions>(`/api/v1/transactions?${params.toString()}`);
    },
  });
}

function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { amount: number; date: string; description?: string; categoryId: string }) => {
      return apiClient<Transaction>("/api/v1/transactions", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { amount?: number; date?: string; description?: string; categoryId?: string };
    }) => {
      return apiClient<Transaction>(`/api/v1/transactions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient<{ message: string }>(`/api/v1/transactions/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction };
