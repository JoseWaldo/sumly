import type { IFriendshipRepository } from "@/domain/repositories/friendship.repository";

export class RemoveFriendUseCase {
  constructor(private readonly repository: IFriendshipRepository) {}

  async execute(friendshipId: string, userId: string): Promise<void> {
    await this.repository.removeFriend(friendshipId, userId);
  }
}
