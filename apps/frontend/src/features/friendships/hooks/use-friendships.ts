import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import type {
  Friendship,
  PaginatedFriendships,
  SearchUserResult,
  SendFriendshipRequestInput,
} from "@/features/friendships/schemas/friendship.schema";

const BASE = "/api/v1/friendships";

interface UseFriendsParams {
  search?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  page: number;
  limit: number;
}

function useFriends(params: UseFriendsParams) {
  return useQuery({
    queryKey: ["friendships", "friends", params],
    queryFn: async () => {
      const q = new URLSearchParams();
      if (params.search) q.set("search", params.search);
      if (params.sortBy) q.set("sortBy", params.sortBy);
      if (params.sortDir) q.set("sortDir", params.sortDir);
      q.set("page", String(params.page));
      q.set("limit", String(params.limit));
      return apiClient<PaginatedFriendships>(`${BASE}?${q.toString()}`);
    },
  });
}

function useSearchUser(email: string) {
  return useQuery({
    queryKey: ["friendships", "search", email],
    queryFn: async () => {
      const q = new URLSearchParams();
      q.set("email", email);
      return apiClient<SearchUserResult>(`${BASE}/search?${q.toString()}`);
    },
    enabled: !!email && email.includes("@"),
  });
}

function useReceivedRequests() {
  return useQuery({
    queryKey: ["friendships", "received"],
    queryFn: () => apiClient<PaginatedFriendships>(`${BASE}/received`),
  });
}

function useSentRequests() {
  return useQuery({
    queryKey: ["friendships", "sent"],
    queryFn: () => apiClient<PaginatedFriendships>(`${BASE}/sent`),
  });
}

function useBlockedUsers() {
  return useQuery({
    queryKey: ["friendships", "blocked"],
    queryFn: () => apiClient<PaginatedFriendships>(`${BASE}/blocked`),
  });
}

function useSendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SendFriendshipRequestInput) => {
      return apiClient<Friendship>(`${BASE}/request`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendships"] });
    },
  });
}

function useAcceptRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient<Friendship>(`${BASE}/${id}/accept`, {
        method: "PATCH",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendships"] });
    },
  });
}

function useRejectRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient<Friendship>(`${BASE}/${id}/reject`, {
        method: "PATCH",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendships"] });
    },
  });
}

function useCancelRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient<{ message: string }>(`${BASE}/${id}/cancel`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendships"] });
    },
  });
}

function useRemoveFriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient<{ message: string }>(`${BASE}/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendships"] });
    },
  });
}

function useBlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { userId: string }) => {
      return apiClient<Friendship>(`${BASE}/block`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendships"] });
    },
  });
}

function useUnblockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient<Friendship | null>(`${BASE}/block/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendships"] });
    },
  });
}

export {
  useFriends,
  useSearchUser,
  useReceivedRequests,
  useSentRequests,
  useBlockedUsers,
  useSendRequest,
  useAcceptRequest,
  useRejectRequest,
  useCancelRequest,
  useRemoveFriend,
  useBlockUser,
  useUnblockUser,
};
