import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import type {
  Debt,
  DebtWithGrupo,
  DebtDashboard,
  PaginatedDebts,
  Abono,
  DebtEvent,
  CreateDeudaInput,
  ReportarAbonoInput,
} from "@/features/debts/schemas/debt.schema";

const BASE = "/api/v1/deudas";

interface UseDebtsParams {
  direccion?: "ME_DEBEN" | "YO_DEBO";
  estado?: string;
  search?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  page: number;
  limit: number;
}

export function useDebts(params: UseDebtsParams) {
  return useQuery({
    queryKey: ["debts", params],
    queryFn: async () => {
      const q = new URLSearchParams();
      if (params.direccion) q.set("direccion", params.direccion);
      if (params.estado) q.set("estado", params.estado);
      if (params.search) q.set("search", params.search);
      if (params.sortBy) q.set("sortBy", params.sortBy);
      if (params.sortDir) q.set("sortDir", params.sortDir);
      q.set("page", String(params.page));
      q.set("limit", String(params.limit));
      return apiClient<PaginatedDebts>(`${BASE}?${q.toString()}`);
    },
  });
}

export function useDebtDashboard() {
  return useQuery({
    queryKey: ["debts", "dashboard"],
    queryFn: () => apiClient<DebtDashboard>(`${BASE}/dashboard`),
  });
}

export function useDebtDetail(id: string | null) {
  return useQuery({
    queryKey: ["debts", "detail", id],
    queryFn: () => apiClient<DebtWithGrupo>(`${BASE}/${id}`),
    enabled: !!id,
  });
}

export function useDebtEventos(id: string | null) {
  return useQuery({
    queryKey: ["debts", "eventos", id],
    queryFn: () => apiClient<DebtEvent[]>(`${BASE}/${id}/eventos`),
    enabled: !!id,
  });
}

export function useCreateDeuda() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDeudaInput) =>
      apiClient<{ deudas: Debt[] }>(BASE, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useReportAbono() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      deudaId,
      data,
    }: {
      deudaId: string;
      data: ReportarAbonoInput & { idempotencyKey: string };
    }) =>
      apiClient<Abono>(`${BASE}/${deudaId}/abonos`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useConfirmAbono() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ deudaId, abonoId }: { deudaId: string; abonoId: string }) =>
      apiClient<Abono>(`${BASE}/${deudaId}/abonos/${abonoId}/confirmar`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useRejectAbono() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ deudaId, abonoId }: { deudaId: string; abonoId: string }) =>
      apiClient<Abono>(`${BASE}/${deudaId}/abonos/${abonoId}/rechazar`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
    },
  });
}

export function useResolveDisputa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ deudaId, accion }: { deudaId: string; accion: string }) =>
      apiClient<Debt>(`${BASE}/${deudaId}/disputa`, {
        method: "POST",
        body: JSON.stringify({ accion }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useCancelDeuda() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (deudaId: string) =>
      apiClient<Debt>(`${BASE}/${deudaId}/cancelar`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useForgiveDeuda() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (deudaId: string) =>
      apiClient<Debt>(`${BASE}/${deudaId}/perdonar`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteDeuda() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (deudaId: string) =>
      apiClient<void>(`${BASE}/${deudaId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
    },
  });
}
