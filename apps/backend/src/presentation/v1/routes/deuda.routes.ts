import { Hono } from "hono";
import { z } from "zod";

import { authMiddleware } from "@/presentation/v1/middlewares/auth.middleware";
import { DeudaPrismaRepository } from "@/infrastructure/repositories/deuda-prisma.repository";
import { FriendshipPrismaRepository } from "@/infrastructure/repositories/friendship-prisma.repository";
import { FormaPagoPrismaRepository } from "@/infrastructure/repositories/forma-pago-prisma.repository";
import { CreateDeudaUseCase } from "@/application/use-cases/deuda/create-deuda.use-case";
import { GetDeudasUseCase } from "@/application/use-cases/deuda/get-deudas.use-case";
import { GetDeudaDetailUseCase } from "@/application/use-cases/deuda/get-deuda-detail.use-case";
import { GetDeudaDashboardUseCase } from "@/application/use-cases/deuda/get-deuda-dashboard.use-case";
import { GetDeudaEventosUseCase } from "@/application/use-cases/deuda/get-deuda-eventos.use-case";
import { ReportarAbonoUseCase } from "@/application/use-cases/deuda/reportar-abono.use-case";
import { ConfirmarAbonoUseCase } from "@/application/use-cases/deuda/confirmar-abono.use-case";
import { RechazarAbonoUseCase } from "@/application/use-cases/deuda/rechazar-abono.use-case";
import { ResolverDisputaUseCase } from "@/application/use-cases/deuda/resolver-disputa.use-case";
import { CancelarDeudaUseCase } from "@/application/use-cases/deuda/cancelar-deuda.use-case";
import { PerdonarDeudaUseCase } from "@/application/use-cases/deuda/perdonar-deuda.use-case";
import { EliminarDeudaUseCase } from "@/application/use-cases/deuda/eliminar-deuda.use-case";
import { createDeudaSchema, reportarAbonoSchema, resolverDisputaSchema } from "@/application/dtos/deuda.dto";
import { ValidationError, ConflictError } from "@/shared/errors";

const deudaRepo = new DeudaPrismaRepository();
const friendshipRepo = new FriendshipPrismaRepository();
const formaPagoRepo = new FormaPagoPrismaRepository();

const createDeuda = new CreateDeudaUseCase(deudaRepo, friendshipRepo);
const getDeudas = new GetDeudasUseCase(deudaRepo);
const getDeudaDetail = new GetDeudaDetailUseCase(deudaRepo);
const getDeudaDashboard = new GetDeudaDashboardUseCase(deudaRepo);
const getDeudaEventos = new GetDeudaEventosUseCase(deudaRepo);
const reportarAbono = new ReportarAbonoUseCase(deudaRepo, formaPagoRepo);
const confirmarAbono = new ConfirmarAbonoUseCase(deudaRepo);
const rechazarAbono = new RechazarAbonoUseCase(deudaRepo);
const resolverDisputa = new ResolverDisputaUseCase(deudaRepo);
const cancelarDeuda = new CancelarDeudaUseCase(deudaRepo);
const perdonarDeuda = new PerdonarDeudaUseCase(deudaRepo);
const eliminarDeuda = new EliminarDeudaUseCase(deudaRepo);

const direccionSchema = z.enum(["ME_DEBEN", "YO_DEBO"]).optional();
const estadoSchema = z
  .enum(["PENDIENTE", "ESPERANDO_CONFIRMACION", "PAGADA", "DISPUTADA", "VENCIDA", "CANCELADA", "PERDONADA"])
  .optional();
const sortDirSchema = z.enum(["asc", "desc"]).optional();

const router = new Hono();

router.use("*", authMiddleware);

// GET /deudas — listado paginado con filtros
router.get("/", async (c) => {
  const userId = c.get("user").id;
  const page = Math.max(1, Number(c.req.query("page")) || 1);
  const limit = Math.min(Math.max(1, Number(c.req.query("limit")) || 10), 50);
  const search = c.req.query("search") || undefined;
  const sortBy = c.req.query("sortBy") || undefined;
  const sortDir = c.req.query("sortDir") ? sortDirSchema.parse(c.req.query("sortDir")) : undefined;
  const direccion = c.req.query("direccion") ? direccionSchema.parse(c.req.query("direccion")) : undefined;
  const estado = c.req.query("estado") ? estadoSchema.parse(c.req.query("estado")) : undefined;

  const result = await getDeudas.execute({
    userId,
    direccion,
    estado,
    search,
    page,
    limit,
    sortBy,
    sortDir,
  });

  return c.json(result);
});

// POST /deudas — crear deuda (individual o grupal)
router.post("/", async (c) => {
  const userId = c.get("user").id;
  const body = createDeudaSchema.parse(await c.req.json());
  const result = await createDeuda.execute(userId, body);
  return c.json(result, 201);
});

// GET /deudas/dashboard — resumen
router.get("/dashboard", async (c) => {
  const userId = c.get("user").id;
  const result = await getDeudaDashboard.execute(userId);
  return c.json(result);
});

// GET /deudas/:id — detalle
router.get("/:id", async (c) => {
  const { id } = c.req.param();
  const result = await getDeudaDetail.execute(id);
  return c.json(result);
});

// GET /deudas/:id/eventos — historial
router.get("/:id/eventos", async (c) => {
  const { id } = c.req.param();
  const result = await getDeudaEventos.execute(id);
  return c.json(result);
});

// POST /deudas/:id/cancelar
router.post("/:id/cancelar", async (c) => {
  const userId = c.get("user").id;
  const { id } = c.req.param();
  const result = await cancelarDeuda.execute(userId, id);
  return c.json(result);
});

// POST /deudas/:id/perdonar
router.post("/:id/perdonar", async (c) => {
  const userId = c.get("user").id;
  const { id } = c.req.param();
  const result = await perdonarDeuda.execute(userId, id);
  return c.json(result);
});

// POST /deudas/:id/abonos — reportar pago (idempotente)
router.post("/:id/abonos", async (c) => {
  const userId = c.get("user").id;
  const { id } = c.req.param();
  const body = reportarAbonoSchema.parse(await c.req.json());
  const result = await reportarAbono.execute(userId, id, body);
  return c.json(result, 201);
});

// POST /deudas/:id/abonos/:abonoId/confirmar
router.post("/:id/abonos/:abonoId/confirmar", async (c) => {
  const userId = c.get("user").id;
  const { id, abonoId } = c.req.param();
  const result = await confirmarAbono.execute(userId, id, abonoId);
  return c.json(result);
});

// POST /deudas/:id/abonos/:abonoId/rechazar
router.post("/:id/abonos/:abonoId/rechazar", async (c) => {
  const userId = c.get("user").id;
  const { id, abonoId } = c.req.param();
  const result = await rechazarAbono.execute(userId, id, abonoId);
  return c.json(result);
});

// POST /deudas/:id/disputa — resolver disputa
router.post("/:id/disputa", async (c) => {
  const userId = c.get("user").id;
  const { id } = c.req.param();
  const body = resolverDisputaSchema.parse(await c.req.json());
  const result = await resolverDisputa.execute(userId, id, body);
  return c.json(result);
});

// DELETE /deudas/:id — hard delete (solo sin espejo ni abonos)
router.delete("/:id", async (c) => {
  const userId = c.get("user").id;
  const { id } = c.req.param();

  try {
    await eliminarDeuda.execute(userId, id);
    return c.json({ message: "Deuda eliminada" });
  } catch (e: any) {
    if (e.message?.includes("espejo") || e.message?.includes("abonos")) {
      throw new ConflictError(e.message);
    }
    throw e;
  }
});

export default router;
