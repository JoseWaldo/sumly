import type { IFriendshipRepository, FindFriendshipsFilters } from "@/domain/repositories/friendship.repository";
import type { PaginatedResult } from "@/shared/types";
import type { FriendshipEntity } from "@/domain/entities/friendship.entity";

export class ListFriendsUseCase {
  constructor(private readonly repository: IFriendshipRepository) {}

  async execute(filters: Omit<FindFriendshipsFilters, "userId" | "status" | "perspective"> & { userId: string }): Promise<PaginatedResult<FriendshipEntity>> {
    return this.repository.findAll({
      ...filters,
      status: "ACCEPTED",
      perspective: "either",
    });
  }
}
