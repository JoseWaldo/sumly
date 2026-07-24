import { Hono } from "hono";
import { z } from "zod";

import { authMiddleware } from "@/presentation/v1/middlewares/auth.middleware";
import { TransactionPrismaRepository } from "@/infrastructure/repositories/transaction-prisma.repository";
import { GetTransactionsUseCase } from "@/application/use-cases/transaction/get-transactions.use-case";
import { CreateTransactionUseCase } from "@/application/use-cases/transaction/create-transaction.use-case";
import { UpdateTransactionUseCase } from "@/application/use-cases/transaction/update-transaction.use-case";
import { DeleteTransactionUseCase } from "@/application/use-cases/transaction/delete-transaction.use-case";
import { GetDashboardSummaryUseCase } from "@/application/use-cases/transaction/get-dashboard-summary.use-case";
import { GetExpensesByCategoryUseCase } from "@/application/use-cases/transaction/get-expenses-by-category.use-case";
import { createTransactionSchema, updateTransactionSchema } from "@/application/dtos/transaction.dto";
import type { FindTransactionsFilters } from "@/domain/repositories/transaction.repository";

const repository = new TransactionPrismaRepository();
const getTransactions = new GetTransactionsUseCase(repository);
const createTransaction = new CreateTransactionUseCase(repository);
const updateTransaction = new UpdateTransactionUseCase(repository);
const deleteTransaction = new DeleteTransactionUseCase(repository);
const getDashboardSummary = new GetDashboardSummaryUseCase(repository);
const getExpensesByCategory = new GetExpensesByCategoryUseCase(repository);

const transactionTypeSchema = z.enum(["INCOME", "EXPENSE"]).optional();

const router = new Hono();

router.use("*", authMiddleware);

router.get("/dashboard", async (c) => {
  const userId = c.get("user").id;
  const result = await getDashboardSummary.execute(userId);
  return c.json(result);
});

router.get("/dashboard/expenses-by-category", async (c) => {
  const userId = c.get("user").id;
  const now = new Date();
  const month = Number(c.req.query("month")) || now.getMonth() + 1;
  const year = Number(c.req.query("year")) || now.getFullYear();

  const result = await getExpensesByCategory.execute(userId, month, year);
  return c.json(result);
});

router.get("/", async (c) => {
  const userId = c.get("user").id;
  const typeRaw = c.req.query("type");
  const search = c.req.query("search");
  const monthRaw = c.req.query("month");
  const yearRaw = c.req.query("year");
  const page = Math.max(1, Number(c.req.query("page")) || 1);
  const limit = Math.min(Math.max(1, Number(c.req.query("limit")) || 10), 50);

  const type = typeRaw ? transactionTypeSchema.parse(typeRaw) : undefined;
  const month = monthRaw ? Number(monthRaw) : undefined;
  const year = yearRaw ? Number(yearRaw) : undefined;

  const filters: FindTransactionsFilters = {
    userId,
    type,
    month,
    year,
    search: search || undefined,
    page,
    limit,
  };

  const result = await getTransactions.execute(filters);
  return c.json(result);
});

router.get("/:id", async (c) => {
  const { id } = c.req.param();
  const transaction = await repository.findById(id);
  if (!transaction) {
    return c.json({ error: { code: "NOT_FOUND", message: "Movimiento no encontrado" } }, 404);
  }

  if (transaction.userId !== c.get("user").id) {
    return c.json({ error: { code: "UNAUTHORIZED", message: "No tienes acceso a este movimiento" } }, 401);
  }

  return c.json(transaction);
});

router.post("/", async (c) => {
  const userId = c.get("user").id;
  const body = createTransactionSchema.parse(await c.req.json());

  const transaction = await createTransaction.execute(userId, body);
  return c.json(transaction, 201);
});

router.patch("/:id", async (c) => {
  const { id } = c.req.param();
  const userId = c.get("user").id;
  const body = updateTransactionSchema.parse(await c.req.json());

  const transaction = await updateTransaction.execute(id, userId, body);
  return c.json(transaction);
});

router.delete("/:id", async (c) => {
  const { id } = c.req.param();
  const userId = c.get("user").id;

  await deleteTransaction.execute(id, userId);
  return c.json({ message: "Movimiento eliminado" });
});

export default router;
