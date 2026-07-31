import type { IFriendshipRepository } from "@/domain/repositories/friendship.repository";
import type { FriendshipEntity } from "@/domain/entities/friendship.entity";

export class UnblockUserUseCase {
  constructor(private readonly repository: IFriendshipRepository) {}

  async execute(friendshipId: string, userId: string): Promise<FriendshipEntity | null> {
    return this.repository.unblockUser(friendshipId, userId);
  }
}
