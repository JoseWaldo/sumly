# Sumly — Tus finanzas en equilibrio

Aplicación web para gestionar finanzas personales: ingresos, gastos, suscripciones, medios de pago con encriptación y visualización de reportes.

[CONTEXT.md](./CONTEXT.md) — contexto completo del producto, historias de usuario y estado actual.

---

## Stack

| Capa | Tecnologías |
|------|-------------|
| Monorepo | [Bun](https://bun.sh) + [Turbo](https://turbo.build) |
| Frontend | React 19, Vite 8, Tailwind CSS v4, TanStack Router/Query/Table, Jotai, Recharts, React Hook Form + Zod |
| Backend | [Hono v4](https://hono.dev) (Bun), Clean Architecture |
| Auth | [Better Auth v1](https://better-auth.com) (email + contraseña) |
| ORM | [Prisma v7](https://prisma.io) |
| DB | PostgreSQL 16 |
| Email | Nodemailer (SMTP) |
| Encrypt | AES-256-GCM (números de tarjeta) |

---

## Funcionalidades principales

- Registro / inicio de sesión (Better Auth) y correo de bienvenida
- CRUD de ingresos y gastos con categorías personalizables (íconos Lucide)
- Dashboard con balance, totales mensuales, gráfico circular de gastos por categoría
- Gestión de suscripciones (frecuencia, estado, tags, reporte de pagos)
- Medios de pago visuales tipo tarjeta bancaria con gradiente y número encriptado
- Entidades financieras (bancos, billeteras) pre-cargadas y personalizables
- Tema claro/oscuro con detección del sistema
- PWA instalable con cacheo offline de assets estáticos y Google Fonts

> Ver [CONTEXT.md](./CONTEXT.md) para el backlog detallado de historias de usuario.

---

## Estructura del proyecto

```
sumly/
├── apps/
│   ├── frontend/            # React + Vite + Tailwind
│   │   └── src/
│   │       ├── components/  # ui/, layout/, shared/
│   │       ├── features/    # auth, transactions, categories, subscriptions, formas-pago
│   │       ├── hooks/       # use-auth
│   │       ├── lib/         # api client, utils
│   │       ├── routes/      # TanStack Router (file-based)
│   │       └── stores/      # Jotai atoms (tema)
│   │
│   └── backend/             # Hono + Prisma + PostgreSQL
│       ├── prisma/
│       │   ├── schema/      # Schema Prisma + migraciones
│       │   └── generated/   # Prisma Client
│       └── src/
│           ├── domain/      # Entidades e interfaces de repositorio
│           ├── application/ # DTOs y casos de uso
│           ├── infrastructure/ # Auth, repositorios Prisma, email (SMTP)
│           ├── presentation/ # Rutas, controladores, middlewares
│           └── shared/      # Errores, tipos, encriptación
│
├── docker-compose.yml       # Entorno local (build desde Dockerfile)
├── docker-compose.dev.yml   # Staging (imágenes ghcr.io)
├── docker-compose.prod.yml  # Producción (imágenes ghcr.io)
├── CICD.md                  # Pipeline de CI/CD
└── CONTEXT.md               # Documento completo del producto
```

---

## Empezar

### Requisitos

- [Bun](https://bun.sh) >= 1.3
- PostgreSQL 16 (o Docker)
- (Opcional) Docker + Docker Compose

### Desarrollo local (sin Docker)

**1. Instalar dependencias desde la raíz:**

```bash
bun install
```

**2. Configurar variables de entorno:**

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env
# Editar apps/backend/.env con tus credenciales de DB, SMTP y secretos

# Frontend
cp apps/frontend/.env.example apps/frontend/.env
# VITE_API_URL apunta al backend (por defecto http://localhost:3000)
```

**3. Preparar la base de datos:**

```bash
cd apps/backend
bun run generate          # Generar Prisma Client
bun run db:migrate        # Ejecutar migraciones
bun run db:seed           # (Opcional) precargar entidades financieras
```

**4. Iniciar los servicios:**

```bash
# Desde la raíz
bun run dev               # Inicia frontend (:5173) y backend (:3000) con Turbo
```

### Desarrollo local (con Docker Compose)

```bash
cp apps/backend/.env.example .env  # El compose lee .env de raíz
# Editar .env con tus credenciales SMTP y secretos
docker compose up -d
```

Servicios disponibles:
- Frontend: http://localhost:8080
- Backend: http://localhost:3000
- PostgreSQL: `localhost:5433`

### Scripts del monorepo

| Comando | Descripción |
|---------|-------------|
| `bun run dev` | Inicia frontend y backend en paralelo |
| `bun run build` | Compila ambos proyectos |
| `bun run lint` | Linting de ambos proyectos |
| `bun run typecheck` | Type-checking de ambos proyectos |

### Scripts del backend (`apps/backend`)

| Comando | Descripción |
|---------|-------------|
| `bun run dev` | Servidor con hot reload |
| `bun run db:migrate` | Crear y aplicar migraciones |
| `bun run db:deploy` | Aplicar migraciones pendientes (producción) |
| `bun run db:studio` | Abrir Prisma Studio |
| `bun run db:seed` | Sembrar entidades financieras del sistema |
| `bun run generate` | Generar Prisma Client |
| `bun run lint` | Type-check con TypeScript |

### Scripts del frontend (`apps/frontend`)

| Comando | Descripción |
|---------|-------------|
| `bun run dev` | Servidor de desarrollo Vite |
| `bun run build` | Build de producción |
| `bun run preview` | Previsualizar build |
| `bun run lint` | Lint con oxlint |

---

## Variables de entorno

### Backend (`apps/backend/.env`)

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Conexión a PostgreSQL |
| `BETTER_AUTH_SECRET` | Secreto para Better Auth (mín. 32 caracteres) |
| `PORT` | Puerto del servidor (default: 3000) |
| `NODE_ENV` | Entorno (`development` / `production`) |
| `SMTP_HOST` | Host SMTP para envío de correos |
| `SMTP_PORT` | Puerto SMTP |
| `SMTP_USER` | Usuario SMTP |
| `SMTP_PASS` | Contraseña SMTP |
| `SMTP_FROM` | Dirección "from" de los correos |
| `ENCRYPTION_KEY` | Clave para AES-256-GCM (mín. 32 caracteres) |

### Frontend (`apps/frontend/.env`)

| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | URL base del backend (default: `http://localhost:3000`) |

---

## API

Todas las rutas bajo `/api/v1`, autenticadas con Better Auth (excepto health y auth).

| Recurso | Endpoints principales |
|---------|----------------------|
| Health | `GET /health` |
| Auth | `ALL /auth/*` (Better Auth), `GET /auth/me` |
| Profile | `GET /profile` |
| Transactions | `GET/POST /transactions`, `GET/PATCH/DELETE /transactions/:id`, `GET /transactions/dashboard`, `GET /transactions/dashboard/expenses-by-category` |
| Categories | `GET/POST /categories`, `GET/PATCH/DELETE /categories/:id` |
| Subscriptions | `GET/POST /subscriptions`, `GET/PATCH/DELETE /subscriptions/:id`, `POST /subscriptions/:id/report`, `GET/POST /subscriptions/tags`, `DELETE /subscriptions/tags/:id`, `GET /subscriptions/dashboard` |
| Formas de pago | `GET/POST /formas-pago`, `GET/PATCH/DELETE /formas-pago/:id`, `GET /formas-pago/:id/reveal` |
| Entidades financieras | `GET/POST /entidades-financieras`, `GET/PATCH/DELETE /entidades-financieras/:id` |

---

## Despliegue

Existen tres archivos Docker Compose para cada entorno:

| Archivo | Entorno | Imágenes |
|---------|---------|----------|
| `docker-compose.yml` | Local | Build desde Dockerfile |
| `docker-compose.dev.yml` | Staging | `ghcr.io/josewaldo/sumly-backend:dev` / `sumly-frontend:dev` |
| `docker-compose.prod.yml` | Producción | `ghcr.io/josewaldo/sumly-backend:latest` / `sumly-frontend:latest` |

Ver [CICD.md](./CICD.md) para el pipeline completo de CI/CD con GitHub Actions.
