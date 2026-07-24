import { Hono } from "hono";

import healthRoutes from "@/presentation/v1/routes/health.routes";
import authRoutes from "@/presentation/v1/routes/auth.routes";
import categoryRoutes from "@/presentation/v1/routes/category.routes";
import transactionRoutes from "@/presentation/v1/routes/transaction.routes";
import subscriptionRoutes from "@/presentation/v1/routes/subscription.routes";
import entidadFinancieraRoutes from "@/presentation/v1/routes/entidad-financiera.routes";
import formaPagoRoutes from "@/presentation/v1/routes/forma-pago.routes";
import { authMiddleware } from "@/presentation/v1/middlewares/auth.middleware";

const router = new Hono();

router.route("/health", healthRoutes);
router.route("/", authRoutes);
router.route("/categories", categoryRoutes);
router.route("/transactions", transactionRoutes);
router.route("/subscriptions", subscriptionRoutes);
router.route("/entidades-financieras", entidadFinancieraRoutes);
router.route("/formas-pago", formaPagoRoutes);

router.get("/profile", authMiddleware, (c) => {
  return c.json({ user: c.get("user") });
});

export default router;
