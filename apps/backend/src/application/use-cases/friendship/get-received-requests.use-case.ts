import type { IFriendshipRepository } from "@/domain/repositories/friendship.repository";
import type { PaginatedResult } from "@/shared/types";
import type { FriendshipEntity } from "@/domain/entities/friendship.entity";

export class GetReceivedRequestsUseCase {
  constructor(private readonly repository: IFriendshipRepository) {}

  async execute(userId: string): Promise<PaginatedResult<FriendshipEntity>> {
    return this.repository.findAll({
      userId,
      status: "PENDING",
      perspective: "addressee",
      page: 1,
      limit: 50,
    });
  }
}
