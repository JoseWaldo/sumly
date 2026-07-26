# CI/CD — Sumly Monorepo

## Arquitectura

```
GitHub push → Lint → Build Docker → Push a ghcr.io → Deploy a VPS
```

| Ambiente | Branch | Imagen tag | VPS puertos | Compose file |
|----------|--------|------------|-------------|--------------|
| **local** | cualquiera | build local | `:3000` `:8080` `:5433` | `docker-compose.yml` |
| **dev** | `dev` | `:dev` | `:3001` `:8081` `:5434` | `docker-compose.dev.yml` |
| **prod** | `main` | `:latest` | `:3000` `:8080` `:5433` | `docker-compose.prod.yml` |

## Flujo del pipeline

Archivo: `.github/workflows/ci.yml`

### 1. Lint
- Se ejecuta en **todo push y pull request** a `main` y `dev`.
- Instala dependencias con `bun install --frozen-lockfile`.
- Corre `bun run lint` (oxlint en frontend, tsc --noEmit en backend).

### 2. Build & Push Docker
- Se ejecuta solo en **push** a `main` o `dev` (no en PRs).
- Requiere que `lint` pase primero.
- Construye las imágenes desde la raíz del monorepo (`context: .`) usando los dockerfiles en `apps/`.
- Sube las imágenes a `ghcr.io/josewaldo/sumly-backend` y `ghcr.io/josewaldo/sumly-frontend`.
- Tags: `:latest` para main, `:dev` para dev, más `:${{ github.sha }}` en ambos.

### 3. Deploy to Production (`deploy-prod`)
- Se ejecuta solo en push a `main`.
- Usa el environment `production` de GitHub.
- Copia `docker-compose.prod.yml` vía SCP a `~/projects/sumly/prod/`.
- Genera el archivo `.env` desde los secrets.
- Hace `docker compose pull` + `docker compose up -d` con proyecto `sumly-prod`.

### 4. Deploy to Dev/Test (`deploy-dev`)
- Se ejecuta solo en push a `dev`.
- Usa el environment `development` de GitHub.
- Copia `docker-compose.dev.yml` vía SCP a `~/projects/sumly/dev/`.
- Genera el archivo `.env` desde los secrets.
- Hace `docker compose pull` + `docker compose up -d` con proyecto `sumly-dev`.

## Secrets de GitHub

### Nivel repositorio (compartidos)

Configurar en **Settings → Secrets and variables → Actions**:

| Secret | Descripción |
|--------|-------------|
| `VPS_HOST` | IP o dominio de la VPS |
| `VPS_USER` | Usuario SSH de la VPS |
| `VPS_SSH_KEY` | Llave privada SSH |
| `SMTP_USER` | Usuario SMTP para envío de correos |
| `SMTP_PASS` | Password SMTP |
| `SMTP_FROM` | Remitente de correos |
| `ENCRYPTION_KEY` | Clave AES-256 (mín. 32 caracteres) |
| `VITE_API_URL` | URL del backend usada en el build del frontend |

### Nivel environment (por ambiente)

Configurar en **Settings → Environments**:

**Environment `production`:**

| Secret | Descripción |
|--------|-------------|
| `POSTGRES_USER` | Usuario PostgreSQL |
| `POSTGRES_PASSWORD` | Password PostgreSQL |
| `POSTGRES_DB` | Nombre de la base de datos |
| `BETTER_AUTH_SECRET` | Secreto de better-auth |
| `BETTER_AUTH_URL` | URL pública del backend (ej. `https://api.sumly.com`) |

**Environment `development`:**

| Secret | Descripción |
|--------|-------------|
| `POSTGRES_USER` | Usuario PostgreSQL |
| `POSTGRES_PASSWORD` | Password PostgreSQL |
| `POSTGRES_DB` | Nombre de la base de datos |
| `BETTER_AUTH_SECRET` | Secreto de better-auth |
| `BETTER_AUTH_URL` | URL pública del backend (ej. `https://dev-api.sumly.com`) |

> GitHub resuelve los secrets: primero busca en el environment, luego en el repositorio. Los secrets con el mismo nombre en el environment **sobrescriben** los del repositorio.

## Setup inicial en la VPS

```bash
# Crear directorios (solo una vez)
mkdir -p ~/projects/sumly/prod ~/projects/sumly/dev
```

El `.env` se genera automáticamente en cada deploy. No es necesario crearlo manualmente.

## Uso local

```bash
# Copiar .env.example a .env y ajustar valores
cp .env.example .env

# Levantar todo
docker compose up -d

# Detener
docker compose down
```

## Cambiar variables de entorno

1. Ir a GitHub → Settings → Secrets and variables → Actions / Environments.
2. Editar el secret correspondiente.
3. Hacer push a la rama (`main` o `dev`) o re-ejecutar el action manualmente.

Las variables del `.env` en la VPS se regeneran en cada deploy desde los secrets.

## Registry de Docker

Las imágenes se almacenan en **GitHub Container Registry** (`ghcr.io`), que es gratuito e integrado con el repositorio. No requiere configuración adicional.

- Backend: `ghcr.io/josewaldo/sumly-backend`
- Frontend: `ghcr.io/josewaldo/sumly-frontend`
