import type { IFriendshipRepository } from "@/domain/repositories/friendship.repository";

export class CancelFriendshipRequestUseCase {
  constructor(private readonly repository: IFriendshipRepository) {}

  async execute(friendshipId: string, userId: string): Promise<void> {
    await this.repository.cancel(friendshipId, userId);
  }
}
