# Contexto del Producto — Sumly

## Resumen

Aplicación web para uso individual que permite gestionar finanzas personales: registrar ingresos y gastos manualmente, categorizarlos, gestionar suscripciones, administrar medios de pago (tarjetas de crédito/débito/efectivo con encriptación), visualizar reportes, dar seguimiento a deudas (propias y de terceros) y recibir recordatorios de pagos por correo electrónico.

## Arquitectura

Monorepo con **Bun** + **Turbo**:

```
apps/
  frontend/   — React 19 + Vite + Tailwind v4
  backend/    — Hono (Bun) + Prisma + PostgreSQL
```

- **Backend**: Clean Architecture en capas (`domain/`, `application/`, `infrastructure/`, `presentation/`).
- **Frontend**: rutas basadas en archivos con TanStack Router, estado servidor con TanStack Query, estado de cliente con Jotai.
- **Base de datos**: PostgreSQL 16, migraciones con Prisma ORM. todas las tablas usan prefijo `tbl_`.
- **Despliegue**: Docker Compose (local, staging, producción) con nginx sirviendo el frontend.

## Supuestos

- Plataforma: aplicación web (PWA — parcial, solo cacheo de assets estáticos).
- Uso individual (no colaborativo ni multiusuario compartido — aunque se planea conexión con amigos a futuro).
- El registro de movimientos es manual (sin conexión bancaria automática).
- Los recordatorios (pagos, facturas, deudas) se envían por correo electrónico.
- Las deudas se gestionan de forma independiente de los reportes de gastos/ingresos, e incluyen abonos parciales y nombre/contacto de la persona involucrada.

---

## Funcionalidades

### 1. Gestión de usuario

| ID | Historia | Estado |
|----|----------|--------|
| HU-01 | Registro con correo y contraseña | Hecho |
| HU-02 | Inicio de sesión | Hecho |
| HU-03 | Cierre de sesión | Hecho |
| HU-28 | Correo de bienvenida al registrarse | Hecho |

- Se valida que el correo no esté duplicado.
- Autenticación con Better Auth (estrategia email + contraseña).
- Correo de bienvenida vía SMTP (Nodemailer) al crear cuenta.
- Pendiente: opción de "recuperar contraseña".

### 2. Perfil de usuario

| ID | Historia | Estado |
|----|----------|--------|
| HU-29 | Actualizar nombre de perfil | Hecho |

### 3. Registro de movimientos (ingresos y gastos)

| ID | Historia | Estado |
|----|----------|--------|
| HU-04 | Registrar ingreso (monto, fecha, descripción, categoría) | Hecho |
| HU-05 | Registrar gasto (monto, fecha, descripción, categoría) | Hecho |
| HU-06 | Editar un movimiento | Hecho |
| HU-07 | Eliminar un movimiento | Hecho |
| HU-08 | Listado de movimientos ordenados por fecha | Hecho |

- Filtros por mes/año y búsqueda por texto.
- Paginación en backend.

### 4. Categorías

| ID | Historia | Estado |
|----|----------|--------|
| HU-09 | Usar categorías predefinidas al registrar movimientos | Hecho |
| HU-10 | Crear categorías personalizadas | Hecho |
| HU-11 | Editar/eliminar categorías personalizadas | Hecho |

- Cada categoría tiene nombre, tipo (`INCOME`/`EXPENSE`) e ícono (librería Lucide).
- Selector visual de íconos en el formulario.
- Filtros por tipo y búsqueda.

### 5. Suscripciones

| ID | Historia | Estado |
|----|----------|--------|
| HU-30 | Registrar suscripción (nombre, monto, frecuencia, fecha próximo pago) | Hecho |
| HU-31 | Editar/eliminar suscripción | Hecho |
| HU-32 | Reportar pago de suscripción (avanza fecha de próximo pago) | Hecho |
| HU-33 | Asociar medio de pago a la suscripción | Hecho |
| HU-34 | Etiquetas (tags) personalizadas para suscripciones | Hecho |
| HU-35 | Filtrar suscripciones por estado (activa/pausada/cancelada) o tag | Hecho |
| HU-36 | Resumen de suscripciones en dashboard (total mensual, activas, próximos pagos) | Hecho |

- Frecuencias: semanal, quincenal, mensual, trimestral, anual.
- Estados: activa, pausada, cancelada.
- Vista en tarjetas (cards) con gradientes de color por medio de pago.

### 6. Formas de pago

