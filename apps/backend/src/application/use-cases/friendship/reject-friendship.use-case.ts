import type { IFriendshipRepository } from "@/domain/repositories/friendship.repository";
import type { FriendshipEntity } from "@/domain/entities/friendship.entity";

export class RejectFriendshipUseCase {
  constructor(private readonly repository: IFriendshipRepository) {}

  async execute(friendshipId: string, userId: string): Promise<FriendshipEntity> {
    return this.repository.reject(friendshipId, userId);
  }
}
