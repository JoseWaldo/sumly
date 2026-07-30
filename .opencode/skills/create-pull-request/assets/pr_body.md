## Descripcion

Infraestructura de archivos con AWS S3 para subida, visualizacion y descarga de archivos desde buckets privados. Integrado con foto de perfil. Ademas se recupera el seed de categorias del sistema que se perdio en un refactor anterior.

## Cambios realizados

- **Backend**: modelo `FileRecord` (`tbl_file`), stored procedure `sp_list_tbl_file`, servicio `S3StorageService` con validacion por magic number (image/*, CSV, Excel, max 10 MB), endpoints REST (`POST /files/upload`, `GET /files`, `GET /files/:id/view`, `GET /files/:id/download`)
- **Frontend**: componente `FileUpload` reutilizable (drag & drop, preview, validaciones cliente), pagina `/dashboard/files` con listado y filtros, integracion de subida de foto en `ProfileForm` (`/dashboard/perfil`). `user.image` guarda `fileId`, resuelto via `/files/:id/view`
- **Seed**: se restaura el seeder de 22 categorias del sistema (`tbl_category.ts`) que quedo huerfano en el refactor `511a5a3`
- **Docker**: variables de entorno S3 en los 3 compose files
- **Docs**: CONTEXT.md actualizado con HU-56/HU-60 y stack S3

## Motivo / Contexto

HU-56: infraestructura base para subida de archivos. Consumida inmediatamente por HU-60 (foto de perfil). El flujo es frontend -> multipart -> backend -> S3 (bucket privado, solo URLs presigned para visualizar/descargar).

## Como probar

1. Configurar variables `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET` en `.env`
2. Ejecutar `bun run db:seed` en `apps/backend`
3. Ir a `/dashboard/perfil` y subir una foto
4. Verificar que la imagen aparece en el perfil y los datos se persisten
5. Ir a `/dashboard/files` y verificar el listado

## Checklist

- [x] El codigo sigue los estandares del proyecto
- [x] Probado localmente sin errores (build backend + frontend)
- [x] Se actualizo la documentacion
- [ ] Se agregaron/actualizaron pruebas si aplica

## Capturas de pantalla

No aplica
