# Flujo de Trabajo — Sumly

## Hacer un cambio

```
1. git checkout -b <rama> desde main o dev
2. bun install           # en raíz (si hay dependencias nuevas)
3. bun run dev           # levanta ambos apps con Turborepo
4. Editar código
5. bun run lint          # verificar que pasa (oxlint + tsc --noEmit)
6. bun run build         # verificar build de ambos apps
7. git commit
8. git push
```

## Dónde corre cada cosa en desarrollo local

| Servicio | Comando | Puerto |
|----------|---------|--------|
| Frontend | `bun run dev` (vite) | :5173 (Vite default) |
| Backend | `bun run dev` (bun --watch) | :3000 |
| PostgreSQL | Docker Compose | :5433 |
| Todo junto | `docker compose up -d` | frontend :8080, backend :3000, db :5433 |

## Checklist de "terminado"

- [ ] `bun run lint` pasa sin errores
- [ ] `bun run build` pasa sin errores (frontend: tsc + vite build; backend: tsc + bun build)
- [ ] Probado manualmente en local con `bun run dev`
- [ ] La UI nueva sigue el DESIGN.md (sin `font-bold`, separación por bordes, tokens de color)
- [ ] Textos en español con tildes correctas
- [ ] Si es mutación (create/update/delete), tiene toast de feedback
- [ ] Si es delete, tiene diálogo de confirmación
- [ ] Commit en español con prefijo (`feat:`, `fix:`, `chore:`, `refactor:`)

## Deploy

### Automático (CI/CD)

Push a `dev` → lint → build Docker → push ghcr `:dev` → deploy a VPS dev (puertos :3001/:8081)
Push a `main` → lint → build Docker → push ghcr `:latest` → deploy a VPS prod (puertos :3000/:8080)

Ver `.github/workflows/ci.yml` y `CICD.md` para detalles.

### Manual con Docker

```bash
# Local
cp .env.example .env
docker compose up -d

# Detener
docker compose down
```

### Migraciones de DB

El entrypoint del backend (`entrypoint.sh`) ejecuta `prisma migrate deploy` al iniciar. Para crear nuevas migraciones:

```bash
cd apps/backend
bun run db:migrate    # crea migración desde cambios en schema.prisma
```
