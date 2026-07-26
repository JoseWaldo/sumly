# Errores Conocidos — Sumly

## Errores y gotchas del código

### 1. MONTHS duplicado en ingresos.tsx y gastos.tsx
Los dos archivos definen el mismo array `MONTHS` de forma independiente (`ingresos.tsx:29-32`, `gastos.tsx:29-32`). Si se cambia el formato, hay que cambiarlo en dos lugares. Debería ser una constante compartida.

### 2. FormControl wrapping bug en transaction-form.tsx:114
`<FormControl>` envuelve un `<div className="space-y-2">` en vez de un input directo. Los atributos de accesibilidad (`id`, `aria-describedby`, `aria-invalid`) se inyectan vía `cloneElement` en el div, pero el `<input>` real (el search de categorías en línea 118) nunca los recibe.

### 3. Dashboard loading state race condition en dashboard/index.tsx
La sección de gráfico circular (`expensesByCategory`) tiene su propio estado de carga independiente del skeleton de transacciones recientes. Si la API de summary responde antes que la de categories, el gráfico muestra brevemente "Sin datos para mostrar" antes de cargar los datos reales. Falta un estado `isLoading` para el chart.

### 4. Auth form links no siguen DESIGN.md
Los links "Regístrate" / "Inicia sesión" en los forms de auth usan `text-primary underline`, pero DESIGN.md §5 especifica `text-muted-foreground` → `text-foreground` en hover para links de navegación.

### 5. Sin manejo global de errores de API en frontend
`apiClient.ts` lanza errores como `ApiError`, pero no hay un error boundary ni un handler global. Si una API falla, el error solo se ve en la consola o en el estado del mutation de TanStack Query. El usuario no recibe feedback visual de fallos de red.

### 6. Tooltip `aria-describedby` ausente
El componente `Tooltip` (`src/components/ui/tooltip.tsx`) no asigna `aria-describedby` al elemento trigger. Los lectores de pantalla no asocian el tooltip con su trigger.

### 7. Sin focus trapping en modales
Los dialogs (`category-dialog.tsx`, `subscription-dialog.tsx`, etc.) no atrapan el foco. Tabeando se puede salir del modal hacia elementos del fondo. Solo manejan Escape para cerrar.

### 8. Sidebar toggle button muy pequeño (24x24px)
El botón de colapsar sidebar en desktop tiene `h-6 w-6` (24px). Para usuarios que colapsan/expanden con frecuencia, es un target incómodo. WCAG recomienda mínimo 44x44px para touch targets.

### 9. Íconos del sidebar sin `aria-label` en modo colapsado
Cuando el sidebar está colapsado (`w-16`), los ítems de navegación solo muestran iconos sin texto. Los tooltips ayudan visualmente pero no hay atributo `aria-label` en los `<Link>` para lectores de pantalla.

### 10. `text-emerald-600` residual en forma-pago-card.tsx
El badge "OK" en la tarjeta de forma de pago usa `text-green-300` hardcodeado en vez de `text-chart-2`. [PENDIENTE: verificar si hay más colores hardcodeados fuera del token system.]

## Gotchas del entorno

### Docker Compose y variables de entorno
- El `.env` en raíz es ignorado por git pero requerido por docker compose. Si no existe, `docker compose up` falla silenciosamente.
- Las variables del frontend (`VITE_*`) deben pasarse como `--build-arg` durante el build de Docker, no en runtime.

### Prisma y Bun
- Prisma Client se genera en `prisma/schema/generated/`. Si se cambia el schema, hay que regenerar con `bun run db:generate` antes de que TypeScript reconozca los tipos nuevos.
- El `prisma.config.ts` en la raíz del backend es requerido por Prisma 7 para configuración.

### Migraciones con datos existentes
- La migración `rename_auth_tables` renombró tablas. Si hubiera datos en producción, habría requerido verificación manual.
- `onDelete: Restrict` en `formaPagoId` de Subscription y `entidadFinancieraId` de FormaPago impide borrar formas de pago o entidades que estén en uso.
