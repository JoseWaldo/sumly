import { Hono } from "hono";
import { z } from "zod";

import { authMiddleware } from "@/presentation/v1/middlewares/auth.middleware";
import { CategoryPrismaRepository } from "@/infrastructure/repositories/category-prisma.repository";
import { GetCategoriesUseCase } from "@/application/use-cases/category/get-categories.use-case";
import { GetCategoryByIdUseCase } from "@/application/use-cases/category/get-category-by-id.use-case";
import { CreateCategoryUseCase } from "@/application/use-cases/category/create-category.use-case";
import { UpdateCategoryUseCase } from "@/application/use-cases/category/update-category.use-case";
import { DeleteCategoryUseCase } from "@/application/use-cases/category/delete-category.use-case";
import { createCategorySchema, updateCategorySchema } from "@/application/dtos/category.dto";
import { ConflictError } from "@/shared/errors";
import type { FindCategoriesFilters } from "@/domain/repositories/category.repository";

const repository = new CategoryPrismaRepository();
const getCategories = new GetCategoriesUseCase(repository);
const getCategoryById = new GetCategoryByIdUseCase(repository);
const createCategory = new CreateCategoryUseCase(repository);
const updateCategory = new UpdateCategoryUseCase(repository);
const deleteCategory = new DeleteCategoryUseCase(repository);

const categoryTypeSchema = z.enum(["INCOME", "EXPENSE"]).optional();

const router = new Hono();

router.use("*", authMiddleware);

router.get("/", async (c) => {
  const userId = c.get("user").id;
  const typeRaw = c.req.query("type");
  const search = c.req.query("search");
  const page = Math.max(1, Number(c.req.query("page")) || 1);
  const limit = Math.min(Math.max(1, Number(c.req.query("limit")) || 10), 50);

  const type = typeRaw ? categoryTypeSchema.parse(typeRaw) : undefined;

  const filters: FindCategoriesFilters = {
    userId,
    type,
    search: search || undefined,
    page,
    limit,
  };

  const result = await getCategories.execute(filters);
  return c.json(result);
});

router.get("/:id", async (c) => {
  const { id } = c.req.param();
  const category = await getCategoryById.execute(id);
  return c.json(category);
});

router.post("/", async (c) => {
  const userId = c.get("user").id;
  const body = createCategorySchema.parse(await c.req.json());

  const allCategories = await getCategories.execute({
    userId,
    page: 1,
    limit: 1000,
  });
  const duplicate = allCategories.data.find(
    (cat) => cat.name.toLowerCase() === body.name.toLowerCase() && cat.userId === userId
  );
  if (duplicate) {
    throw new ConflictError("Ya tienes una categoria con ese nombre");
  }

  const category = await createCategory.execute(userId, body);
  return c.json(category, 201);
});

router.patch("/:id", async (c) => {
  const { id } = c.req.param();
  const userId = c.get("user").id;
  const body = updateCategorySchema.parse(await c.req.json());

  const category = await updateCategory.execute(id, userId, body);
  return c.json(category);
});

router.delete("/:id", async (c) => {
  const { id } = c.req.param();
  const userId = c.get("user").id;

  await deleteCategory.execute(id, userId);
  return c.json({ message: "Categoria eliminada" });
});

export default router;
