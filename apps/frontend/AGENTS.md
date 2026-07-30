# Agents Guide — Sumly Frontend

## 1. Arquitectura general

Organización **feature-based** dentro del monorepo Sumly (Bun + Turbo):

```
apps/frontend/src/
  api/             — Cliente HTTP único (apiClient)
  config/          — Variables de entorno validadas (Zod)
  lib/             — Utilidades genéricas (cn, date-utils, auth-client)
  stores/          — Estado global (Jotai atoms)
  types/           — Tipos compartidos (ApiError)
  hooks/           — Hooks globales (use-auth)
  components/
    layout/        — Layouts (Sidebar)
    shared/        — Componentes de app (Logo, ThemeProvider, ThemeToggle)
    ui/            — Componentes UI genéricos (Button, Card, Input, FilterSheet...)
  features/<domain>/
    schemas/       — Schemas Zod + interfaces TS del dominio
    hooks/         — Hooks de React Query específicos
    components/    — Componentes del dominio (forms, tables, cards, dialogs)
  routes/          — File-based routing (TanStack Router)
```

**Principio:** Cada dominio tiene sus schemas, hooks y componentes bajo `features/<domain>/`. Los componentes UI genéricos viven en `components/ui/`. Los layouts en `components/layout/`. Las rutas solo orquestan páginas combinando features.

---

## 2. Stack tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Runtime/Bundler | Vite | ^8.1 |
| UI | React | ^19.2 |
| Routing | TanStack Router v1 (file-based) | ^1.170 |
| Server state | TanStack React Query | ^5.101 |
| Global state | Jotai | ^2.20 |
| Forms | react-hook-form + @hookform/resolvers | ^7.81 / ^5.4 |
| Validación | Zod | ^4.4 |
| Auth client | Better Auth | ^1.6 |
| Estilos | Tailwind CSS v4 | ^4.3 |
| Utilidades CSS | CVA + clsx + tailwind-merge | — |
| Iconos | Lucide React | ^1.24 |
| Gráficos | Recharts | ^3.9 |
| Fechas | date-fns + @date-fns/tz (America/Bogota) | ^4.4 / ^1.5 |
| Linter | oxlint | — |
| PWA | vite-plugin-pwa | ^1.3 |

---

## 3. Convenciones de código

### 3.1 Naming

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Componentes | PascalCase | `TransactionForm`, `CategoriesTable` |
| Hooks | `use<Nombre>` camelCase | `useTransactions`, `useCategories` |
| Schemas Zod | `<nombre>Schema` camelCase | `categoryFormSchema` |
| Tipos inferidos | `<Nombre>Input` PascalCase | `CategoryFormInput` |
| Interfaces de dominio | PascalCase sustantivo | `Transaction`, `Category` |
| Funciones utilitarias | camelCase | `formatCurrencyCOP` |
| Archivos de ruta | kebab-case | `formas-de-pago.tsx` |
| Archivos de feature | kebab-case | `transaction-form.tsx` |

### 3.2 Imports

- Usar path alias `@/` → `./src/*`
- **Sin barrel exports** — imports directos al archivo (ej: `import { cn } from "@/lib/utils"`)
- Orden: React/librerías → componentes locales → hooks → schemas → tipos
- **Nunca importar algo que no se use**

### 3.3 Estructura de archivos por feature

```
features/<domain>/
  schemas/<domain>.schema.ts     — Zod schema + interfaces TS + tipos derivados
  hooks/use-<domain>.ts          — React Query hooks (queries + mutations)
  components/
    <domain>-form.tsx            — Formulario create/edit
    <domain>-dialog.tsx          — Dialog wrapper del form
    <domain>-table.tsx           — Tabla / grid de listado
    <domain>-table-skeleton.tsx  — Skeleton de carga
    delete-<domain>-dialog.tsx   — Confirmación de eliminación
```

### 3.4 Props

- Interfaces definidas en el mismo archivo del componente
- No usar `React.FC<>` — usar `function Component({ prop }: Props)` o `({ prop }: Props) =>`

### 3.5 Idioma

- **UI**: español
- **Código** (nombres de variables, funciones, archivos): inglés
- **Rutas URL**: español amigable (`/historial`, `/categorias`)
- **Commits**: español (Conventional Commits)

