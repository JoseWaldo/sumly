import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import type {
  PaginatedEntidadesFinancieras,
  EntidadFinanciera,
} from "@/features/formas-pago/schemas/forma-pago.schema";

interface UseEntidadesFinancierasParams {
  search?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

function useEntidadesFinancieras({ search, sortBy, sortDir }: UseEntidadesFinancierasParams = {}) {
  return useQuery({
    queryKey: ["entidades-financieras", { search, sortBy, sortDir }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (sortBy) params.set("sortBy", sortBy);
      if (sortDir) params.set("sortDir", sortDir);
      params.set("page", "1");
      params.set("limit", "100");
      return apiClient<PaginatedEntidadesFinancieras>(
        `/api/v1/entidades-financieras?${params.toString()}`
      );
    },
  });
}

function useCreateEntidadFinanciera() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      nombre: string;
      gradienteInicio: string;
      gradienteFin: string;
      formatoNumero?: string | null;
    }) => {
      return apiClient<EntidadFinanciera>("/api/v1/entidades-financieras", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entidades-financieras"] });
    },
  });
}

function useUpdateEntidadFinanciera() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: {
        nombre?: string;
        gradienteInicio?: string;
        gradienteFin?: string;
        formatoNumero?: string | null;
      };
    }) => {
      return apiClient<EntidadFinanciera>(`/api/v1/entidades-financieras/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entidades-financieras"] });
    },
  });
}

function useDeleteEntidadFinanciera() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient<{ message: string }>(`/api/v1/entidades-financieras/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entidades-financieras"] });
    },
  });
}

export {
  useEntidadesFinancieras,
  useCreateEntidadFinanciera,
  useUpdateEntidadFinanciera,
  useDeleteEntidadFinanciera,
};
