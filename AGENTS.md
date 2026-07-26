# Agents Guide — Sumly

## 0. Arquitectura general

Monorepo (Bun + Turbo) con Clean Architecture en backend:

```
apps/backend/src/
  domain/          — Entidades, interfaces de repositorio, tipos compartidos
  application/     — Casos de uso (uno por operación), DTOs (Zod)
  infrastructure/  — Implementaciones de repositorios (Prisma), auth, email
  presentation/    — Rutas Hono (v1/routes/), middlewares
  shared/          — Tipos genéricos (PaginatedResult, AuthUser), errores
```

- **Las llamadas a stored procedures viven en `infrastructure/repositories/`**, nunca en `presentation/` ni en `domain/`.
- Las rutas (`presentation/v1/routes/`) solo orquestan: parsean query params/body, llaman al use case, devuelven JSON.

---

## 1. Estándar de listados paginados, filtrados, buscables y ordenables

Todo listado del sistema usa stored procedures de PostgreSQL con el siguiente contrato unificado.

### 1.1 Contrato de request

| Parámetro    | Tipo            | Default     | Descripción                                    |
|-------------|-----------------|-------------|------------------------------------------------|
| `page`        | `number`        | `1`         | Página actual (mínimo 1)                        |
| `limit`       | `number`        | Varía       | Tamaño de página (máximo 100, varía por recurso) |
| `sortBy`      | `string?`       | Depende     | Columna por la que ordenar (whitelist por SP)    |
| `sortDir`     | `"asc"\|"desc"` | `"desc"`    | Dirección del ordenamiento                       |
| `search`      | `string?`       | —           | Búsqueda por texto (ILIKE sobre columna principal) |
| `filters.*`   | Varía           | —           | Filtros específicos del recurso                  |

### 1.2 Contrato de response

```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "pageSize": 10,
  "totalPages": 10
}
```

Este contrato lo implementa `PaginatedResult<T>` en `shared/types/index.ts` y lo serializa cada SP como JSONB.

### 1.3 Convención de nombres de stored procedures

```
sp_list_tbl_<nombre_tabla>
```

Ejemplos:
- `sp_list_tbl_transactions`
- `sp_list_tbl_categories`
- `sp_list_tbl_subscriptions`
- `sp_list_tbl_formas_pago`
- `sp_list_tbl_entidades_financieras`

Parámetros estándar que **todos** los SP reciben:
- `p_user_id TEXT` — ID del usuario autenticado
- `p_search TEXT DEFAULT NULL` — término de búsqueda
- `p_page INT DEFAULT 1`
- `p_page_size INT DEFAULT <depende>` — default varía por recurso
- `p_sort_by TEXT DEFAULT NULL` — columna (whitelist dentro del SP)
- `p_sort_dir TEXT DEFAULT 'asc'|'desc'` — dirección (whitelist dentro del SP)

Parámetros adicionales según el recurso:
- **transactions**: `p_type`, `p_category_id`, `p_forma_pago_id`, `p_date_from`, `p_date_to`
- **categories**: `p_type`
- **subscriptions**: `p_status`, `p_tag_id`
- **formas-pago**: (ninguno extra)
- **entidades-financieras**: (ninguno extra)

### 1.4 Seguridad: whitelist de columnas y direcciones

Todo SP implementa whitelist estricta para `sortBy` y `sortDir` usando `CASE`:

```sql
v_sort_expr := CASE p_sort_by
  WHEN 'date'        THEN 't.date'
  WHEN 'amount'      THEN 't.amount'
  WHEN 'category'    THEN 'c.name'
  WHEN 'forma_pago'  THEN 'fp.nombre'
  ELSE 't.date'
END;

v_order_dir := CASE p_sort_dir
  WHEN 'asc'  THEN 'ASC NULLS LAST'
  WHEN 'desc' THEN 'DESC NULLS LAST'
  ELSE 'DESC NULLS LAST'
END;
```

**Reglas:**
- Nunca interpolar `p_sort_by` directamente en el SQL (riesgo de SQL injection).
- Siempre usar `CASE WHEN` para mapear la entrada del usuario a una expresión SQL segura.
- `page_size` máximo capeado en 100 dentro del SP (`IF p_page_size > 100 THEN p_page_size := 100`).
- `page` mínimo capeado en 1.

### 1.5 Llamada al SP desde TypeScript (infrastructure layer)

```typescript
import type { SpListResult, TransactionListRow } from "@/domain/types/sp-row-types";

const rows = await this.db.$queryRaw<[{ sp_list_tbl_transactions: SpListResult<TransactionListRow> }]>`
  SELECT sp_list_tbl_transactions(
    ${filters.userId}::TEXT,
    ${filters.search || null}::TEXT,
    ${filters.page}::INT,
    ${filters.limit}::INT,
    ${filters.sortBy || null}::TEXT,
    ${filters.sortDir || null}::TEXT,
    ${filters.type || null}::TEXT,
    ${filters.categoryId || null}::TEXT,
    ${filters.formaPagoId || null}::TEXT,
    ${dateFrom}::DATE,
    ${dateTo}::DATE
  )
