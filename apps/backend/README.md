# Finanzas Personales - Backend

API backend for personal finance management application.

## Tech Stack

- **Runtime:** [Bun](https://bun.sh)
- **Framework:** [Hono](https://hono.dev) v4
- **Language:** TypeScript
- **ORM:** [Prisma](https://www.prisma.io) v6
- **Auth:** [Better Auth](https://better-auth.com) v1
- **Validation:** [Zod](https://zod.dev)
- **Database:** PostgreSQL

## Architecture

Clean Architecture with the following layers:

```
src/
  config/          # Environment configuration (Zod validated)
  domain/          # Entities and repository interfaces
  application/     # Use cases and DTOs
  infrastructure/  # Prisma, external services, auth
  presentation/    # Hono routes, controllers, middlewares
  shared/          # Error classes, types, utilities
```

### API Versioning

All endpoints are versioned under `/api/v1/`.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.0
- PostgreSQL running locally

### Setup

1. Clone and navigate to the project:

```bash
cd finanzas-personales-backend
```

2. Install dependencies:

```bash
bun install
```

3. Configure environment variables:

Copy `.env` or set the following:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/finanzas_personales
BETTER_AUTH_SECRET=your-secret-key
PORT=3000
```

4. Generate Prisma client and push schema:

```bash
bun run db:generate
bun run db:push
```

5. Start development server:

```bash
bun run dev
```

### Available Scripts

| Script | Description |
|---|---|
| `bun run dev` | Start development server with hot reload |
| `bun run build` | Build for production |
| `bun run lint` | Type-check with TypeScript |
| `bun run db:generate` | Generate Prisma client |
| `bun run db:push` | Push schema to database |
| `bun run db:migrate` | Create and apply migrations |
| `bun run db:studio` | Open Prisma Studio GUI |

## API Endpoints

### Health

```
GET /api/v1/health
```

### Authentication (Better Auth)

```
POST   /api/v1/auth/sign-up/email
POST   /api/v1/auth/sign-in/email
GET    /api/v1/auth/session
POST   /api/v1/auth/sign-out
```

All Better Auth endpoints are available under `/api/v1/auth/*`.
