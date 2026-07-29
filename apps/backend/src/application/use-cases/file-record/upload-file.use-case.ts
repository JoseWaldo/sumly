import type { IFileRecordRepository } from "@/domain/repositories/file-record.repository";
import type { IStorageService } from "@/infrastructure/storage/storage.service";
import type { FileRecordEntity } from "@/domain/entities/file-record.entity";
import { ValidationError } from "@/shared/errors";
import { MAX_FILE_SIZE, validateFileMimeType } from "@/application/dtos/file-record.dto";

export class UploadFileUseCase {
  constructor(
    private readonly repository: IFileRecordRepository,
    private readonly storage: IStorageService
  ) {}

  async execute(
    userId: string,
    buffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<FileRecordEntity> {
    if (!validateFileMimeType(mimeType)) {
      throw new ValidationError(
        `Tipo de archivo no permitido: ${mimeType}. Tipos aceptados: image/*, text/csv, .xlsx`
      );
    }

    if (buffer.length === 0) {
      throw new ValidationError("El archivo esta vacio");
    }

    if (buffer.length > MAX_FILE_SIZE) {
      throw new ValidationError(
        `El archivo excede el tamano maximo de ${MAX_FILE_SIZE / (1024 * 1024)} MB`
      );
    }

    const uploadResult = await this.storage.upload(buffer, fileName, mimeType);

    const fileRecord = await this.repository.create({
      originalName: fileName,
      mimeType: uploadResult.mimeType,
      sizeBytes: uploadResult.size,
      s3Key: uploadResult.key,
      userId,
    });

    return fileRecord;
  }
}
