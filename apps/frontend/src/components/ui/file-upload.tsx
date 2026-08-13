import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, X, File as FileIcon, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { apiUploadFile } from "@/api/client";
import type { FileRecordUploadResponse } from "@/features/files/schemas/file.schema";
import {
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  validateFileType,
  validateFileSize,
} from "@/features/files/schemas/file.schema";

interface FileUploadProps {
  onUploaded: (result: FileRecordUploadResponse) => void;
  onError: (error: string) => void;
  onCleared?: () => void;
  acceptTypes?: readonly string[];
  maxSize?: number;
  autoUpload?: boolean;
}

export function FileUpload({
  onUploaded,
  onError,
  onCleared,
  acceptTypes = ALLOWED_FILE_TYPES,
  maxSize = MAX_FILE_SIZE,
  autoUpload = false,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autoUploadedRef = useRef(false);

  const handleFile = useCallback(
    (file: File) => {
      const typeError = validateFileType(file);
      if (typeError) {
        onError(typeError);
        return;
      }

      const sizeError = validateFileSize(file);
      if (sizeError) {
        onError(sizeError);
        return;
      }

      setSelectedFile(file);

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    },
    [onError]
  );

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const result = await apiUploadFile<FileRecordUploadResponse>(
        "/api/v1/files/upload",
        formData
      );
      onUploaded(result);
      setSelectedFile(null);
      setPreview(null);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Error al subir el archivo");
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, onUploaded, onError]);

  useEffect(() => {
    if (autoUpload && selectedFile && !autoUploadedRef.current) {
      autoUploadedRef.current = true;
      handleUpload();
    }
    if (!selectedFile) {
      autoUploadedRef.current = false;
    }
  }, [selectedFile, autoUpload, handleUpload]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
    onCleared?.();
  }, [onCleared]);

  return (
    <div className="flex flex-col gap-3">
      {!selectedFile ? (
        <div
          className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-6 transition-colors ${
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="h-6 w-6 text-muted-foreground" />
          <div className="text-center">
            <p className="text-sm font-medium">
              Arrastra un archivo o haz clic para seleccionar
            </p>
            <p className="text-xs text-muted-foreground">
              Maximo {maxSize / (1024 * 1024)} MB. Imagenes, CSV, Excel
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
          >
            Seleccionar archivo
          </Button>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={acceptTypes.join(",")}
            onChange={handleInputChange}
          />
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border p-3">
          {preview ? (
            <img
              src={preview}
              alt={selectedFile.name}
              className="h-12 w-12 rounded object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded bg-muted">
              {isUploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <FileIcon className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {isUploading ? "Subiendo..." : `${(selectedFile.size / 1024).toFixed(1)} KB`}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {!autoUpload && (
              <Button
                type="button"
                size="sm"
                disabled={isUploading}
                onClick={handleUpload}
              >
                {isUploading ? "Subiendo..." : "Subir"}
              </Button>
            )}
            {autoUpload && isUploading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isUploading}
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
