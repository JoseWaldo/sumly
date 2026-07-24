import type { ITransactionRepository } from "@/domain/repositories/transaction.repository";
import type { TransactionEntity } from "@/domain/entities/transaction.entity";
import type { UpdateTransactionDTO } from "@/application/dtos/transaction.dto";
import { NotFoundError, UnauthorizedError } from "@/shared/errors";

export class UpdateTransactionUseCase {
  constructor(private readonly repository: ITransactionRepository) {}

  async execute(id: string, userId: string, data: UpdateTransactionDTO): Promise<TransactionEntity> {
    const transaction = await this.repository.findById(id);
    if (!transaction) {
      throw new NotFoundError("Movimiento no encontrado");
    }

    if (transaction.userId !== userId) {
      throw new UnauthorizedError("No puedes modificar un movimiento que no te pertenece");
    }

    const updateData: {
      amount?: number;
      date?: Date;
      description?: string;
      categoryId?: string;
    } = {};

    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.description !== undefined) updateData.description = data.description;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;

    return this.repository.update(id, updateData);
  }
}
