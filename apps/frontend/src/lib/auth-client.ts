import { createAuthClient } from "better-auth/react";

import { env } from "@/config/env";

const baseUrl = env.apiUrl || (typeof window !== "undefined" ? window.location.origin : "");

export const authClient = createAuthClient({
  baseURL: `${baseUrl}/api/v1/auth`,
});

export type AuthSession = typeof authClient.$Infer.Session;