| ID | Historia | Estado |
|----|----------|--------|
| HU-37 | Registrar forma de pago (crédito, débito, efectivo) | Hecho |
| HU-38 | Visualizar tarjetas con diseño tipo tarjeta bancaria | Hecho |
| HU-39 | Encriptar número de tarjeta (AES-256-GCM) | Hecho |
| HU-40 | Revelar número completo autenticado | Hecho |
| HU-41 | Marcar forma de pago como pública | Hecho |
| HU-42 | Editar/eliminar forma de pago | Hecho |

- Se auto-crea una forma de pago "Efectivo" por usuario.
- Las tarjetas muestran gradiente personalizado, últimos 4 dígitos, y entidad financiera asociada.

### 7. Entidades financieras

| ID | Historia | Estado |
|----|----------|--------|
| HU-43 | Registrar entidad financiera (nombre, colores, formato de número) | Hecho |
| HU-44 | Editar/eliminar entidad financiera | Hecho |
| HU-45 | Entidades de sistema pre-cargadas (Bancolombia, Nu, Nequi, DaviPlata, Bre-B) | Hecho |

### 8. Tema

| ID | Historia | Estado |
|----|----------|--------|
| HU-46 | Alternar entre tema claro y oscuro | Hecho |

- Persistencia en localStorage vía Jotai (`atomWithStorage`).
- Detecta preferencia del sistema al primer acceso.

### 9. Dashboard principal

| ID | Historia | Estado |
|----|----------|--------|
| HU-47 | Tarjetas de resumen: balance, ingresos del mes, gastos del mes, suscripciones | Hecho |
| HU-48 | Gráfico circular (pie): distribución de gastos por categoría | Hecho |
| HU-16 | Balance general (ingresos - gastos) del período | Hecho |
| HU-12 | Reporte diario de ingresos y gastos | Pendiente |
| HU-13 | Gráfico de barras: gastos por categoría | Pendiente |
| HU-15 | Línea de tendencia: evolución de ingresos y gastos en el tiempo | Pendiente |

### 10. Gestión de deudas

| ID | Historia | Estado |
|----|----------|--------|
| HU-21 | Registrar deuda a favor ("me deben"): monto, persona, concepto, vencimiento | Hecho (HU-71) |
| HU-22 | Registrar deuda en contra ("yo debo"): monto, persona, concepto, vencimiento | Hecho (HU-71) |
| HU-23 | Registrar abonos/pagos parciales sobre una deuda | Hecho (HU-75) |
| HU-24 | Ver saldo pendiente (monto original - abonos) | Hecho (HU-75) |
| HU-25 | Marcar deuda como saldada | Hecho (HU-78) |
| HU-26 | Listado separado: deudas a favor vs deudas en contra | Hecho (HU-73) |
| HU-27 | Recordatorio de vencimiento por correo electrónico | Pendiente |
| HU-71 | Registrar deudas ME_DEBEN/YO_DEBO (texto libre o amigos, grupal ≤10, auto_confirmar) + movimientos NEUTRAL | Hecho |
| HU-72 | Deuda espejo automática entre amigos (snapshot, inmutabilidad, cascada, independencia de la amistad) | Hecho |
| HU-73 | Listado separado a favor/en contra, paginado y filtrable | Hecho |
| HU-74 | Dashboard de deudas (a favor, en contra, próximas a vencer) + saldo disponible en dashboard principal | Hecho |
| HU-75 | Abonos parciales idempotentes con forma de pago y comprobante opcional | Hecho |
| HU-76 | Confirmar/rechazar abonos, auto-confirmación y resolución de disputas | Hecho |
| HU-77 | Cancelar (con reversa) y perdonar deuda | Hecho |
| HU-78 | Movimientos NEUTRAL vinculados (tbl_movimiento) y saldo disponible | Hecho |
| HU-79 | Historial de eventos por deuda (trazabilidad) | Hecho |
| HU-80 | Estado VENCIDA automático (lazy en SP + cron futuro) | Hecho |

> Las deudas abiertas no generan transacciones en los reportes de gastos/ingresos. Se manejan con movimientos NEUTRAL (tbl_movimiento) que solo afectan el saldo disponible. Las transacciones REAL (tbl_transaction) solo se usan para ingresos/gastos normales. El saldo disponible = balance(tbl_transaction) + neto NEUTRAL(tbl_movimiento).

### 11. Recordatorios de pagos/facturas

| ID | Historia | Estado |
|----|----------|--------|
| HU-17 | Crear recordatorio de pago con fecha de vencimiento | Pendiente |
| HU-18 | Notificación por correo antes del vencimiento | Pendiente |
| HU-19 | Marcar pago como realizado | Pendiente |
| HU-20 | Listado de pagos pendientes | Pendiente |

