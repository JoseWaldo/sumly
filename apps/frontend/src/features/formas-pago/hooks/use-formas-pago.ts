import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import type {
  FormaPago,
  PaginatedFormasPago,
  FormaPagoFormInput,
} from "@/features/formas-pago/schemas/forma-pago.schema";

interface UseFormasPagoParams {
  search?: string;
  page: number;
  limit: number;
}

function useFormasPago({ search, page, limit }: UseFormasPagoParams) {
  return useQuery({
    queryKey: ["formas-pago", { search, page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("page", String(page));
      params.set("limit", String(limit));
      return apiClient<PaginatedFormasPago>(`/api/v1/formas-pago?${params.toString()}`);
    },
  });
}

function useCreateFormaPago() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormaPagoFormInput) => {
      return apiClient<FormaPago>("/api/v1/formas-pago", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formas-pago"] });
    },
  });
}

function useUpdateFormaPago() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: {
      id: string;
      data: {
        nombre?: string;
        numero?: string;
        publico?: boolean;
        gradienteInicio?: string;
        gradienteFin?: string;
      };
    }) => {
      return apiClient<FormaPago>(`/api/v1/formas-pago/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formas-pago"] });
    },
  });
}

function useDeleteFormaPago() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient<{ message: string }>(`/api/v1/formas-pago/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formas-pago"] });
    },
  });
}

function useRevealFormaPago() {
  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient<{ numero: string }>(`/api/v1/formas-pago/${id}/reveal`);
    },
  });
}

export {
  useFormasPago,
  useCreateFormaPago,
  useUpdateFormaPago,
  useDeleteFormaPago,
  useRevealFormaPago,
};
