import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import type {
  Subscription,
  PaginatedSubscriptions,
  SubscriptionDashboardSummary,
  SubscriptionTag,
} from "@/features/subscriptions/schemas/subscription.schema";

interface UseSubscriptionsParams {
  status?: "ACTIVE" | "PAUSED" | "CANCELLED";
  tagId?: string;
  search?: string;
  page: number;
  limit: number;
}

function useSubscriptions({ status, tagId, search, page, limit }: UseSubscriptionsParams) {
  const queryParams: Record<string, string> = {};
  if (status) queryParams["status"] = status;
  if (tagId) queryParams["tagId"] = tagId;
  if (search) queryParams["search"] = search;
  queryParams["page"] = String(page);
  queryParams["limit"] = String(limit);

  return useQuery({
    queryKey: ["subscriptions", queryParams],
    queryFn: async () => {
      const params = new URLSearchParams(queryParams);
      return apiClient<PaginatedSubscriptions>(`/api/v1/subscriptions?${params.toString()}`);
    },
  });
}

function useSubscriptionDashboard() {
  return useQuery({
    queryKey: ["subscriptions", "dashboard"],
    queryFn: async () => {
      return apiClient<SubscriptionDashboardSummary>("/api/v1/subscriptions/dashboard");
    },
  });
}

function useTags() {
  return useQuery({
    queryKey: ["subscriptions", "tags"],
    queryFn: async () => {
      return apiClient<SubscriptionTag[]>("/api/v1/subscriptions/tags");
    },
  });
}

function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; color: string }) => {
      return apiClient<SubscriptionTag>("/api/v1/subscriptions/tags", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions", "tags"] });
    },
  });
}

function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient<{ message: string }>(`/api/v1/subscriptions/tags/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions", "tags"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
  });
}

function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      amount: number;
      nextPaymentDate: string;
      frequency: string;
      status?: string;
      formaPagoId: string;
      tagIds?: string[];
    }) => {
      return apiClient<Subscription>("/api/v1/subscriptions", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
  });
}

function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: {
        name?: string;
        amount?: number;
        nextPaymentDate?: string;
        frequency?: string;
        status?: string;
        formaPagoId?: string;
        tagIds?: string[];
      };
    }) => {
      return apiClient<Subscription>(`/api/v1/subscriptions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
  });
}

function useDeleteSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient<{ message: string }>(`/api/v1/subscriptions/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

function useReportPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, date }: { id: string; date?: string }) => {
      return apiClient<{ subscription: Subscription }>(`/api/v1/subscriptions/${id}/report`, {
        method: "POST",
        body: JSON.stringify(date ? { date } : {}),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export {
  useSubscriptions,
  useSubscriptionDashboard,
  useTags,
  useCreateTag,
  useDeleteTag,
  useCreateSubscription,
  useUpdateSubscription,
  useDeleteSubscription,
  useReportPayment,
};
