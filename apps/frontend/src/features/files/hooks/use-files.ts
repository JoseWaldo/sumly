import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/api/client";
import type { PaginatedFiles, FileFilters } from "@/features/files/schemas/file.schema";

export function useFiles(filters: FileFilters) {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortDir) params.set("sortDir", filters.sortDir);

  const queryString = params.toString();
  const endpoint = `/api/v1/files${queryString ? `?${queryString}` : ""}`;

  return useQuery({
    queryKey: ["files", filters],
    queryFn: () => apiClient<PaginatedFiles>(endpoint),
  });
}