> La infraestructura de envío de correos (SMTP/Nodemailer) ya existe. Falta el scheduler/cron y los modelos de datos.

### 12. PWA

| ID | Historia | Estado |
|----|----------|--------|
| HU-51 | Manifest e íconos para instalación | Hecho |
| HU-52 | Service worker con cacheo de assets estáticos y Google Fonts | Hecho |
| HU-53 | Funcionamiento offline (cacheo de respuestas API, cola de operaciones) | Pendiente |

### 13. Infraestructura de archivos (AWS S3)

| ID | Historia | Estado |
|----|----------|--------|
| HU-56 | Subida de archivos con validacion de tipo y peso | Hecho |
| HU-57 | Descarga de archivos via URL firmada | Hecho |
| HU-58 | Visualizacion de archivos (imagenes) via URL firmada | Hecho |
| HU-59 | Listado paginado de archivos | Hecho |
| HU-60 | Subida de foto de perfil | Hecho |

- Backend: validacion por magic number (tipos: image/*, CSV, Excel). Maximo 10 MB.
- Frontend: validacion anticipada de tipo y peso antes de enviar.
- Almacenamiento: AWS S3, buckets privados con URLs presigned.
- `user.image` guarda el `fileId`, resuelto via `/files/:id/view`.
- Componente `FileUpload` reutilizable con drag & drop y preview.

---

## Funcionalidades planeadas (no implementadas)

- Lectura de correos con IA para detección automática de ingresos y gastos.
- Conexión con amigos y división de cuentas (restaurantes, mercados, etc.).
- Registro por voz para captura rápida de movimientos.
- Soporte multi-idioma (inglés).
- Recuperación de contraseña.

---

## API REST

Todas las rutas bajo `/api/v1`, autenticadas (excepto health y auth). Estructura principal:

| Recurso | Endpoints |
|---------|-----------|
| Health | `GET /health` |
| Auth | `ALL /auth/*` (Better Auth), `GET /auth/me` |
| Profile | `GET /profile` |
| Transactions | `GET/POST /transactions`, `GET/PATCH/DELETE /transactions/:id`, `GET /transactions/dashboard`, `GET /transactions/dashboard/expenses-by-category` |
| Categories | `GET/POST /categories`, `GET/PATCH/DELETE /categories/:id` |
| Subscriptions | `GET/POST /subscriptions`, `GET/PATCH/DELETE /subscriptions/:id`, `POST /subscriptions/:id/report`, `GET/POST /subscriptions/tags`, `DELETE /subscriptions/tags/:id`, `GET /subscriptions/dashboard` |
| Formas de pago | `GET/POST /formas-pago`, `GET/PATCH/DELETE /formas-pago/:id`, `GET /formas-pago/:id/reveal` |
| Entidades financieras | `GET/POST /entidades-financieras`, `GET/PATCH/DELETE /entidades-financieras/:id` |
| Files | `GET /files`, `POST /files/upload`, `GET /files/:id/view`, `GET /files/:id/download` |
| Deudas | `GET/POST /deudas`, `GET /deudas/dashboard`, `GET /deudas/:id`, `GET /deudas/:id/eventos`, `POST /deudas/:id/cancelar`, `POST /deudas/:id/perdonar`, `POST /deudas/:id/abonos`, `POST /deudas/:id/abonos/:abonoId/confirmar`, `POST /deudas/:id/abonos/:abonoId/rechazar`, `POST /deudas/:id/disputa`, `DELETE /deudas/:id` |

---

## Stack técnico

**Monorepo**: Bun (1.3) + Turbo

**Frontend** (`apps/frontend`):
- React 19, TypeScript 6, Vite 8
- TanStack Router (file-based), TanStack Query v5, TanStack Table v8
- Jotai v2 (estado cliente: tema)
- Tailwind CSS v4 + tailwind-merge + CVA
- React Hook Form v7 + Zod v4
- Recharts v3, Lucide React, date-fns v4
- Better Auth client (React)
- Componente `FileUpload` (drag & drop, preview, validacion)
- vite-plugin-pwa

**Backend** (`apps/backend`):
- Hono v4 (Bun)
- Better Auth v1 + Prisma adapter (email/password)
- Prisma v7 + PostgreSQL 16
- Zod v3 (validación de entorno y DTOs)
- Nodemailer (SMTP)
- AES-256-GCM (encriptacion de numeros de tarjeta)
- `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` (AWS S3)

**Infraestructura**: Docker Compose (3 entornos: local, staging, produccion), nginx, GitHub Container Registry, AWS S3.
