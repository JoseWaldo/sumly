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

## 4. Documentación

Cada vez que se agregue una funcionalidad o se refactorice código, **actualizar la documentación correspondiente**:

- `CONTEXT.md` — si el cambio agrega/quita historias de usuario, modifica el stack tecnológico, o altera la tabla de rutas API.
- `AGENTS.md` — si el cambio introduce una nueva convención, patrón de arquitectura, o checklist que los agentes deben seguir.
- La skill `workflow` incluye un paso explícito de revisión de documentación en la Fase 4 (ver `.opencode/skills/workflow/SKILL.md`).

---

## 5. Convenciones de código

### Nombres de tablas
Todas las tablas usan prefijo `tbl_` via `@@map` en Prisma:
- `tbl_user`, `tbl_transaction`, `tbl_category`, `tbl_subscription`, `tbl_subscription_tag`, `tbl_forma_pago`, `tbl_entidad_financiera`, `tbl_session`, `tbl_account`, `tbl_verification`

### Migraciones

**Flujo estándar para crear una migración:**

1. Editar `prisma/schema/schema.prisma` (modelos, enums, campos, relaciones).
2. Generar la migración con Prisma:
   ```bash
   bunx prisma migrate dev --name nombre-descriptivo
   ```
   Prisma genera el folder `migrations/<timestamp>_<nombre>/migration.sql` con las tablas, enums, índices y FKs. **Nunca escribir `migration.sql` a mano** para las partes que Prisma puede representar.
3. Si se necesita un **stored procedure** o SQL raw que Prisma no modela (funciones, vistas, data migrations):
   - **Los stored procedures van en el seed** (`prisma/seed/stored-procedures/`), no en migraciones. Se registran en `prisma/seed/stored-procedures/index.ts` y se ejecutan con `CREATE OR REPLACE FUNCTION` para ser idempotentes. El seed se corre con `bun run db:seed`.
   - Para **data migrations** que requieran versionado (backfills, cambios de datos), crear una migración separada con `--create-only`.
4. Después de cualquier cambio de schema, regenerar el cliente:
   ```bash
   bun run generate
   ```

**Reglas estrictas:**

- **Prohibido `prisma migrate reset`** en cualquier base de datos que contenga datos que no se puedan perder. `reset` borra todos los datos y recrea la BD desde cero. Solo se tolera en entornos locales si no hay otra salida, y únicamente si los datos de desarrollo no son valiosos. Ante un drift, preferir `prisma migrate resolve` o arreglar el checksum manualmente en `_prisma_migrations`.
- **Prohibido `prisma db push`**. Siempre usar migraciones versionadas.
- **Prohibido modificar un `migration.sql` después de que fue aplicado** a una base de datos (causa drift de checksum). Si se necesita agregar algo a una migración ya aplicada, crear una migración nueva con el cambio incremental.
- Toda migración debe ser **aditiva**: agregar tablas, columnas, enums, índices. No borrar ni renombrar objetos que puedan tener datos en producción sin un plan de migración explícito.
- Los stored procedures usan `CREATE OR REPLACE FUNCTION` para ser idempotentes.

### Estructura de archivos
- Un use case por archivo en `application/use-cases/<entidad>/`.
- Un DTO por archivo en `application/dtos/`.
- Una ruta por archivo en `presentation/v1/routes/`.
- Un repositorio (interface) por archivo en `domain/repositories/`.
- Un repositorio (implementación) por archivo en `infrastructure/repositories/`.

---

## 6. Referencia: SP de ejemplo (`sp_list_tbl_transactions`)

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

## 7. Estándar de filtros en frontend (FilterSheet)

Toda página de listado usa el componente `FilterSheet` (`components/ui/filter-sheet.tsx`) para agrupar filtros, ordenamiento y búsqueda avanzada fuera del área principal de datos.

### 7.1 Estructura de la página

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

### 7.2 Componente FilterSheet

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

### 7.3 Botón de filtros

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

