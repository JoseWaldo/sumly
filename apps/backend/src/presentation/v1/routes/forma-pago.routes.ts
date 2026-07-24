import { Hono } from "hono";
import { authMiddleware } from "@/presentation/v1/middlewares/auth.middleware";
import { FormaPagoPrismaRepository } from "@/infrastructure/repositories/forma-pago-prisma.repository";
import { GetFormasPagoUseCase } from "@/application/use-cases/forma-pago/get-formas-pago.use-case";
import { GetFormaPagoByIdUseCase } from "@/application/use-cases/forma-pago/get-forma-pago-by-id.use-case";
import { CreateFormaPagoUseCase } from "@/application/use-cases/forma-pago/create-forma-pago.use-case";
import { UpdateFormaPagoUseCase } from "@/application/use-cases/forma-pago/update-forma-pago.use-case";
import { DeleteFormaPagoUseCase } from "@/application/use-cases/forma-pago/delete-forma-pago.use-case";
import { RevealFormaPagoUseCase } from "@/application/use-cases/forma-pago/reveal-forma-pago.use-case";
import {
  createFormaPagoSchema,
  updateFormaPagoSchema,
} from "@/application/dtos/forma-pago.dto";
import type { FindFormasPagoFilters } from "@/domain/repositories/forma-pago.repository";

const repository = new FormaPagoPrismaRepository();
const getFormasPago = new GetFormasPagoUseCase(repository);
const getFormaPagoById = new GetFormaPagoByIdUseCase(repository);
const createFormaPago = new CreateFormaPagoUseCase(repository);
const updateFormaPago = new UpdateFormaPagoUseCase(repository);
const deleteFormaPago = new DeleteFormaPagoUseCase(repository);
const revealFormaPago = new RevealFormaPagoUseCase(repository);

const EFECTIVO_GRADIENTE_INICIO = "#2D6A4F";
const EFECTIVO_GRADIENTE_FIN = "#1B4332";

const router = new Hono();

router.use("*", authMiddleware);

router.get("/", async (c) => {
  const userId = c.get("user").id;
  const search = c.req.query("search");
  const page = Math.max(1, Number(c.req.query("page")) || 1);
  const limit = Math.min(Math.max(1, Number(c.req.query("limit")) || 24), 50);

  let efectivo = await repository.findEfectivoByUser(userId);
  if (!efectivo) {
    efectivo = await repository.create({
      nombre: "Efectivo",
      tipo: "CASH",
      numeroEncriptado: null,
      ultimosCuatro: null,
      publico: false,
      gradienteInicio: EFECTIVO_GRADIENTE_INICIO,
      gradienteFin: EFECTIVO_GRADIENTE_FIN,
      entidadFinancieraId: null,
      userId,
    });
  }

  const filters: FindFormasPagoFilters = {
    userId,
    search: search || undefined,
    page,
    limit,
  };

  const result = await getFormasPago.execute(filters);
  return c.json(result);
});

router.get("/:id", async (c) => {
  const { id } = c.req.param();
  const userId = c.get("user").id;
  const formaPago = await getFormaPagoById.execute(id, userId);
  return c.json(formaPago);
});

router.get("/:id/reveal", async (c) => {
  const { id } = c.req.param();
  const userId = c.get("user").id;
  const numero = await revealFormaPago.execute(id, userId);
  return c.json({ numero });
});

router.post("/", async (c) => {
  const userId = c.get("user").id;
  const body = createFormaPagoSchema.parse(await c.req.json());
  const formaPago = await createFormaPago.execute(userId, body);
  return c.json(formaPago, 201);
});

router.patch("/:id", async (c) => {
  const { id } = c.req.param();
  const userId = c.get("user").id;
  const body = updateFormaPagoSchema.parse(await c.req.json());
  const formaPago = await updateFormaPago.execute(id, userId, body);
  return c.json(formaPago);
});

router.delete("/:id", async (c) => {
  const { id } = c.req.param();
  const userId = c.get("user").id;
  await deleteFormaPago.execute(id, userId);
  return c.json({ message: "Forma de pago eliminada" });
});

export default router;
