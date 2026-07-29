import { S3StorageService } from "@/infrastructure/storage/s3-storage.service";
import type { IStorageService } from "@/infrastructure/storage/storage.service";

let storageInstance: IStorageService | null = null;

export function getStorageService(): IStorageService {
  if (!storageInstance) {
    storageInstance = new S3StorageService();
  }
  return storageInstance;
}