### 7.4 Secciones del sheet (orden canónico)

1. **Tipo / Estado** — filtro principal del recurso (tipo de movimiento, estado de suscripción, etc.). Segmented buttons (`border-primary bg-primary/10 text-primary` cuando activo).
2. **Periodo / Fecha** — solo para recursos con fecha (transactions).
3. **Filtros específicos** — forma de pago, categoría, tags, etc.
4. **Ordenar por** — botones de columna + dirección (asc/desc).

### 7.5 Contador de filtros activos

Cada página calcula `activeFilterCount` con `useMemo` contando cuántos filtros difieren de su valor default. El badge del botón muestra este número.

### 7.6 Checklist al crear/migrar un listado

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

---

## 8. Gestión de deudas — convenciones

### 8.1 Movimientos NEUTRAL (tbl_movimiento)

- Los movimientos `NEUTRAL` (tabla `tbl_movimiento`) **nunca** entran a reportes/gráficos (`tbl_transaction` solo contiene `REAL` por construcción — ingresos/gastos normales).
- `saldo_disponible = balance(tbl_transaction) + Σ(ENTRADA−SALIDA de tbl_movimiento)`. El endpoint `GET /transactions/dashboard` retorna `disponible`.
- El estado VENCIDA se actualiza de forma lazy dentro de `sp_list_tbl_deudas` (solo `PENDIENTE → VENCIDA` si `fecha_vencimiento < CURRENT_DATE`). El cron real llegará con HU-27.

### 8.2 Deuda espejo (fila canónica + sombra)

- Al crear una deuda con destinatario amigo, se genera una **fila espejo** (invertida) para el amigo con `espejo_de_id`.
- **Abonos, saldo, eventos y movimientos viven solo en la fila canónica** (`espejo_de_id IS NULL`). El espejo sincroniza `estado` y `saldo_pendiente` en cascada.
- La mutación de estado **siempre se hace vía canónica**; sync del espejo en un solo lugar (`syncMirrorTx` en el repositorio de infraestructura).
- Las APIs aceptan el `id` de cualquiera de las dos filas y resuelven el par (`espejoDeId ?? id`).
- **Snapshots**: cada fila guarda `contraparte_snapshot_nombre/avatar` de la otra parte (deudor en ME_DEBEN, acreedor en YO_DEBO, creador en el espejo). Esto asegura que la UI no se rompa si el otro usuario cambia nombre/avatar o deja de ser amigo.

### 8.3 Abonos idempotentes

- `tbl_deuda_abono.idempotency_key` tiene índice único.
- El repositorio `createAbono` captura `P2002` (unique violation) y devuelve el abono existente.
- El frontend genera un UUID (`crypto.randomUUID()`) al abrir el modal de pago y lo envía como `idempotencyKey`.
- El saldo pendiente solo baja al **confirmar** un abono (no al reportarlo). Reportar sin `auto_confirmar` mueve la deuda a `ESPERANDO_CONFIRMACION` sin tocar saldo.

### 8.4 Transacciones vinculadas a deudas

- No existen transacciones REAL desde deudas. El ciclo de vida completo (creación → abono → cancelación/reversa) solo genera movimientos NEUTRAL.
- `tbl_movimiento.origen_id` referencia `deuda_id` o `abono_id`. `reversa_de_id` referencia el movimiento que se anula.
- La cancelación crea movimientos reversa (signo opuesto, mismo monto) dejando rastro completo.

### 8.5 Ciclo de movimientos

| Acción | Movimientos NEUTRAL |
|---|---|
| Crear deuda | Acreedor `SALIDA` + Deudor amigo `ENTRADA` (`origen_id = deuda_id`) |
| Abono confirmado | Deudor `SALIDA` + Acreedor `ENTRADA` (`origen_id = abono_id`) |
| Cancelar | Reversa de ambos movimientos de creación (`reversa_de_id`) |
| Perdonar | Ninguno |
| Rechazar / disputa | Ninguno (solo al confirmar) |
