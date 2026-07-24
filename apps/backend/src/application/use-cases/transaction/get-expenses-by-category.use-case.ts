import type { ITransactionRepository } from "@/domain/repositories/transaction.repository";
import type { ExpenseByCategory } from "@/domain/repositories/transaction.repository";

export class GetExpensesByCategoryUseCase {
  constructor(private readonly repository: ITransactionRepository) {}

  async execute(userId: string, month: number, year: number): Promise<ExpenseByCategory[]> {
    return this.repository.getExpensesByCategory(userId, month, year);
  }
}
