import type { IFriendshipRepository } from "@/domain/repositories/friendship.repository";
import type { FriendshipEntity } from "@/domain/entities/friendship.entity";
import { ValidationError } from "@/shared/errors";

export class SendFriendshipRequestUseCase {
  constructor(private readonly repository: IFriendshipRepository) {}

  async execute(requesterId: string, addresseeId: string): Promise<FriendshipEntity> {
    if (requesterId === addresseeId) {
      throw new ValidationError("No puedes enviarte una solicitud a ti mismo");
    }

    return this.repository.createRequest(requesterId, addresseeId);
  }
}