`;

const result = rows[0]?.sp_list_tbl_transactions;
```

**Notas:**
- La función PostgreSQL se invoca con `SELECT sp_list_...(...)`.
- Prisma devuelve un array de 1 fila con una columna nombrada igual que la función.
- El JSONB de PostgreSQL se parsea automáticamente a objeto JS por Prisma.
- Los tipos `SpListResult<T>` y los `*ListRow` están definidos en `domain/types/sp-row-types.ts`.

---

## 2. Checklist: migrar o crear un listado nuevo

### Para migrar un listado existente

1. **Crear el SP** en una migración SQL nueva (`prisma/schema/migrations/<timestamp>/migration.sql`):
   - Usar `CREATE OR REPLACE FUNCTION sp_list_tbl_<nombre>(...)`.
   - Implementar whitelist de `sortBy` y `sortDir`.
   - Capear `page_size` a máximo 100.
   - Retornar `JSONB` con `jsonb_build_object('data', ..., 'total', ..., 'page', ..., 'pageSize', ..., 'totalPages', ...)`.
   - La data debe usar `json_agg(row_to_json(q))` con snake_case mapeado a camelCase.

2. **Definir/actualizar el Row type** en `domain/types/sp-row-types.ts`:
   - La interfaz debe coincidir exactamente con las keys camelCase del `json_build_object` del SP.

3. **Actualizar el repositorio de infraestructura** (`infrastructure/repositories/<nombre>-prisma.repository.ts`):
   - Reemplazar la lógica de `findMany`/`count` con una llamada `$queryRaw` al SP.
   - Mapear las rows a entidades de dominio (conversión `Number()`, `new Date()`, etc.).
   - Eliminar imports de `Prisma.TransactionWhereInput` o similar si ya no se usan.

4. **Actualizar el repositorio de dominio** si se agregaron `sortBy`/`sortDir` al filtro:
   - `domain/repositories/<nombre>.repository.ts`: agregar `sortBy?: string; sortDir?: "asc" | "desc"` a `Find*Filters`.

5. **Actualizar la ruta** (`presentation/v1/routes/<nombre>.routes.ts`):
   - Parsear query params `sortBy`, `sortDir`.
   - Pasar a los filtros del use case.

6. **Verificar que no se rompió nada**:
   - Los filtros existentes (tipo, estado, búsqueda, etc.) deben seguir funcionando igual.
   - La respuesta mantiene el mismo formato (`data`, `total`, `page`, `limit`, `totalPages`).

### Para crear un listado nuevo

1. Crear el SP con el estándar de arriba.
2. Definir `*ListRow` en `sp-row-types.ts`.
3. Crear repository interface en `domain/repositories/`.
4. Implementar repository en `infrastructure/repositories/`.
5. Crear use case en `application/use-cases/`.
6. Crear ruta en `presentation/v1/routes/`.
7. Crear DTO de validación si el recurso acepta POST/PATCH.
8. Agregar al `index.ts` de rutas.

---

## 3. Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Runtime | Bun |
| Framework HTTP | Hono v4 |
| ORM | Prisma v7 + PostgreSQL 16 |
| Auth | Better Auth v1 (email + password) |
| Validación | Zod v3 (env) / Zod v3 (DTOs) |
| Email | Nodemailer + SMTP |
| Encriptación | AES-256-GCM (números de tarjeta) |
| Frontend | React 19 + Vite + TanStack Router/Query/Table + Jotai + Tailwind v4 |
| Monorepo | Bun + Turbo |

---

## 4. Convenciones de código

### Nombres de tablas
Todas las tablas usan prefijo `tbl_` via `@@map` en Prisma:
- `tbl_user`, `tbl_transaction`, `tbl_category`, `tbl_subscription`, `tbl_subscription_tag`, `tbl_forma_pago`, `tbl_entidad_financiera`, `tbl_session`, `tbl_account`, `tbl_verification`

### Migraciones
- `prisma migrate dev --schema=prisma/schema/schema.prisma` para desarrollo.
- `prisma migrate deploy --schema=prisma/schema/schema.prisma` para producción.
- Los SPs y cambios de schema que no puede representar Prisma van en SQL raw en el `migration.sql`.

### Estructura de archivos
- Un use case por archivo en `application/use-cases/<entidad>/`.
- Un DTO por archivo en `application/dtos/`.
- Una ruta por archivo en `presentation/v1/routes/`.
- Un repositorio (interface) por archivo en `domain/repositories/`.
- Un repositorio (implementación) por archivo en `infrastructure/repositories/`.

---

## 5. Referencia: SP de ejemplo (`sp_list_tbl_transactions`)

Ver el archivo de migración: `prisma/schema/migrations/20260726010000_add_forma_pago_to_transaction_and_list_sp/migration.sql`

