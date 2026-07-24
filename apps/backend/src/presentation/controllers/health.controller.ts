import type { Context } from "hono";

export async function healthCheck(c: Context) {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
}
