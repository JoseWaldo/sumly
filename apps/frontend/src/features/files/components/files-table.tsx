import { Download } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import type { FileRecord } from "@/features/files/schemas/file.schema";
import { getReadableFileSize } from "@/features/files/schemas/file.schema";
import { env } from "@/config/env";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "Imagen";
  if (mimeType === "text/csv") return "CSV";
  if (mimeType.includes("spreadsheet")) return "Excel";
  return "Archivo";
}

interface FilesTableProps {
  data: FileRecord[];
  isLoading: boolean;
}

export function FilesTable({ data, isLoading }: FilesTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-lg border p-3">
            <Skeleton className="h-10 w-10 rounded" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-muted-foreground">No hay archivos subidos todavia</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {data.map((file) => (
        <div
          key={file.id}
          className="flex items-center gap-3 rounded-lg border p-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded bg-muted text-xs font-medium text-muted-foreground">
            {getFileIcon(file.mimeType)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium">{file.originalName}</p>
            <p className="text-xs text-muted-foreground">
              {getReadableFileSize(file.sizeBytes)} &middot; {formatDate(file.createdAt)}
            </p>
          </div>
          <a
            href={`${env.apiUrl}/api/v1/files/${file.id}/download`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Download className="h-4 w-4" />
          </a>
        </div>
      ))}
    </div>
  );
}
