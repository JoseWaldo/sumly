# Arquitectura — Sumly

## Stack

| Capa | Tecnología |
|------|-----------|
| Runtime | Bun (monorepo) |
| Frontend | React 19, TypeScript 6, Vite 8, Tailwind v4 |
| Backend | Hono v4, TypeScript, Prisma 7 |
| Base de datos | PostgreSQL 16 |
| Auth | Better Auth v1 |
| Infra | Docker Compose, GitHub Actions, ghcr.io |

## Mapa de carpetas

```
sumly/
├── apps/
│   ├── frontend/          # React PWA (TanStack Router/Query/Table, Jotai, Recharts)
│   │   └── src/
│   │       ├── api/           # Cliente fetch genérico
│   │       ├── components/    # UI (button, card, toast, tooltip, etc.), layout (sidebar), shared (logo, theme)
│   │       ├── features/      # auth, transactions, categories, subscriptions, formas-pago, user
│   │       │   └── <feature>/components/, hooks/, schemas/
│   │       ├── routes/        # TanStack Router file-based: auth/*, dashboard/*
│   │       ├── lib/           # auth-client, date-utils, cn()
│   │       └── stores/        # Jotai atoms (theme)
│   └── backend/           # Hono API con Clean Architecture
│       └── src/
│           ├── domain/        # Entidades e interfaces de repositorio
│           ├── application/   # Use cases y DTOs (Zod)
│           ├── infrastructure/# Prisma repositories, Better Auth, email (Nodemailer), crypto (AES-256-GCM)
│           ├── presentation/  # Controllers, routes v1, middlewares (auth, error)
│           └── shared/        # Errores, tipos (Result<T>, PaginatedResult), encryption utils
├── docker-compose.yml          # Local dev (build local, puertos :3000 :8080 :5433)
├── docker-compose.dev.yml      # VPS dev (ghcr imágenes :dev, puertos :3001 :8081 :5434)
├── docker-compose.prod.yml     # VPS prod (ghcr imágenes :latest, puertos :3000 :8080 :5433)
├── turbo.json                  # Pipeline: dev, build, lint, typecheck
└── .github/workflows/ci.yml    # CI/CD: lint → build docker → deploy
```

## Flujo de datos

```
Usuario → Navegador (PWA)
  → Nginx (:80) sirve assets estáticos
  → React (TanStack Query) → fetch → Backend (:3000)
  → Hono router → middleware auth → controller → use case → Prisma repository → PostgreSQL

Autenticación:
  → Better Auth maneja sesiones (cookie-based)
  → Middleware auth.middleware.ts valida sesión en cada request protegido
  → Frontend: authClient.getSession() en beforeLoad de TanStack Router
```

## Lo que NO existe

- **Tests automatizados.** Cero archivos `*.test.*` o `*.spec.*` en todo el repo.
- **Monitoreo / observabilidad.** No hay logging estructurado, métricas ni health checks más allá de un endpoint `/api/v1/health`.
- **Migraciones automáticas en deploy.** El entrypoint.sh ejecuta `prisma migrate deploy` al iniciar el container.
- **Rate limiting.** No implementado.
- **Cache.** TanStack Query tiene cache en cliente; no hay Redis ni cache de servidor.
- **WebSockets.** Comunicación 100% REST.
- **Jobs programados.** No hay cron jobs para recordatorios por correo.
- **Deudas, recordatorios, reportes avanzados.** Features planeadas no implementadas (ver CONTEXT.md).
