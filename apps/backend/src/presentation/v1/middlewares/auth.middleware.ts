import type { Context, Next } from "hono";

import { auth } from "@/infrastructure/auth/better-auth";
import { UnauthorizedError } from "@/shared/errors";

export async function authMiddleware(c: Context, next: Next) {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    throw new UnauthorizedError();
  }

  c.set("user", session.user);
  c.set("session", session.session);

  await next();
}
