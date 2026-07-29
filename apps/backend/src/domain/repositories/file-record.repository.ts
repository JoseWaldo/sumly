import type { FileRecordEntity } from "@/domain/entities/file-record.entity";
import type { PaginatedResult } from "@/shared/types";

export interface FindFilesFilters {
  userId: string;
  search?: string;
  page: number;
  limit: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface CreateFileRecordInput {
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  s3Key: string;
  userId: string;
}

export interface IFileRecordRepository {
  findAllByUser(filters: FindFilesFilters): Promise<PaginatedResult<FileRecordEntity>>;
  findById(id: string): Promise<FileRecordEntity | null>;
  create(data: CreateFileRecordInput): Promise<FileRecordEntity>;
}
