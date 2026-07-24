import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import type { Category, PaginatedCategories } from "@/features/categories/schemas/category.schema";

interface UseCategoriesParams {
  type?: "INCOME" | "EXPENSE";
  search?: string;
  page: number;
  limit: number;
}

function useCategories({ type, search, page, limit }: UseCategoriesParams) {
  return useQuery({
    queryKey: ["categories", { type, search, page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (type) params.set("type", type);
      if (search) params.set("search", search);
      params.set("page", String(page));
      params.set("limit", String(limit));
      return apiClient<PaginatedCategories>(`/api/v1/categories?${params.toString()}`);
    },
  });
}

function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; type: "INCOME" | "EXPENSE"; icon: string }) => {
      return apiClient<Category>("/api/v1/categories", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name?: string; type?: "INCOME" | "EXPENSE"; icon?: string } }) => {
      return apiClient<Category>(`/api/v1/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient<{ message: string }>(`/api/v1/categories/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory };
