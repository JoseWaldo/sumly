import type { IFriendshipRepository, SearchUserResult } from "@/domain/repositories/friendship.repository";
import { ValidationError } from "@/shared/errors";

export class SearchUserByEmailUseCase {
  constructor(private readonly repository: IFriendshipRepository) {}

  async execute(email: string, currentUserId: string): Promise<SearchUserResult | null> {
    if (!email || !email.includes("@")) {
      throw new ValidationError("Ingresá un correo electrónico válido");
    }

    return this.repository.searchUserByEmail(email.trim().toLowerCase(), currentUserId);
  }
}
