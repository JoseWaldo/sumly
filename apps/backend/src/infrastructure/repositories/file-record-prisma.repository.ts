import { prisma } from "@/db";
import type { PrismaClient } from "@/prisma";
import type {
  IFileRecordRepository,
  CreateFileRecordInput,
  FindFilesFilters,
} from "@/domain/repositories/file-record.repository";
import type { FileRecordEntity } from "@/domain/entities/file-record.entity";
import type { PaginatedResult } from "@/shared/types";
import type { FileRecordListRow, SpListResult } from "@/domain/types/sp-row-types";

export class FileRecordPrismaRepository implements IFileRecordRepository {
  private db: PrismaClient;

  constructor(client: PrismaClient = prisma) {
    this.db = client;
  }

  async findAllByUser(filters: FindFilesFilters): Promise<PaginatedResult<FileRecordEntity>> {
    const rows = await this.db.$queryRaw<
      [{ sp_list_tbl_file: SpListResult<FileRecordListRow> }]
    >`
      SELECT sp_list_tbl_file(
        ${filters.userId}::TEXT,
        ${filters.search || null}::TEXT,
        ${filters.page}::INT,
        ${filters.limit}::INT,
        ${filters.sortBy || null}::TEXT,
        ${filters.sortDir || null}::TEXT
      )
    `;

    const result = rows[0]?.sp_list_tbl_file;

    if (!result) {
      return { data: [], total: 0, page: filters.page, limit: filters.limit, totalPages: 0 };
    }

    return {
      data: (result.data ?? []).map((row) => ({
        id: row.id,
        originalName: row.originalName,
        mimeType: row.mimeType,
        sizeBytes: row.sizeBytes,
        s3Key: row.s3Key,
        userId: row.userId,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      })),
      total: Number(result.total),
      page: filters.page,
      limit: filters.limit,
      totalPages: result.totalPages,
    };
  }

  async findById(id: string): Promise<FileRecordEntity | null> {
    const record = await this.db.fileRecord.findUnique({ where: { id } });
    return record ? this.toEntity(record) : null;
  }

  async create(data: CreateFileRecordInput): Promise<FileRecordEntity> {
    const record = await this.db.fileRecord.create({
      data: {
        originalName: data.originalName,
        mimeType: data.mimeType,
        sizeBytes: data.sizeBytes,
        s3Key: data.s3Key,
        userId: data.userId,
      },
    });
    return this.toEntity(record);
  }

  private toEntity(row: {
    id: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    s3Key: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  }): FileRecordEntity {
    return {
      id: row.id,
      originalName: row.originalName,
      mimeType: row.mimeType,
      sizeBytes: row.sizeBytes,
      s3Key: row.s3Key,
      userId: row.userId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
