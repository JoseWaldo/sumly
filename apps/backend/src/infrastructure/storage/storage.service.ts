export interface UploadResult {
  key: string;
  size: number;
  mimeType: string;
}

export interface IStorageService {
  upload(buffer: Buffer, fileName: string, mimeType: string): Promise<UploadResult>;
  getPresignedUrl(key: string, expiresIn: number, inline?: boolean): Promise<string>;
  validateMimeType(buffer: Buffer, allowedTypes: string[]): boolean;
}
