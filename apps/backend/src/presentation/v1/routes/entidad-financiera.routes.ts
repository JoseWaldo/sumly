import { Hono } from "hono";
import { z } from "zod";

import { authMiddleware } from "@/presentation/v1/middlewares/auth.middleware";
import { EntidadFinancieraPrismaRepository } from "@/infrastructure/repositories/entidad-financiera-prisma.repository";
import { GetEntidadesFinancierasUseCase } from "@/application/use-cases/entidad-financiera/get-entidades-financieras.use-case";
import { GetEntidadFinancieraByIdUseCase } from "@/application/use-cases/entidad-financiera/get-entidad-financiera-by-id.use-case";
import { CreateEntidadFinancieraUseCase } from "@/application/use-cases/entidad-financiera/create-entidad-financiera.use-case";
import { UpdateEntidadFinancieraUseCase } from "@/application/use-cases/entidad-financiera/update-entidad-financiera.use-case";
import { DeleteEntidadFinancieraUseCase } from "@/application/use-cases/entidad-financiera/delete-entidad-financiera.use-case";
import {
  createEntidadFinancieraSchema,
  updateEntidadFinancieraSchema,
} from "@/application/dtos/entidad-financiera.dto";
import type { FindEntidadesFinancierasFilters } from "@/domain/repositories/entidad-financiera.repository";

const repository = new EntidadFinancieraPrismaRepository();
const getEntidades = new GetEntidadesFinancierasUseCase(repository);
const getEntidadById = new GetEntidadFinancieraByIdUseCase(repository);
const createEntidad = new CreateEntidadFinancieraUseCase(repository);
const updateEntidad = new UpdateEntidadFinancieraUseCase(repository);
const deleteEntidad = new DeleteEntidadFinancieraUseCase(repository);

const sortDirSchema = z.enum(["asc", "desc"]).optional();

const router = new Hono();

router.use("*", authMiddleware);

router.get("/", async (c) => {
  const userId = c.get("user").id;
  const search = c.req.query("search");
  const sortByRaw = c.req.query("sortBy");
  const sortDirRaw = c.req.query("sortDir");
  const page = Math.max(1, Number(c.req.query("page")) || 1);
  const limit = Math.min(Math.max(1, Number(c.req.query("limit")) || 50), 100);

  const sortBy = sortByRaw || undefined;
  const sortDir = sortDirRaw ? sortDirSchema.parse(sortDirRaw) : undefined;

  const filters: FindEntidadesFinancierasFilters = {
    userId,
    search: search || undefined,
    page,
    limit,
    sortBy,
    sortDir,
  };

  const result = await getEntidades.execute(filters);
  return c.json(result);
});

router.get("/:id", async (c) => {
  const { id } = c.req.param();
  const entidad = await getEntidadById.execute(id);
  return c.json(entidad);
});

router.post("/", async (c) => {
  const userId = c.get("user").id;
  const body = createEntidadFinancieraSchema.parse(await c.req.json());
  const entidad = await createEntidad.execute(userId, body);
  return c.json(entidad, 201);
});

router.patch("/:id", async (c) => {
  const { id } = c.req.param();
  const userId = c.get("user").id;
  const body = updateEntidadFinancieraSchema.parse(await c.req.json());
  const entidad = await updateEntidad.execute(id, userId, body);
  return c.json(entidad);
});

router.delete("/:id", async (c) => {
  const { id } = c.req.param();
  const userId = c.get("user").id;
  await deleteEntidad.execute(id, userId);
  return c.json({ message: "Entidad financiera eliminada" });
});

export default router;
