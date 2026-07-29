import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  type PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";

import { env } from "@/config/env";
import type { IStorageService, UploadResult } from "@/infrastructure/storage/storage.service";
import { ValidationError } from "@/shared/errors";

const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

type FileTypeResult = {
  mime?: string;
};

export class S3StorageService implements IStorageService {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor() {
    this.client = new S3Client({
      region: env.S3_REGION,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY,
        secretAccessKey: env.S3_SECRET_KEY,
      },
      ...(env.S3_ENDPOINT ? { endpoint: env.S3_ENDPOINT, forcePathStyle: true } : {}),
    });
    this.bucket = env.S3_BUCKET;
  }

  async upload(buffer: Buffer, fileName: string, mimeType: string): Promise<UploadResult> {
    if (!this.validateMimeType(buffer, ALLOWED_MIME_TYPES)) {
      throw new ValidationError(
        `Tipo de archivo no permitido. Tipos aceptados: ${ALLOWED_MIME_TYPES.join(", ")}`
      );
    }

    const key = `${Date.now()}-${crypto.randomUUID()}-${fileName}`;

    const params: PutObjectCommandInput = {
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    };

    await this.client.send(new PutObjectCommand(params));

    return {
      key,
      size: buffer.length,
      mimeType,
    };
  }

  async getPresignedUrl(key: string, expiresIn: number, inline = false): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ...(inline
        ? { ResponseContentDisposition: "inline" }
        : { ResponseContentDisposition: `attachment; filename="${key.split("-").slice(2).join("-")}"` }),
    });

    return getSignedUrl(this.client, command, { expiresIn });
  }

  validateMimeType(buffer: Buffer, allowedTypes: string[]): boolean {
    const magic = this.getMagicNumberMime(buffer);

    if (!magic) {
      return false;
    }

    if (allowedTypes.includes(magic)) {
      return true;
    }

    if (allowedTypes.some((t) => t.endsWith("/*"))) {
      const prefix = allowedTypes.find((t) => t.endsWith("/*"))?.replace("/*", "");
      if (prefix && magic.startsWith(prefix)) {
        return true;
      }
    }

    return false;
  }

  private getMagicNumberMime(buffer: Buffer): string | null {
    if (buffer.length < 4) return null;

    const head = buffer.subarray(0, 12);

    if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return "image/jpeg";
    if (head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47) return "image/png";
    if (head[0] === 0x47 && head[1] === 0x49 && head[2] === 0x46) return "image/gif";
    if (head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x46) return "image/webp";
    if (
      head[0] === 0x3c &&
      (head[1] === 0x3f || head[1] === 0x73) &&
      (head[2] === 0x76 || head[2] === 0x76)
    )
      return "image/svg+xml";

    if (head[0] === 0x50 && head[1] === 0x4b && head[2] === 0x03 && head[3] === 0x04) {
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    }

    const str = buffer.toString("utf-8", 0, Math.min(buffer.length, 1000));
    if (str.startsWith("PK")) {
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    }

    const hasCommas = str.includes(",");
    const hasNewlines = str.includes("\n");
    if ((hasCommas || hasNewlines) && !str.includes("\0")) {
      return "text/csv";
    }

    return null;
  }
}
