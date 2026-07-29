export interface FileRecord {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

export interface FileRecordUploadResponse {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

export interface PaginatedFiles {
  data: FileRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FileFilters {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export const ALLOWED_FILE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function getReadableFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateFileType(file: File): string | null {
  if (!ALLOWED_FILE_TYPES.includes(file.type as typeof ALLOWED_FILE_TYPES[number])) {
    return `Tipo de archivo no permitido: ${file.type || "desconocido"}. Tipos aceptados: imagenes, CSV, Excel`;
  }
  return null;
}

export function validateFileSize(file: File): string | null {
  if (file.size === 0) {
    return "El archivo esta vacio";
  }
  if (file.size > MAX_FILE_SIZE) {
    return `El archivo excede el tamano maximo de ${MAX_FILE_SIZE / (1024 * 1024)} MB`;
  }
  return null;
}
