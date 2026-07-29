import type { IFileRecordRepository } from "@/domain/repositories/file-record.repository";
import type { IStorageService } from "@/infrastructure/storage/storage.service";
import { NotFoundError } from "@/shared/errors";

export class GetFileViewUrlUseCase {
  constructor(
    private readonly repository: IFileRecordRepository,
    private readonly storage: IStorageService
  ) {}

  async execute(id: string): Promise<{ url: string; mimeType: string }> {
    const fileRecord = await this.repository.findById(id);
    if (!fileRecord) {
      throw new NotFoundError("Archivo no encontrado");
    }

    const url = await this.storage.getPresignedUrl(fileRecord.s3Key, 300, true);

    return {
      url,
      mimeType: fileRecord.mimeType,
    };
  }
}
