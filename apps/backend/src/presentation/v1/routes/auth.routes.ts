import { Hono } from "hono";

import { authHandler, meHandler } from "@/presentation/controllers/auth.controller";

const router = new Hono();

router.get("/auth/me", meHandler);
router.all("/auth/*", authHandler);

export default router;
