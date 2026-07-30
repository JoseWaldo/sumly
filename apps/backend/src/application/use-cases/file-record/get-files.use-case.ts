import type { IFileRecordRepository, FindFilesFilters } from "@/domain/repositories/file-record.repository";
import type { PaginatedResult } from "@/shared/types";
import type { FileRecordEntity } from "@/domain/entities/file-record.entity";

export class GetFilesUseCase {
  constructor(private readonly repository: IFileRecordRepository) {}

  async execute(filters: FindFilesFilters): Promise<PaginatedResult<FileRecordEntity>> {
    return this.repository.findAllByUser(filters);
  }
}
