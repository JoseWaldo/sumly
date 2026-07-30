# Plan: Infraestructura de archivos + AWS S3 (HU-56)

> Plan aprobado en Fase 1 del workflow. Pendiente Fase 2 (grill-me).

## Objetivo

Servicio de storage con AWS S3 (SDK S3) para subida de archivos desde frontend via backend y descarga via URLs firmadas desde buckets privados. El frontend envia el archivo al backend como multipart, el backend valida, sube a S3 y registra en BD. Para visualizar/descargar se usan URLs presigned.

## Alcance

### Entregables

- Modelo `FileRecord` → `@@map("tbl_file")` en Prisma + migracion con SP `sp_list_tbl_file`
- Servicio de storage con `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` apuntando a AWS S3
- `POST /files/upload` — Subida de archivo via multipart (valida tipo, peso, magic number)
- `GET /files` — Listado paginado con SP estandar
- `GET /files/:id/view` — URL firmada para visualizacion inline (img src, etc.)
- `GET /files/:id/download` — URL firmada para descarga con Content-Disposition: attachment
- Variables de entorno AWS S3 en validacion Zod + 3 compose files
- Componente `FileUpload` en frontend con dropzone, preview, progreso, validaciones cliente
- Integracion con foto de perfil en `/dashboard/perfil` (user.image guarda fileId)
- Validaciones en frontend y backend: tipos permitidos (image/*, CSV, Excel), max 10 MB, magic number

### No se incluye

- Exportacion PDF (proximo prompt, consumidor de esto)
- FilterSheet complejo en listado de archivos (listado simple sin filtros)
- Subida multiple de archivos (uno a la vez por ahora)

## Arquitectura de subida

```
Frontend                    Backend                     AWS S3
   │                          │                           │
   │── multipart POST ──────→│                           │
   │   /files/upload         │                           │
   │                          │── validar tipo (magic #) │
   │                          │── validar peso (≤10MB)   │
   │                          │── subir con SDK S3 ────→│
   │                          │←── key + metadata ──────│
   │                          │── crear FileRecord en BD  │
   │←── { fileId } ──────────│                           │
```

## Arquitectura de visualizacion/descarga

```
Frontend                    Backend                     AWS S3
   │                          │                           │
   │── GET /files/:id/view ─→│                           │
   │                          │── generar presigned URL ─→│
   │                          │←── URL firmada (5 min) ──│
   │←── 302 redirect ────────│                           │
   │── GET (presigned URL) ─────────────────────────────→│
   │←── archivo ─────────────────────────────────────────│
```

## Validaciones

| Capa | Validacion | Implementacion |
|------|-----------|----------------|
| Frontend | Tipo de archivo | `accept` attribute + validacion JS del MIME type |
| Frontend | Peso maximo | Validacion del `size` antes de enviar |
| Backend | Tipo de archivo | Magic number verification (file-type / magic-bytes) |
| Backend | Peso maximo | Validacion del Content-Length / tamanio del buffer |
| Backend | MIME types permitidos | Whitelist: `image/*`, `text/csv`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `apps/backend/prisma/schema/schema.prisma` | Nuevo modelo `FileRecord` con `@@map("tbl_file")` |
| `apps/backend/src/config/env.ts` | +`S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`, `S3_ENDPOINT` (opcional) |
| `apps/backend/src/domain/types/sp-row-types.ts` | +`FileRecordListRow` |
| `apps/backend/src/presentation/v1/routes/index.ts` | +`router.route("/files", fileRoutes)` |
| `docker-compose.yml` | +env vars S3 en backend |
| `docker-compose.dev.yml` | +env vars S3 en backend |
| `docker-compose.prod.yml` | +env vars S3 en backend |
| `apps/frontend/src/features/user/components/profile-form.tsx` | Habilitar boton upload + integrar FileUpload |
| `apps/frontend/src/features/user/schemas/profile.schema.ts` | +`imageFileId` opcional |
| `apps/frontend/src/hooks/use-auth.ts` | `updateProfile` acepta `image` |
| `CONTEXT.md` | +HU-56 en API REST y funcionalidades |

## Archivos a crear

### Backend — Domain Layer
- `apps/backend/src/domain/entities/file-record.entity.ts` — `FileRecordEntity`
- `apps/backend/src/domain/repositories/file-record.repository.ts` — `IFileRecordRepository`

### Backend — Infrastructure Layer
- `apps/backend/src/infrastructure/storage/storage.service.ts` — Interfaz `IStorageService`
- `apps/backend/src/infrastructure/storage/s3-storage.service.ts` — Implementacion con SDK S3
- `apps/backend/src/infrastructure/storage/index.ts` — Factory
- `apps/backend/src/infrastructure/repositories/file-record-prisma.repository.ts` — Repo con SP

### Backend — Application Layer
- `apps/backend/src/application/dtos/file-record.dto.ts` — Zod schemas para upload/confirm
- `apps/backend/src/application/use-cases/file-record/upload-file.use-case.ts` — Subida con validaciones
- `apps/backend/src/application/use-cases/file-record/get-files.use-case.ts` — Listado
- `apps/backend/src/application/use-cases/file-record/get-file-view-url.use-case.ts` — URL firmada inline
- `apps/backend/src/application/use-cases/file-record/get-file-download-url.use-case.ts` — URL firmada descarga

### Backend — Presentation Layer
- `apps/backend/src/presentation/v1/routes/file.routes.ts` — `POST /files/upload`, `GET /files`, `GET /files/:id/view`, `GET /files/:id/download`

### Backend — Database
- `apps/backend/prisma/schema/migrations/<ts>/migration.sql` — `CREATE TABLE tbl_file` + `sp_list_tbl_file`

### Frontend
- `apps/frontend/src/components/ui/file-upload.tsx` — Componente reutilizable (dropzone, preview, progreso, validaciones)
- `apps/frontend/src/features/files/schemas/file.schema.ts` — Tipos
- `apps/frontend/src/features/files/hooks/use-files.ts` — Hook de listado
- `apps/frontend/src/features/files/components/files-table.tsx` — Tabla simple
- `apps/frontend/src/routes/dashboard/files.tsx` — Pagina

## Documentacion a actualizar

- `CONTEXT.md` — Agregar rutas `/files` en API REST + HU-56 como "Hecho"
- `AGENTS.md` — No requiere cambios

## Orden de ejecucion

1. Instalar `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`
2. Modelo `FileRecord` en `schema.prisma` + migracion (`tbl_file` + `sp_list_tbl_file`)
3. Variables de entorno en `env.ts` + 3 compose files
4. `FileRecordEntity` + `IFileRecordRepository`
5. `IStorageService` + `S3StorageService` + factory
6. `FileRecordListRow` en `sp-row-types.ts` + `FileRecordPrismaRepository`
7. DTOs de validacion
8. Use cases (upload, list, view-url, download-url)
9. `file.routes.ts` + registro en `index.ts`
10. Type check + build backend
11. Componente `FileUpload` en frontend
12. Integrar foto de perfil en `ProfileForm`
13. Pagina de archivos + tabla + hook
14. Type check + build completo
15. Actualizar `CONTEXT.md`
16. PR

## Variables de entorno

| Variable | Descripcion |
|----------|-------------|
| `S3_REGION` | Region de AWS (ej. `us-east-1`) |
| `S3_ACCESS_KEY` | Access key de IAM con permisos S3 |
| `S3_SECRET_KEY` | Secret key correspondiente |
| `S3_BUCKET` | Nombre del bucket S3 |
| `S3_ENDPOINT` | (Opcional) Endpoint custom — solo necesario si se usa un servicio compatible con S3 (Cloudflare R2, MinIO, etc.). Para AWS S3 nativo se omite. |

## Riesgos / Puntos de atencion

- **`@aws-sdk/client-s3` en Bun**: Compatible. Si `@aws-sdk/credential-provider-node` falla, usar credenciales estaticas (access key + secret key).
- **Permisos IAM**: El usuario IAM asociado a las credenciales debe tener permisos `s3:PutObject`, `s3:GetObject` y `s3:ListBucket` sobre el bucket.
- **Multipart en Hono**: Hono soporta `c.req.raw.body` para leer streams y `c.req.raw.arrayBuffer()` para buffers. No se necesita multer ni middleware extra.
- **Magic number**: Usar `file-type` (ESM-only, compatible con Bun) para verificar el tipo real del archivo, no solo la extension.
- **Tamanio maximo**: Validar tanto en frontend (antes de enviar) como en backend (al recibir el buffer). Capear en 10 MB.
- **Campos extra en `tbl_file`**: Incluir `mime_type` y `size_bytes` para consultas sin ir a S3.
- **ID**: `cuid()` como el resto del proyecto.
- **Convencion de nombres**: Tabla en ingles y singular (`tbl_file`). Modelo Prisma `FileRecord`. API route `/files` en ingles.
- **`user.image`**: Guarda el `fileId` (no la URL de S3). El frontend arma `<img src="/api/v1/files/{fileId}/view">` y el backend redirige a la presigned URL. Asi las URLs rotan y el bucket no se expone.

## Decisiones de diseno

| Decision | Eleccion | Razon |
|----------|----------|-------|
| Storage provider | Solo AWS S3 | Mismo en local/dev/prod. Buckets ya configurados en AWS. |
| Acceso a bucket | Privado, solo URLs firmadas | Seguridad, el bucket nunca se expone publicamente |
| Flujo de subida | Frontend → multipart → backend → S3 | Mas simple, validaciones centralizadas, no requiere CORS en bucket |
| Listado | Stored procedure `sp_list_tbl_file` | Sigue el estandar de listados de AGENTS.md |
| Validacion de tipo | Magic number en backend + MIME en frontend | Previene archivos maliciosos renombrados |
| `mime_type` + `size_bytes` | Incluidos en tabla | Utiles para frontend, costo casi nulo |
| `S3_ENDPOINT` | Opcional | Permite usar el mismo codigo con S3 nativo o servicios compatibles |
| `user.image` | Guarda `fileId` | Las URLs de S3 rotan, no se exponen en BD, reutilizable para otros recursos |
