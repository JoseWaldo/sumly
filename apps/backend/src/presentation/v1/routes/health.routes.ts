import { Hono } from "hono";

import { healthCheck } from "@/presentation/controllers/health.controller";

const router = new Hono();

router.get("/", healthCheck);

export default router;
