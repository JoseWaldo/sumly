import type { IFileRecordRepository } from "@/domain/repositories/file-record.repository";
import type { IStorageService } from "@/infrastructure/storage/storage.service";
import { NotFoundError } from "@/shared/errors";

export class GetFileDownloadUrlUseCase {
  constructor(
    private readonly repository: IFileRecordRepository,
    private readonly storage: IStorageService
  ) {}

  async execute(id: string): Promise<string> {
    const fileRecord = await this.repository.findById(id);
    if (!fileRecord) {
      throw new NotFoundError("Archivo no encontrado");
    }

    return this.storage.getPresignedUrl(fileRecord.s3Key, 300, false);
  }
}