---

## 4. Componentes UI (`components/ui/`)

Son **custom-made**, sin dependencias externas (no shadcn/ui, no Radix, no Headless UI). Usan CVA para variantes y `cn()` para merge de clases.

### 4.1 Componentes base

| Componente | Descripción |
|---|---|
| `Button` | CVA variants: default, destructive, outline, secondary, ghost, link. Sizes: default, sm, lg, icon |
| `Card` | Compound: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` |
| `Input` | Input nativo con ring focus |
| `Select` | Select nativo estilizado |
| `Label` | CVA con peer-disabled |
| `Skeleton` | Animación pulse para loading states |
| `Tooltip` | Custom con delay 200ms, posicionado a la derecha |

### 4.2 Formularios (`Form`)

Wrappers de `react-hook-form` usando `Controller` + `FormProvider`:
- `<Form>`, `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormControl>`, `<FormDescription>`, `<FormMessage>`

### 4.3 Inputs especializados

| Componente | Descripción |
|---|---|
| `CurrencyInput` | Input para COP con prefijo `$`, formateo ES-CO, separador de miles |
| `DateInput` | Date picker con popover, navegación mes/año, soporte escritura manual `dd/mm/aaaa`, timezone Colombia |

### 4.4 Toast

Sistema propio con Context (`ToastProvider` + `useToast()`). Tipos `success`/`error`, auto-dismiss 3.5s.

### 4.5 FilterSheet

Compound component con portal, animación slide-in-right, focus trap, backdrop. Subcomponentes: `Header`, `Body`, `Section`, `Footer`. Ver sección 8.

---

## 5. Manejo de estado

### 5.1 Server state → React Query

- Todo lo que viene de la API usa `useQuery` / `useMutation`
- Query keys descriptivos: `["transactions", { page, search, type, ... }]`
- Mutaciones invalidan queries relacionadas con `queryClient.invalidateQueries`
- Mutaciones cross-feature: crear/editar/eliminar una transacción también invalida `["dashboard"]`

### 5.2 Global state → Jotai

Solo para estado que persiste entre páginas y no es server state:
- `themeAtom` — tema light/dark con `atomWithStorage("sumly-theme")`

### 5.3 UI state local → useState

- Estado de filtros, ordenamiento, búsqueda, apertura de dialogs/sheets
- Se mantiene en el componente página (ruta) o en el componente que lo necesita

---

## 6. Routing

TanStack Router v1 con **file-based routing**. El plugin `@tanstack/router-plugin` genera `routeTree.gen.ts`.

### 6.1 Jerarquía de rutas

```
__root__  → <Outlet />
├── /                         → Landing page
├── /auth                     → Layout centrado
│   ├── /auth/login
│   └── /auth/register
└── /dashboard                → Layout con Sidebar
    ├── /dashboard/
    ├── /dashboard/historial
    ├── /dashboard/suscripciones
    ├── /dashboard/categorias
    ├── /dashboard/formas-de-pago
    ├── /dashboard/entidades-financieras
    └── /dashboard/perfil
