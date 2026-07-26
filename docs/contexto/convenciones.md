# Convenciones — Sumly

## Nombrado

| Ámbito | Convención | Ejemplo |
|--------|-----------|---------|
| Tablas DB | `tbl_` prefijo, snake_case | `tbl_forma_pago`, `tbl_entidad_financiera` |
| Columnas DB | snake_case | `created_at`, `user_id`, `forma_pago_id` |
| Enums DB | SCREAMING_SNAKE_CASE | `INCOME`, `EXPENSE`, `MONTHLY`, `ACTIVE` |
| Archivos TSX | kebab-case | `transaction-form.tsx`, `delete-category-dialog.tsx` |
| Componentes React | PascalCase | `TransactionForm`, `DeleteCategoryDialog` |
| Hooks React | camelCase, prefijo `use` | `useTransactions`, `useCategories` |
| Schemas Zod | camelCase | `transactionSchema`, `categorySchema` |
| Rutas API | kebab-case, plural | `/api/v1/categories`, `/api/v1/entidades-financieras` |
| Rutas frontend | kebab-case en español | `/dashboard/ingresos`, `/dashboard/formas-de-pago` |
| Variables/funciones TS | camelCase | `handleSubmit`, `totalPages` |

## Estructura de features (frontend)

Cada feature bajo `src/features/<nombre>/` sigue este patrón:

```
<feature>/
├── components/   # Componentes UI específicos
├── hooks/        # Hooks de TanStack Query (useQuery, useMutation)
└── schemas/      # Schemas Zod + tipos TypeScript
```

Las páginas (rutas) van en `src/routes/` y componen los features, no al revés.

## Backend: Clean Architecture

```
domain/entities/     → Interfaces de entidad (solo datos, sin lógica)
domain/repositories/ → Interfaces de repositorio (contratos)
application/dtos/     → Zod schemas de entrada/salida
application/use-cases/→ Un archivo por caso de uso, clase con método execute()
infrastructure/repositories/ → Implementaciones Prisma de los repositorios
presentation/routes/  → Definición de endpoints Hono
```

- Los use cases reciben repositorios por inyección en constructor.
- Los DTOs validan con Zod en los use cases, no en los controllers.
- Los controllers solo parsean request y llaman al use case.

## Commits

- Idioma: español.
- Formato libre, sin conventional commits estricto. Tiende a: `feat:`, `fix:`, `chore:`, `refactor:`.
- Ejemplos del historial: `feat: agregar maestro de categorias con CRUD`, `fix: corregir filtro de tags`, `chore: configure monorepo with Turborepo`.

## Prohibido

- `font-bold` (700). Se usa `font-semibold` (600) para títulos de página y logo, `font-medium` (500) para interactivos, `font-normal` (400) para el resto. Ver DESIGN.md.
- Sombras (`box-shadow`) en tarjetas. Separación por borde (`border`).
- Dependencias de UI externas. Todos los componentes (tooltip, dialog, toast, select, date-input, currency-input) son propios, sin Radix UI ni Headless UI.
- Variables de entorno sin validar. Tanto frontend (`src/config/env.ts`) como backend (`src/config/env.ts`) validan con Zod.

## Tests

[PENDIENTE: No hay tests en el proyecto. No se ha definido framework ni convención.]

## Estilo de código

- **Frontend:** TypeScript strict mode. `noUnusedLocals`, `noUnusedParameters`. Path alias `@/*` → `./src/*`. Linting con oxlint.
- **Backend:** TypeScript 5.8. Path alias `@/*` → `./src/*`. Linting con `tsc --noEmit`.
