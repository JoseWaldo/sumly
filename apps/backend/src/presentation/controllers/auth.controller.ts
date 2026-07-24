import type { Context } from "hono";

import { auth } from "@/infrastructure/auth/better-auth";

export async function authHandler(c: Context) {
  return auth.handler(c.req.raw);
}

export async function meHandler(c: Context) {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json(null, 200);
  }

  return c.json({
    user: session.user,
    session: session.session,
  });
}
