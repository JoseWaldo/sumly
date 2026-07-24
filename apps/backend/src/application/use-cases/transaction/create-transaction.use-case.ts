import type { ITransactionRepository } from "@/domain/repositories/transaction.repository";
import type { TransactionEntity } from "@/domain/entities/transaction.entity";
import type { CreateTransactionDTO } from "@/application/dtos/transaction.dto";

export class CreateTransactionUseCase {
  constructor(private readonly repository: ITransactionRepository) {}

  async execute(userId: string, data: CreateTransactionDTO): Promise<TransactionEntity> {
    return this.repository.create({
      amount: data.amount,
      date: new Date(data.date),
      description: data.description,
      categoryId: data.categoryId,
      userId,
    });
  }
}