```

### 6.2 Protección de rutas

- `/` → `beforeLoad`: si hay sesión, redirect a `/dashboard`
- `/dashboard/*` → `beforeLoad`: si **no** hay sesión, redirect a `/auth/login`
- `/auth/*` → sin protección

Se verifica con `authClient.getSession()` de Better Auth. No hay middleware global — se hace por ruta individual.

### 6.3 Navegación

- `useNavigate()` de TanStack Router para navegación programática
- `<Link>` para links declarativos
- No usar `window.location`

---

## 7. Llamadas a la API

### 7.1 Cliente HTTP (`api/client.ts`)

Un único wrapper de fetch:

```ts
async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T>
```

- URL: `${env.apiUrl}${endpoint}` (validado con Zod desde `VITE_API_URL`)
- `credentials: "include"` para cookies de auth
- Content-Type `application/json` por defecto
- Errores parseados de `response.json()` → extrae `error.message`
- **Todos los endpoints usan prefijo `/api/v1/`**

### 7.2 Hooks de feature (React Query)

Patrón estándar:

```ts
// Query
export function useTransactions(filters: TransactionFilters) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => apiClient<PaginatedTransactions>(`/transactions?${...}`),
  });
}

// Mutation
export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TransactionFormInput) =>
      apiClient<Transaction>("/transactions", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
```

### 7.3 Auth

Better Auth se maneja con su propio cliente (`lib/auth-client.ts`), **no** a través de `apiClient`:
- `authClient.signIn.email()`, `authClient.signUp.email()`, `authClient.signOut()`
- `authClient.useSession()` para sesión reactiva
- `authClient.getSession()` para guards sincrónicos en `beforeLoad`

---

## 8. Formularios

### 8.1 Stack

`react-hook-form` + `@hookform/resolvers/zod` + `zod`

### 8.2 Patrón

```tsx
// 1. Schema en schemas/<domain>.schema.ts
const transactionFormSchema = z.object({
  amount: z.number().positive(),
  description: z.string().min(1),
  // ...
});
type TransactionFormInput = z.infer<typeof transactionFormSchema>;

// 2. Form en componente
const form = useForm<TransactionFormInput>({
  resolver: zodResolver(transactionFormSchema),
  defaultValues: { amount: undefined, description: "" },
});

// 3. Submit handler
async function onSubmit(data: TransactionFormInput) {
  try {
    await mutation.mutateAsync(data);
    toast.success("Creado correctamente");
    onClose();
  } catch (err) {
    form.setError("root", { message: getErrorMessage(err) });
  }
}

// 4. JSX usando wrappers Form
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField control={form.control} name="amount" render={({ field }) => (
      <FormItem>
        <FormLabel>Monto</FormLabel>
        <FormControl>
          <CurrencyInput {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
  </form>
</Form>
```

### 8.3 Errores

- Errores de validación: automáticos vía Zod + RHF (`FormMessage`)
- Errores del servidor: `form.setError("root", { message })` — se muestra arriba del form

---

## 9. Estilado

### 9.1 Tailwind v4

Configuración via `globals.css` con bloque `@theme` (sin `tailwind.config.ts`):
- Tokens semánticos: `--background`, `--foreground`, `--card`, `--primary`, `--muted`, `--border`, `--ring`, etc.
- Paleta azul corporativo: `hsl(214 82% 41%)` (light) / `hsl(217 100% 50%)` (dark)
- Dark mode: clase `.dark` en `<html>`, aplicada por `ThemeProvider`

### 9.2 Utilidades

- `cn()` (clsx + tailwind-merge) para combinar clases condicionales — **siempre usar esto**, nunca concatenar strings
- CVA (`class-variance-authority`) para componentes con variantes (Button, Label)

### 9.3 Tipografía

- Fuente: `Hanken Grotesk` (Google Fonts)
- Pesos: 400 (90% contenido), 500 (interactivos), 600 (títulos). No usar 700+.
- Cargada via `<link rel="preload">` en `index.html`

### 9.4 Animaciones y scrollbar

- Animaciones definidas con `@keyframes` en `globals.css`
- Utility classes: `animate-glow-pulse`, `animate-fade-in`, `animate-slide-in-right`, `animate-scale-in`, etc.
- `prefers-reduced-motion` desactiva todas las animaciones
- `.scrollbar-thin` (5px, semi-transparente) para áreas scrolleables internas

### 9.5 Responsive

- Breakpoint principal `sm:` (640px)
- Grids responsivas con `sm:grid-cols-2`, `lg:grid-cols-3`, `xl:grid-cols-4`
- Sidebar colapsable en mobile (drawer con overlay)

---

## 10. Estándar de listados con FilterSheet

Cada página de listado usa el componente `FilterSheet` (`components/ui/filter-sheet.tsx`) para agrupar filtros, ordenamiento y búsqueda avanzada fuera del área principal de datos.

### 10.1 Estructura de la página

```
┌─────────────────────────────────────┐
│ Título              [+ Nuevo ...]  │
├─────────────────────────────────────┤
│ [🔍 Buscar...] [⚙ Filtros(N)] [✕] │
├─────────────────────────────────────┤
│ Tabla / Cards / Grid                │
│ (paginación si aplica)              │
└─────────────────────────────────────┘
```

### 10.2 Componente FilterSheet

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
- Usar `style={{ transition: "transform 300ms cubic-bezier(0.16, 1, 0.3, 1)" }}` (NO clases Tailwind para `transition-*`).
- Desmontaje vía `onTransitionEnd` + fallback de 400ms.
- Focus trap, Escape para cerrar, clic en backdrop para cerrar.

**Ancho:** `w-[340px]` mobile, `sm:w-[380px]` desktop.

**Scroll interno:** clase `scrollbar-thin` + fade masks con gradientes `from-card to-transparent`.

### 10.3 Botón de filtros

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

### 10.4 Secciones del sheet (orden canónico)

1. **Tipo / Estado** — filtro principal del recurso. Segmented buttons (`border-primary bg-primary/10 text-primary` cuando activo).
2. **Periodo / Fecha** — solo para recursos con fecha (transactions).
3. **Filtros específicos** — forma de pago, categoría, tags, etc.
4. **Ordenar por** — botones de columna + dirección (asc/desc).

### 10.5 Contador de filtros activos

Cada página calcula `activeFilterCount` con `useMemo` contando cuántos filtros difieren de su valor default. El badge del botón muestra este número.

### 10.6 Checklist al crear/migrar un listado

- [ ] Importar `FilterSheet` y `SlidersHorizontal` de lucide-react
- [ ] Agregar estado `sheetOpen`
- [ ] Agregar estados `sortBy`, `sortDir`
- [ ] Calcular `activeFilterCount` con `useMemo`
- [ ] Botón `size="icon"` al lado de la barra de búsqueda
- [ ] Sheet con `Header`, `Body` con `Section`s, `Footer`
- [ ] Footer con botones "Limpiar filtros" (outline) y "Aplicar" (primary, cierra el sheet)
- [ ] Barra de búsqueda y botón "Limpiar" inline en el CardHeader
- [ ] Todos los filtros que estaban inline migran al sheet
- [ ] Los hooks del recurso aceptan y pasan `sortBy`, `sortDir`

---

## 11. Tipos y schemas

### 11.1 Definición por feature

Cada feature define sus tipos en `schemas/<domain>.schema.ts`:
- **Zod schemas**: validación de formularios (ej: `categoryFormSchema`)
- **Interfaces TS**: entidades de dominio, respuestas paginadas, filtros (ej: `Category`, `PaginatedCategories`)

### 11.2 Respuesta paginada

```ts
interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

Coincide con el contrato del backend (`PaginatedResult<T>`).

### 11.3 No hay generación de tipos desde backend

Los tipos se mantienen manualmente sincronizados. Si se añade un endpoint o cambia la respuesta, actualizar ambos lados.

---

## 12. Timezone y formato

- **Zona horaria**: `America/Bogota` (Colombia, UTC-5)
- **Librerías**: `date-fns` + `@date-fns/tz`
- **Moneda**: `Intl.NumberFormat("es-CO")`, formato `$ 1.234.567`, sin decimales
- **Fechas en API**: ISO 8601. Parseo a `TZDate` para operaciones locales.

---

## 13. Performance y accesibilidad

- Lazy loading de íconos Lucide en `IconPicker` (solo carga sets de 100 íconos a la vez)
- Skeleton screens en todos los listados/tablas durante carga
- `prefers-reduced-motion` respeta configuración del sistema
- Sidebar colapsable con transición width (no re-render)
- PWA con service worker para caché offline de assets

---

## 14. Checklist: agregar un nuevo feature

1. Crear carpeta `features/<domain>/` con `schemas/`, `hooks/`, `components/`
2. **Schema**: definir Zod schema + interfaces TS en `<domain>.schema.ts`
3. **Hooks**: crear queries y mutations en `use-<domain>.ts`
4. **Componentes**: form, dialog, table/card, skeleton, delete-dialog
5. **Ruta**: crear archivo en `routes/dashboard/<nombre>.tsx`
6. Verificar que la ruta quede dentro del layout dashboard (automático por file-based routing)
7. Si es un listado, implementar patrón FilterSheet (secciones canónicas)
8. Ejecutar `bun run lint --workspace frontend` para verificar
