export interface FileRecordEntity {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  s3Key: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
