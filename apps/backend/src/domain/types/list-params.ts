import type { PaginatedResult } from "@/shared/types";

export interface ListRequestParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  search?: string;
  filters: Record<string, unknown>;
}

export type ListResponse<T> = PaginatedResult<T>;

export function buildListParams(
  page: number,
  pageSize: number,
  sortBy?: string,
  sortDir?: "asc" | "desc",
  search?: string,
  filters?: Record<string, unknown>,
): ListRequestParams {
  return {
    page: Math.max(1, page),
    pageSize: Math.min(Math.max(1, pageSize), 100),
    sortBy,
    sortDir,
    search: search || undefined,
    filters: filters ?? {},
  };
}
