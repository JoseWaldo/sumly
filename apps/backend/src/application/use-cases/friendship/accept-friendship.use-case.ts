import type { IFriendshipRepository } from "@/domain/repositories/friendship.repository";
import type { FriendshipEntity } from "@/domain/entities/friendship.entity";

export class AcceptFriendshipUseCase {
  constructor(private readonly repository: IFriendshipRepository) {}

  async execute(friendshipId: string, userId: string): Promise<FriendshipEntity> {
    return this.repository.accept(friendshipId, userId);
  }
}
