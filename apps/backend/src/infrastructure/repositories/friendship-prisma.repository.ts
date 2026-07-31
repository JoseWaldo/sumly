import { prisma } from "@/db";
import type { PrismaClient } from "@/prisma";
import type {
  IFriendshipRepository,
  FindFriendshipsFilters,
  SearchUserResult,
} from "@/domain/repositories/friendship.repository";
import type { FriendshipEntity } from "@/domain/entities/friendship.entity";
import type { PaginatedResult } from "@/shared/types";
import type {
  FriendshipListRow,
  SpListResult,
} from "@/domain/types/sp-row-types";

const COOLDOWN_DAYS = 30;

export class FriendshipPrismaRepository implements IFriendshipRepository {
  private db: PrismaClient;

  constructor(client: PrismaClient = prisma) {
    this.db = client;
  }

  async searchUserByEmail(email: string, currentUserId: string): Promise<SearchUserResult | null> {
    const user = await this.db.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, image: true },
    });

    if (!user || user.id === currentUserId) {
      return user
        ? { id: user.id, name: user.name, image: user.image, email: user.email, existingFriendship: null }
        : null;
    }

    const friendship = await this.findByPair(currentUserId, user.id);

    let direction: "sent" | "received" | null = null;
    if (friendship) {
      direction = friendship.requesterId === currentUserId ? "sent" : "received";
    }

    return {
      id: user.id,
      name: user.name,
      image: user.image,
      email: user.email,
      existingFriendship: friendship
        ? { id: friendship.id, status: friendship.status, direction }
        : null,
    };
  }

  async createRequest(requesterId: string, addresseeId: string): Promise<FriendshipEntity> {
    const existing = await this.findByPair(requesterId, addresseeId);

    if (existing) {
      if (existing.status === "PENDING" || existing.status === "ACCEPTED") {
        throw new Error("Ya existe una relación activa o pendiente entre estos usuarios");
      }

      if (existing.status === "BLOCKED") {
        throw new Error("No se puede enviar solicitud porque uno de los usuarios bloqueó al otro");
      }

      if (existing.status === "REJECTED") {
        const cooldownExpiry = existing.respondedAt
          ? new Date(existing.respondedAt.getTime() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000)
          : null;

        if (cooldownExpiry && cooldownExpiry > new Date() && existing.requesterId === requesterId) {
          throw new Error(
            `No puedes enviar una nueva solicitud hasta dentro de ${COOLDOWN_DAYS} días desde el rechazo`
          );
        }

        const friendship = await this.db.friendship.update({
          where: { id: existing.id },
          data: {
            requesterId,
            addresseeId,
            status: "PENDING",
            previousStatus: null,
            blockedById: null,
            respondedAt: null,
          },
        });

        return this.toEntity(friendship);
      }
    }

    const friendship = await this.db.friendship.create({
      data: {
        requesterId,
        addresseeId,
        status: "PENDING",
      },
    });

    return this.toEntity(friendship);
  }

  async findAll(filters: FindFriendshipsFilters): Promise<PaginatedResult<FriendshipEntity>> {
    const rows = await this.db.$queryRaw<[{ sp_list_tbl_friendships: SpListResult<FriendshipListRow> }]>`
      SELECT sp_list_tbl_friendships(
        ${filters.userId}::TEXT,
        ${filters.search || null}::TEXT,
        ${filters.page}::INT,
        ${filters.limit}::INT,
        ${filters.sortBy || null}::TEXT,
        ${filters.sortDir || null}::TEXT,
        ${filters.status || null}::TEXT,
        ${filters.perspective || "either"}::TEXT
      )
    `;

    const result = rows[0]?.sp_list_tbl_friendships;

    if (!result) {
      return { data: [], total: 0, page: filters.page, limit: filters.limit, totalPages: 0 };
    }

    return {
      data: (result.data ?? []).map((row) => this.rowToEntity(row)),
      total: Number(result.total),
      page: filters.page,
      limit: filters.limit,
      totalPages: result.totalPages,
    };
  }

  async accept(friendshipId: string, userId: string): Promise<FriendshipEntity> {
    const friendship = await this.db.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      throw new Error("Solicitud no encontrada");
    }

    if (friendship.addresseeId !== userId) {
      throw new Error("Solo el destinatario puede aceptar la solicitud");
    }

    if (friendship.status !== "PENDING") {
      throw new Error("La solicitud ya no está pendiente");
    }

    const updated = await this.db.friendship.update({
      where: { id: friendshipId },
      data: {
        status: "ACCEPTED",
        respondedAt: new Date(),
      },
    });

    return this.toEntity(updated);
  }

  async reject(friendshipId: string, userId: string): Promise<FriendshipEntity> {
    const friendship = await this.db.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      throw new Error("Solicitud no encontrada");
    }

    if (friendship.addresseeId !== userId) {
      throw new Error("Solo el destinatario puede rechazar la solicitud");
    }

    if (friendship.status !== "PENDING") {
      throw new Error("La solicitud ya no está pendiente");
    }

    const updated = await this.db.friendship.update({
      where: { id: friendshipId },
      data: {
        status: "REJECTED",
        respondedAt: new Date(),
      },
    });

    return this.toEntity(updated);
  }

  async cancel(friendshipId: string, userId: string): Promise<void> {
    const friendship = await this.db.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      throw new Error("Solicitud no encontrada");
    }

    if (friendship.requesterId !== userId) {
      throw new Error("Solo el solicitante puede cancelar la solicitud");
    }

    if (friendship.status !== "PENDING") {
      throw new Error("La solicitud ya no está pendiente");
    }

    await this.db.friendship.delete({
      where: { id: friendshipId },
    });
  }

  async removeFriend(friendshipId: string, userId: string): Promise<void> {
    const friendship = await this.db.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      throw new Error("Amistad no encontrada");
    }

    if (friendship.requesterId !== userId && friendship.addresseeId !== userId) {
      throw new Error("No perteneces a esta relación de amistad");
    }

    if (friendship.status !== "ACCEPTED") {
      throw new Error("Esta relación no es una amistad activa");
    }

    await this.db.friendship.delete({
      where: { id: friendshipId },
    });
  }

  async blockUser(blockerId: string, targetUserId: string): Promise<FriendshipEntity> {
    const existing = await this.findByPair(blockerId, targetUserId);

    if (existing) {
      if (existing.blockedById === blockerId && existing.status === "BLOCKED") {
        return existing;
      }

      const previousStatus = existing.status === "ACCEPTED" ? "ACCEPTED" : existing.status;

      const updated = await this.db.friendship.update({
        where: { id: existing.id },
        data: {
          requesterId: blockerId,
          addresseeId: targetUserId,
          status: "BLOCKED",
          previousStatus,
          blockedById: blockerId,
        },
      });

      return this.toEntity(updated);
    }

    const created = await this.db.friendship.create({
      data: {
        requesterId: blockerId,
        addresseeId: targetUserId,
        status: "BLOCKED",
        blockedById: blockerId,
      },
    });

    return this.toEntity(created);
  }

  async unblockUser(friendshipId: string, userId: string): Promise<FriendshipEntity | null> {
    const friendship = await this.db.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      throw new Error("Relación no encontrada");
    }

    if (friendship.blockedById !== userId) {
      throw new Error("Solo quien bloqueó puede desbloquear");
    }

    if (friendship.status !== "BLOCKED") {
      throw new Error("Este usuario no está bloqueado");
    }

    if (friendship.previousStatus === "ACCEPTED") {
      const restored = await this.db.friendship.update({
        where: { id: friendshipId },
        data: {
          status: "ACCEPTED",
          previousStatus: null,
          blockedById: null,
          respondedAt: friendship.respondedAt,
        },
      });

      return this.toEntity(restored);
    }

    await this.db.friendship.delete({
      where: { id: friendshipId },
    });

    return null;
  }

  async findByPair(userIdA: string, userIdB: string): Promise<FriendshipEntity | null> {
    const result = await this.db.friendship.findFirst({
      where: {
        OR: [
          { requesterId: userIdA, addresseeId: userIdB },
          { requesterId: userIdB, addresseeId: userIdA },
        ],
      },
    });

    return result ? this.toEntity(result) : null;
  }

  async findById(id: string): Promise<FriendshipEntity | null> {
    const result = await this.db.friendship.findUnique({
      where: { id },
    });

    return result ? this.toEntity(result) : null;
  }

  private rowToEntity(row: FriendshipListRow): FriendshipEntity {
    return {
      id: row.id,
      requesterId: row.requesterId,
      addresseeId: row.addresseeId,
      status: row.status,
      previousStatus: null,
      blockedById: row.blockedById ?? null,
      respondedAt: row.respondedAt ? new Date(row.respondedAt) : null,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      otherUser: row.otherUser
        ? {
            id: row.otherUser.id,
            name: row.otherUser.name,
            image: row.otherUser.image,
            email: row.otherUser.email,
          }
        : undefined,
    };
  }

  private toEntity(row: {
    id: string;
    requesterId: string;
    addresseeId: string;
    status: string;
    previousStatus: string | null;
    blockedById: string | null;
    respondedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): FriendshipEntity {
    return {
      id: row.id,
      requesterId: row.requesterId,
      addresseeId: row.addresseeId,
      status: row.status as FriendshipEntity["status"],
      previousStatus: row.previousStatus as FriendshipEntity["previousStatus"],
      blockedById: row.blockedById,
      respondedAt: row.respondedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
