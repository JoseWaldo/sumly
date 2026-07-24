# Finanzas Personales - Frontend

Web application for personal finance management.

## Tech Stack

- **Runtime:** [Bun](https://bun.sh)
- **Framework:** [React](https://react.dev) 19
- **Build Tool:** [Vite](https://vite.dev) 8
- **Language:** TypeScript
- **Routing:** [TanStack Router](https://tanstack.com/router) v1
- **State Management:** [Jotai](https://jotai.org) v2
- **Forms:** [React Hook Form](https://react-hook-form.com) v7 + [Zod](https://zod.dev)
- **Styling:** [Tailwind CSS](https://tailwindcss.com) v4
- **UI Components:** [shadcn/ui](https://ui.shadcn.com)
- **Data Fetching:** [TanStack Query](https://tanstack.com/query) v5
- **Date Handling:** [date-fns](https://date-fns.org) v4
- **Icons:** [Lucide React](https://lucide.dev)

## Project Structure

```
src/
  api/              # API client and endpoint definitions
  components/
    ui/             # shadcn/ui components
    layout/         # Layout components
    shared/         # Shared components
  features/         # Feature-based modules
    auth/           # Authentication feature
      components/   # Auth UI components
      hooks/        # Auth hooks
      schemas/      # Zod validation schemas
  hooks/            # Custom React hooks
  lib/              # Utility functions
  routes/           # TanStack Router file-based routes
  stores/           # Jotai atoms (global state)
  types/            # TypeScript type definitions
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.0
- Backend server running on `http://localhost:3000`

### Setup

1. Clone and navigate to the project:

```bash
cd finanzas-personales-frontend
```

2. Install dependencies:

```bash
bun install
```

3. Configure environment variables (optional):

Create `.env` file:

```env
VITE_API_URL=http://localhost:3000
```

4. Start development server:

```bash
bun run dev
```

The app will be available at `http://localhost:5173`.

### Available Scripts

| Script | Description |
|---|---|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run preview` | Preview production build |
| `bun run lint` | Lint with oxlint |

## Features

- User authentication (login/register) with Better Auth
- Protected dashboard routes
- Responsive design with Tailwind CSS
- Form validation with React Hook Form + Zod
- Type-safe routing with TanStack Router
- Global state management with Jotai