Este es el SP más completo porque incluye:
- Filtro por tipo (`INCOME`/`EXPENSE` via `tbl_category.type`)
- Filtro por categoría
- Filtro por forma de pago
- Filtro por rango de fechas
- Búsqueda por descripción (ILIKE)
- Ordenamiento por 5 columnas distintas
- JOIN con `tbl_category` y `tbl_forma_pago`
- JSON inline para la relación `category` y `formaPago` en cada fila

---

## 6. Estándar de filtros en frontend (FilterSheet)

Toda página de listado usa el componente `FilterSheet` (`components/ui/filter-sheet.tsx`) para agrupar filtros, ordenamiento y búsqueda avanzada fuera del área principal de datos.

### 6.1 Estructura de la página

```
┌─────────────────────────────────────────────────────┐
│ Título                              [+ Nuevo ...]  │
├─────────────────────────────────────────────────────┤
│ [🔍 Buscar...] [⚙ Filtros(N)] [✕ Limpiar]         │
├─────────────────────────────────────────────────────┤
│ Tabla / Cards / Grid                                │
│                                                     │
│ (paginación si aplica)                              │
└─────────────────────────────────────────────────────┘
```

### 6.2 Componente FilterSheet

Sheet lateral que se despliega desde la derecha al hacer clic en el botón "Filtros". Usa `createPortal` para montarse en `document.body`.

**Props compuestas:**
```tsx
<FilterSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
  <FilterSheet.Header onClose={() => setSheetOpen(false)} />
  <FilterSheet.Body>
    <FilterSheet.Section label="Tipo">
      {/* controles */}
    </FilterSheet.Section>
  </FilterSheet.Body>
  <FilterSheet.Footer>
    <button>Limpiar filtros</button>
    <button>Aplicar</button>
  </FilterSheet.Footer>
</FilterSheet>
```

**Animación:**
- Entrada: slide desde la derecha (300ms, cubic-bezier(0.16, 1, 0.3, 1))
- Salida: slide hacia la derecha (300ms) + fade del backdrop (200ms)
- Las transiciones se definen con `style={{ transition: "transform 300ms cubic-bezier(0.16, 1, 0.3, 1)" }}` y `style={{ transition: "opacity 200ms ease-out" }}` (NO usar clases de Tailwind para `transition-*` — usar el prop `style` directamente).
- Desmontaje vía `onTransitionEnd` + fallback de 400ms.
- Focus trap, Escape para cerrar, clic en backdrop para cerrar.

**Ancho:** `w-[340px]` mobile, `sm:w-[380px]` desktop.

**Scroll interno:** usar clase `scrollbar-thin` (definida en `globals.css`) + fade masks con gradientes `from-card to-transparent` en bordes superior/inferior del área scrolleable.

### 6.3 Botón de filtros

```tsx
<Button variant="outline" size="icon" onClick={() => setSheetOpen(true)} className="relative shrink-0">
  <SlidersHorizontal className="h-4 w-4" />
  {activeFilterCount > 0 && (
    <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
      {activeFilterCount}
    </span>
  )}
</Button>
```

- Va **al lado de la barra de búsqueda**, no en el header.
- Muestra un badge con el número de filtros activos.
- El botón de "Limpiar" (`FilterX`) aparece a su derecha solo cuando hay filtros activos.

### 6.4 Secciones del sheet (orden canónico)

1. **Tipo / Estado** — filtro principal del recurso (tipo de movimiento, estado de suscripción, etc.). Segmented buttons (`border-primary bg-primary/10 text-primary` cuando activo).
2. **Periodo / Fecha** — solo para recursos con fecha (transactions).
3. **Filtros específicos** — forma de pago, categoría, tags, etc.
4. **Ordenar por** — botones de columna + dirección (asc/desc).

### 6.5 Contador de filtros activos

Cada página calcula `activeFilterCount` con `useMemo` contando cuántos filtros difieren de su valor default. El badge del botón muestra este número.

### 6.6 Checklist al crear/migrar un listado

- [ ] Importar `FilterSheet` y `SlidersHorizontal` de lucide-react
- [ ] Agregar estado `sheetOpen`
- [ ] Agregar estados `sortBy`, `sortDir`
- [ ] Calcular `activeFilterCount` con `useMemo`
- [ ] Botón `size="icon"` al lado de la barra de búsqueda
- [ ] Sheet con `Header`, `Body` con `Section`s, `Footer`
- [ ] Las secciones usan `FilterSheet.Section label="..."` 
- [ ] Footer con botones "Limpiar filtros" (outline) y "Aplicar" (primary, cierra el sheet)
- [ ] La barra de búsqueda y el botón "Limpiar" quedan inline en el CardHeader
- [ ] Todos los filtros que estaban inline migran al sheet
- [ ] Los hooks del recurso aceptan y pasan `sortBy`, `sortDir`
