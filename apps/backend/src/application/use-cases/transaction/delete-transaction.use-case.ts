import type { ITransactionRepository } from "@/domain/repositories/transaction.repository";
import { NotFoundError, UnauthorizedError } from "@/shared/errors";

export class DeleteTransactionUseCase {
  constructor(private readonly repository: ITransactionRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const transaction = await this.repository.findById(id);
    if (!transaction) {
      throw new NotFoundError("Movimiento no encontrado");
    }

    if (transaction.userId !== userId) {
      throw new UnauthorizedError("No puedes eliminar un movimiento que no te pertenece");
    }

    await this.repository.delete(id);
  }
}
