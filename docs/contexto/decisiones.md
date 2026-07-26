# Decisiones Técnicas — Sumly

## Clean Architecture en backend

**Por qué:** Separación estricta de responsabilidades. Los use cases no conocen Prisma ni Hono. Si se cambia el ORM o el framework HTTP, solo cambia la capa de infraestructura.

**Descartado:** Arquitectura plana (todo en un solo archivo/controlador). El proyecto empezó así y se migró a Clean Architecture (visible en commits iniciales vs estructura actual).

## Monorepo con Turborepo + Bun workspaces

**Por qué:** Un solo repo para frontend y backend. Turborepo cachea builds y lint. Bun por velocidad.

**Descartado:** NX, Lerna, dos repos separados. Turborepo es más ligero y Bun lo soporta nativamente.

## Better Auth sobre Auth0, Clerk o NextAuth

**Por qué:** Self-hosted, sin límites de usuarios gratuitos, open source. La app es gratuita inicialmente y Better Auth no impone costos por MAU.

**Descartado:** Auth0/Clerk (costos por usuario), NextAuth (acoplado a Next.js). Better Auth funciona con cualquier framework y está diseñado para Bun.

## Prisma sobre Drizzle, Knex o SQL raw

**Por qué:** Tipado automático del schema, migraciones declarativas, buena DX con Prisma Studio. El schema ya tiene 10 modelos y relaciones complejas que Prisma maneja bien.

**Descartado:** Drizzle (más ligero pero menos maduro en el momento de inicio). Knex (demasiado bajo nivel). SQL raw (sin type safety).

## AES-256-GCM para números de tarjeta

**Por qué:** Los números de tarjeta en `tbl_forma_pago.numero_encriptado` se cifran con AES-256-GCM usando una clave de 32+ caracteres (`ENCRYPTION_KEY`). Solo se muestran los últimos 4 dígitos en texto plano (`ultimos_cuatro`).

**Descartado:** Almacenar en texto plano (riesgo de seguridad), hashing (necesidad de recuperar el número para mostrarlo o usarlo).

## Prefijo `tbl_` en tablas de base de datos

**Por qué:** Evitar colisiones con palabras reservadas de PostgreSQL. Consistencia visual en el schema. Visible en la migración `20260718025932_rename_auth_tables_to_tbl_prefix`.

**Descartado:** Nombres sin prefijo (riesgo de colisión con tablas de sistema o extensiones).

## Tailwind v4 en vez de v3 o CSS Modules

**Por qué:** v4 tiene `@theme` y `@utility` nativos que mapean directamente a CSS custom properties. Sin necesidad de `tailwind.config.ts`. El DESIGN.md define tokens como variables CSS y Tailwind los consume.

**Descartado:** Tailwind v3 (requiere archivo de configuración separado). CSS Modules (más boilerplate, menos consistencia). Styled Components (runtime cost).

## Sin dependencias de UI (Radix, Headless UI, etc.)

**Por qué:** Control total sobre el markup, los estilos y el comportamiento. Menos dependencias que mantener. Los componentes son simples (tooltip, dialog, select) y no justifican una librería externa.

**Descartado:** Radix UI (se eliminó en commit `2c65083`). Shadcn/ui (requiere Radix).

## Tipografía: sin bold, solo regular/medium/semibold

**Por qué:** La jerarquía se construye con tamaño y tracking, no con peso. El bold (700) se siente pesado en la estética minimalista. Se relajó para permitir `font-semibold` (600) en títulos de página tras encontrar que 4 páginas rompían la regla original de cero bold.

**Descartado:** Usar bold libremente como la mayoría de apps.

## PWA con vite-plugin-pwa

**Por qué:** Instalable en móvil, cache offline, service worker automático. Sin necesidad de app nativa.

**Descartado:** React Native / Expo (más complejidad, dos codebases). Solo web responsive (sin capacidad offline).

## Español en UI y commits

**Por qué:** Audiencia colombiana. Los commits y documentación reflejan el idioma del producto y del equipo.

**Descartado:** Inglés forzado (distancia entre código y usuario final).
