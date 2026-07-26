import { env } from "@/config/env";

export async function apiClient<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(`${env.apiUrl}${endpoint}`, {
    ...options,
    credentials: "include",
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: { code: "UNKNOWN", message: "Something went wrong" },
    }));
    throw new Error(
      error?.error?.message ?? `Request failed with status ${response.status}`
    );
  }

  return response.json();
}
