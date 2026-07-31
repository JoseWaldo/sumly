import { Hono } from "hono";
import { z } from "zod";
import { authMiddleware } from "@/presentation/v1/middlewares/auth.middleware";
import { FriendshipPrismaRepository } from "@/infrastructure/repositories/friendship-prisma.repository";
import { SearchUserByEmailUseCase } from "@/application/use-cases/friendship/search-user-by-email.use-case";
import { SendFriendshipRequestUseCase } from "@/application/use-cases/friendship/send-friendship-request.use-case";
import { GetReceivedRequestsUseCase } from "@/application/use-cases/friendship/get-received-requests.use-case";
import { GetSentRequestsUseCase } from "@/application/use-cases/friendship/get-sent-requests.use-case";
import { AcceptFriendshipUseCase } from "@/application/use-cases/friendship/accept-friendship.use-case";
import { RejectFriendshipUseCase } from "@/application/use-cases/friendship/reject-friendship.use-case";
import { CancelFriendshipRequestUseCase } from "@/application/use-cases/friendship/cancel-friendship-request.use-case";
import { ListFriendsUseCase } from "@/application/use-cases/friendship/list-friends.use-case";
import { RemoveFriendUseCase } from "@/application/use-cases/friendship/remove-friend.use-case";
import { BlockUserUseCase } from "@/application/use-cases/friendship/block-user.use-case";
import { UnblockUserUseCase } from "@/application/use-cases/friendship/unblock-user.use-case";
import { ListBlockedUsersUseCase } from "@/application/use-cases/friendship/list-blocked-users.use-case";
import { sendFriendshipRequestEmail } from "@/infrastructure/email/send-friendship-request-email";
import { sendFriendshipRequestSchema, blockUserSchema } from "@/application/dtos/friendship.dto";
import { prisma } from "@/db";

const repository = new FriendshipPrismaRepository();
const searchUserByEmail = new SearchUserByEmailUseCase(repository);
const sendFriendshipRequest = new SendFriendshipRequestUseCase(repository);
const getReceivedRequests = new GetReceivedRequestsUseCase(repository);
const getSentRequests = new GetSentRequestsUseCase(repository);
const acceptFriendship = new AcceptFriendshipUseCase(repository);
const rejectFriendship = new RejectFriendshipUseCase(repository);
const cancelRequest = new CancelFriendshipRequestUseCase(repository);
const listFriends = new ListFriendsUseCase(repository);
const removeFriend = new RemoveFriendUseCase(repository);
const blockUser = new BlockUserUseCase(repository);
const unblockUser = new UnblockUserUseCase(repository);
const listBlockedUsers = new ListBlockedUsersUseCase(repository);

const sortDirSchema = z.enum(["asc", "desc"]).optional();

const router = new Hono();

router.use("*", authMiddleware);

// HU-61: Buscar usuario por correo exacto
router.get("/search", async (c) => {
  const userId = c.get("user").id;
  const email = c.req.query("email");

  if (!email) {
    return c.json({ error: { code: "VALIDATION_ERROR", message: "El parámetro email es requerido" } }, 400);
  }

  const result = await searchUserByEmail.execute(email, userId);
  return c.json(result);
});

// HU-62: Enviar solicitud de amistad
router.post("/request", async (c) => {
  const userId = c.get("user").id;
  const body = sendFriendshipRequestSchema.parse(await c.req.json());

  const friendship = await sendFriendshipRequest.execute(userId, body.addresseeId);

  const addresseeUser = await prisma.user.findUnique({
    where: { id: body.addresseeId },
    select: { email: true },
  });

  if (addresseeUser?.email) {
    sendFriendshipRequestEmail(addresseeUser.email, c.get("user").name).catch(() => {});
  }

  return c.json(friendship, 201);
});

// HU-63: Ver solicitudes recibidas
router.get("/received", async (c) => {
  const userId = c.get("user").id;
  const result = await getReceivedRequests.execute(userId);
  return c.json(result);
});

// HU-64: Ver solicitudes enviadas
router.get("/sent", async (c) => {
  const userId = c.get("user").id;
  const result = await getSentRequests.execute(userId);
  return c.json(result);
});

// HU-65: Aceptar solicitud
router.patch("/:id/accept", async (c) => {
  const userId = c.get("user").id;
  const { id } = c.req.param();
  const result = await acceptFriendship.execute(id, userId);
  return c.json(result);
});

// HU-66: Rechazar solicitud
router.patch("/:id/reject", async (c) => {
  const userId = c.get("user").id;
  const { id } = c.req.param();
  const result = await rejectFriendship.execute(id, userId);
  return c.json(result);
});

// HU-67: Cancelar solicitud enviada
router.delete("/:id/cancel", async (c) => {
  const userId = c.get("user").id;
  const { id } = c.req.param();
  await cancelRequest.execute(id, userId);
  return c.json({ message: "Solicitud cancelada" });
});

// HU-68: Listado de amigos
router.get("/", async (c) => {
  const userId = c.get("user").id;
  const search = c.req.query("search");
  const sortByRaw = c.req.query("sortBy");
  const sortDirRaw = c.req.query("sortDir");
  const page = Math.max(1, Number(c.req.query("page")) || 1);
  const limit = Math.min(Math.max(1, Number(c.req.query("limit")) || 20), 50);

  const sortBy = sortByRaw || undefined;
  const sortDir = sortDirRaw ? sortDirSchema.parse(sortDirRaw) : undefined;

  const result = await listFriends.execute({
    userId,
    search: search || undefined,
    page,
    limit,
    sortBy,
    sortDir,
  });

  return c.json(result);
});

// HU-69: Eliminar amigo
router.delete("/:id", async (c) => {
  const userId = c.get("user").id;
  const { id } = c.req.param();
  await removeFriend.execute(id, userId);
  return c.json({ message: "Amigo eliminado" });
});

// HU-70: Bloquear usuario
router.post("/block", async (c) => {
  const userId = c.get("user").id;
  const body = blockUserSchema.parse(await c.req.json());
  const result = await blockUser.execute(userId, body.userId);
  return c.json(result, 201);
});

// HU-70: Desbloquear usuario
router.delete("/block/:id", async (c) => {
  const userId = c.get("user").id;
  const { id } = c.req.param();
  const result = await unblockUser.execute(id, userId);
  return c.json(result);
});

// HU-70: Listado de bloqueados
router.get("/blocked", async (c) => {
  const userId = c.get("user").id;
  const result = await listBlockedUsers.execute(userId);
  return c.json(result);
});

export default router;
