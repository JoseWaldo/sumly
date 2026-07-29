import { Hono } from "hono";
import { z } from "zod";

import { authMiddleware } from "@/presentation/v1/middlewares/auth.middleware";
import { FileRecordPrismaRepository } from "@/infrastructure/repositories/file-record-prisma.repository";
import { getStorageService } from "@/infrastructure/storage";
import { UploadFileUseCase } from "@/application/use-cases/file-record/upload-file.use-case";
import { GetFilesUseCase } from "@/application/use-cases/file-record/get-files.use-case";
import { GetFileViewUrlUseCase } from "@/application/use-cases/file-record/get-file-view-url.use-case";
import { GetFileDownloadUrlUseCase } from "@/application/use-cases/file-record/get-file-download-url.use-case";
import { ValidationError } from "@/shared/errors";
import type { FindFilesFilters } from "@/domain/repositories/file-record.repository";

const repository = new FileRecordPrismaRepository();
const storage = getStorageService();
const uploadFile = new UploadFileUseCase(repository, storage);
const getFiles = new GetFilesUseCase(repository);
const getFileViewUrl = new GetFileViewUrlUseCase(repository, storage);
const getFileDownloadUrl = new GetFileDownloadUrlUseCase(repository, storage);

const sortDirSchema = z.enum(["asc", "desc"]).optional();

const router = new Hono();

router.use("*", authMiddleware);

router.get("/", async (c) => {
  const userId = c.get("user").id;
  const search = c.req.query("search");
  const sortByRaw = c.req.query("sortBy");
  const sortDirRaw = c.req.query("sortDir");
  const page = Math.max(1, Number(c.req.query("page")) || 1);
  const limit = Math.min(Math.max(1, Number(c.req.query("limit")) || 10), 50);

  const sortBy = sortByRaw || undefined;
  const sortDir = sortDirRaw ? sortDirSchema.parse(sortDirRaw) : undefined;

  const filters: FindFilesFilters = {
    userId,
    search: search || undefined,
    page,
    limit,
    sortBy,
    sortDir,
  };

  const result = await getFiles.execute(filters);
  return c.json(result);
});

router.post("/upload", async (c) => {
  const userId = c.get("user").id;

  const contentType = c.req.header("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    throw new ValidationError("Content-Type debe ser multipart/form-data");
  }

  const contentLength = Number(c.req.header("content-length") || "0");
  const maxSize = 10 * 1024 * 1024;
  if (contentLength > maxSize) {
    throw new ValidationError(
      `El archivo excede el tamano maximo de ${maxSize / (1024 * 1024)} MB`
    );
  }

  const formData = await c.req.formData();
  const file = formData.get("file");

  if (!file) {
    throw new ValidationError("No se envio ningun archivo");
  }

  if (typeof file === "string") {
    throw new ValidationError("El campo 'file' debe ser un archivo");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = file.name || "archivo";
  const mimeType = file.type || "application/octet-stream";

  const result = await uploadFile.execute(userId, buffer, fileName, mimeType);

  return c.json(
    {
      id: result.id,
      originalName: result.originalName,
      mimeType: result.mimeType,
      sizeBytes: result.sizeBytes,
      createdAt: result.createdAt,
    },
    201
  );
});

router.get("/:id/view", async (c) => {
  const { id } = c.req.param();
  const result = await getFileViewUrl.execute(id);

  return c.redirect(result.url);
});

router.get("/:id/download", async (c) => {
  const { id } = c.req.param();
  const url = await getFileDownloadUrl.execute(id);

  return c.redirect(url);
});

export default router;
