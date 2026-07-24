import type { ISubscriptionRepository } from "@/domain/repositories/subscription.repository";
import type { SubscriptionTagEntity } from "@/domain/entities/subscription.entity";
import type { CreateTagDTO } from "@/application/dtos/subscription.dto";
import { ConflictError, NotFoundError, UnauthorizedError } from "@/shared/errors";

export class GetTagsUseCase {
  constructor(private readonly repository: ISubscriptionRepository) {}

  async execute(userId: string): Promise<SubscriptionTagEntity[]> {
    return this.repository.findTagsByUser(userId);
  }
}

export class CreateTagUseCase {
  constructor(private readonly repository: ISubscriptionRepository) {}

  async execute(userId: string, data: CreateTagDTO): Promise<SubscriptionTagEntity> {
    return this.repository.createTag({
      name: data.name,
      color: data.color,
      userId,
    });
  }
}

export class DeleteTagUseCase {
  constructor(private readonly repository: ISubscriptionRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    await this.repository.deleteTag(id, userId);
  }
}
