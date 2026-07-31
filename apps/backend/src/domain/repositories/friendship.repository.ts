import type { FriendshipEntity } from "@/domain/entities/friendship.entity";
import type { PaginatedResult } from "@/shared/types";

export interface SearchUserResult {
  id: string;
  name: string;
  image: string | null;
  email: string;
  existingFriendship: {
    id: string;
    status: string;
    direction: "sent" | "received" | null;
  } | null;
}

export interface FindFriendshipsFilters {
  userId: string;
  status?: "PENDING" | "ACCEPTED" | "BLOCKED" | "REJECTED";
  perspective?: "requester" | "addressee" | "either";
  search?: string;
  page: number;
  limit: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface IFriendshipRepository {
  searchUserByEmail(email: string, currentUserId: string): Promise<SearchUserResult | null>;

  createRequest(requesterId: string, addresseeId: string): Promise<FriendshipEntity>;

  findAll(filters: FindFriendshipsFilters): Promise<PaginatedResult<FriendshipEntity>>;

  accept(friendshipId: string, userId: string): Promise<FriendshipEntity>;

  reject(friendshipId: string, userId: string): Promise<FriendshipEntity>;

  cancel(friendshipId: string, userId: string): Promise<void>;

  removeFriend(friendshipId: string, userId: string): Promise<void>;

  blockUser(blockerId: string, targetUserId: string): Promise<FriendshipEntity>;

  unblockUser(friendshipId: string, userId: string): Promise<FriendshipEntity | null>;

  findByPair(userIdA: string, userIdB: string): Promise<FriendshipEntity | null>;

  findById(id: string): Promise<FriendshipEntity | null>;
}
