import type { IFormaPagoRepository } from "@/domain/repositories/forma-pago.repository";
import { decrypt } from "@/shared/utils/encryption";

export class RevealFormaPagoUseCase {
  constructor(private readonly repository: IFormaPagoRepository) {}

  async execute(id: string, userId: string): Promise<string> {
    const numeroEncriptado = await this.repository.revealNumero(id, userId);
    return decrypt(numeroEncriptado);
  }
}
