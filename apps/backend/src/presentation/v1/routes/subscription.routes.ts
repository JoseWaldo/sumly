import { Hono } from "hono";
import { z } from "zod";

import { authMiddleware } from "@/presentation/v1/middlewares/auth.middleware";
import { SubscriptionPrismaRepository } from "@/infrastructure/repositories/subscription-prisma.repository";
import { GetSubscriptionsUseCase } from "@/application/use-cases/subscription/get-subscriptions.use-case";
import { GetSubscriptionByIdUseCase } from "@/application/use-cases/subscription/get-subscription-by-id.use-case";
import { CreateSubscriptionUseCase } from "@/application/use-cases/subscription/create-subscription.use-case";
import { UpdateSubscriptionUseCase } from "@/application/use-cases/subscription/update-subscription.use-case";
import { DeleteSubscriptionUseCase } from "@/application/use-cases/subscription/delete-subscription.use-case";
import { ReportPaymentUseCase } from "@/application/use-cases/subscription/report-payment.use-case";
import { GetSubscriptionDashboardUseCase } from "@/application/use-cases/subscription/get-subscription-dashboard.use-case";
import { GetTagsUseCase, CreateTagUseCase, DeleteTagUseCase } from "@/application/use-cases/subscription/manage-tags.use-case";
import {
  createSubscriptionSchema,
  updateSubscriptionSchema,
  reportPaymentSchema,
  createTagSchema,
} from "@/application/dtos/subscription.dto";
import type { FindSubscriptionsFilters } from "@/domain/repositories/subscription.repository";

const repository = new SubscriptionPrismaRepository();
const getSubscriptions = new GetSubscriptionsUseCase(repository);
const getSubscriptionById = new GetSubscriptionByIdUseCase(repository);
const createSubscription = new CreateSubscriptionUseCase(repository);
const updateSubscription = new UpdateSubscriptionUseCase(repository);
const deleteSubscription = new DeleteSubscriptionUseCase(repository);
const reportPayment = new ReportPaymentUseCase(repository);
const getSubscriptionDashboard = new GetSubscriptionDashboardUseCase(repository);
const getTags = new GetTagsUseCase(repository);
const createTag = new CreateTagUseCase(repository);
const deleteTag = new DeleteTagUseCase(repository);

const subscriptionStatusSchema = z.enum(["ACTIVE", "PAUSED", "CANCELLED"]).optional();

const router = new Hono();

router.use("*", authMiddleware);

router.get("/dashboard", async (c) => {
  const userId = c.get("user").id;
  const result = await getSubscriptionDashboard.execute(userId);
  return c.json(result);
});

router.get("/tags", async (c) => {
  const userId = c.get("user").id;
  const tags = await getTags.execute(userId);
  return c.json(tags);
});

router.post("/tags", async (c) => {
  const userId = c.get("user").id;
  const body = createTagSchema.parse(await c.req.json());
  const tag = await createTag.execute(userId, body);
  return c.json(tag, 201);
});

router.delete("/tags/:id", async (c) => {
  const { id } = c.req.param();
  const userId = c.get("user").id;
  await deleteTag.execute(id, userId);
  return c.json({ message: "Tag eliminado" });
});

router.get("/", async (c) => {
  const userId = c.get("user").id;
  const statusRaw = c.req.query("status");
  const tagId = c.req.query("tagId");
  const search = c.req.query("search");
  const page = Math.max(1, Number(c.req.query("page")) || 1);
  const limit = Math.min(Math.max(1, Number(c.req.query("limit")) || 12), 50);

  const status = statusRaw ? subscriptionStatusSchema.parse(statusRaw) : undefined;

  const filters: FindSubscriptionsFilters = {
    userId,
    status,
    tagId: tagId || undefined,
    search: search || undefined,
    page,
    limit,
  };

  const result = await getSubscriptions.execute(filters);
  return c.json(result);
});

router.get("/:id", async (c) => {
  const { id } = c.req.param();
  const subscription = await getSubscriptionById.execute(id);
  return c.json(subscription);
});

router.post("/", async (c) => {
  const userId = c.get("user").id;
  const body = createSubscriptionSchema.parse(await c.req.json());
  const subscription = await createSubscription.execute(userId, body);
  return c.json(subscription, 201);
});

router.patch("/:id", async (c) => {
  const { id } = c.req.param();
  const userId = c.get("user").id;
  const body = updateSubscriptionSchema.parse(await c.req.json());
  const subscription = await updateSubscription.execute(id, userId, body);
  return c.json(subscription);
});

router.delete("/:id", async (c) => {
  const { id } = c.req.param();
  const userId = c.get("user").id;
  await deleteSubscription.execute(id, userId);
  return c.json({ message: "Suscripcion eliminada" });
});

router.post("/:id/report", async (c) => {
  const { id } = c.req.param();
  const userId = c.get("user").id;
  const body = reportPaymentSchema.parse(await c.req.json());
  const result = await reportPayment.execute(id, userId, body);
  return c.json(result);
});

export default router;
