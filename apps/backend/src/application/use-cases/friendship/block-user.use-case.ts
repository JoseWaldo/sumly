import type { IFriendshipRepository } from "@/domain/repositories/friendship.repository";
import type { FriendshipEntity } from "@/domain/entities/friendship.entity";

export class BlockUserUseCase {
  constructor(private readonly repository: IFriendshipRepository) {}

  async execute(blockerId: string, targetUserId: string): Promise<FriendshipEntity> {
    return this.repository.blockUser(blockerId, targetUserId);
  }
}
