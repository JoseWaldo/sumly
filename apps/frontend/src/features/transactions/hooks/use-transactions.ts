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
  dateFrom?: string;
  dateTo?: string;
  categoryId?: string;
  formaPagoId?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  page: number;
  limit: number;
}

function useTransactions(params: UseTransactionsParams) {
  return useQuery({
    queryKey: ["transactions", params],
    queryFn: async () => {
      const q = new URLSearchParams();
      if (params.type) q.set("type", params.type);
      if (params.search) q.set("search", params.search);
      if (params.month) q.set("month", String(params.month));
      if (params.year) q.set("year", String(params.year));
      if (params.dateFrom) q.set("dateFrom", params.dateFrom);
      if (params.dateTo) q.set("dateTo", params.dateTo);
      if (params.categoryId) q.set("categoryId", params.categoryId);
      if (params.formaPagoId) q.set("formaPagoId", params.formaPagoId);
      if (params.sortBy) q.set("sortBy", params.sortBy);
      if (params.sortDir) q.set("sortDir", params.sortDir);
      q.set("page", String(params.page));
      q.set("limit", String(params.limit));
      return apiClient<PaginatedTransactions>(`/api/v1/transactions?${q.toString()}`);
    },
  });
}

function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      amount: number;
      date: string;
      description?: string;
      categoryId: string;
      formaPagoId: string;
    }) => {
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
      data: {
        amount?: number;
        date?: string;
        description?: string;
        categoryId?: string;
        formaPagoId?: string;
      };
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
