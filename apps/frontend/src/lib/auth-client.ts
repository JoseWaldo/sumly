import { createAuthClient } from "better-auth/react";

import { env } from "@/config/env";

export const authClient = createAuthClient({
  baseURL: `${env.apiUrl}/api/v1/auth`,
});

export type AuthSession = typeof authClient.$Infer.Session;
