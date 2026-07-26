# Contexto del Producto — Sumly

## Resumen

Aplicación web para uso individual que permite gestionar finanzas personales: registrar ingresos y gastos manualmente, categorizarlos, visualizar reportes, dar seguimiento a deudas (propias y de terceros) y recibir recordatorios de pagos por correo electrónico.

## Supuestos

- Plataforma: aplicación web (PWA).
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

- Se valida que el correo no esté duplicado.
- Pendiente: opción de "recuperar contraseña".

### 2. Registro de movimientos (ingresos y gastos)

| ID | Historia | Estado |
|----|----------|--------|
| HU-04 | Registrar ingreso (monto, fecha, descripción, categoría) | Hecho |
| HU-05 | Registrar gasto (monto, fecha, descripción, categoría) | Hecho |
| HU-06 | Editar un movimiento | Hecho |
| HU-07 | Eliminar un movimiento | Hecho |
| HU-08 | Listado de movimientos ordenados por fecha | Hecho |

### 3. Categorías

| ID | Historia | Estado |
|----|----------|--------|
| HU-09 | Usar categorías predefinidas al registrar movimientos | Hecho |
| HU-10 | Crear categorías personalizadas | Hecho |
| HU-11 | Editar/eliminar categorías personalizadas | Hecho |

### 4. Gestión de deudas

| ID | Historia | Estado |
|----|----------|--------|
| HU-21 | Registrar deuda a favor ("me deben"): monto, persona, concepto, vencimiento | Pendiente |
| HU-22 | Registrar deuda en contra ("yo debo"): monto, persona, concepto, vencimiento | Pendiente |
| HU-23 | Registrar abonos/pagos parciales sobre una deuda | Pendiente |
| HU-24 | Ver saldo pendiente (monto original - abonos) | Pendiente |
| HU-25 | Marcar deuda como saldada | Pendiente |
| HU-26 | Listado separado: deudas a favor vs deudas en contra | Pendiente |
| HU-27 | Recordatorio de vencimiento por correo electrónico | Pendiente |

> Las deudas no se incluyen en los reportes/gráficos generales de gastos e ingresos, para no distorsionar esas métricas.

### 5. Reportes y gráficos

| ID | Historia | Estado |
|----|----------|--------|
| HU-12 | Reporte diario de ingresos y gastos | Pendiente |
| HU-13 | Gráfico de barras: gastos por categoría | Pendiente |
| HU-14 | Gráfico circular (pie): distribución de gastos | Hecho |
| HU-15 | Línea de tendencia: evolución de ingresos y gastos en el tiempo | Pendiente |
| HU-16 | Balance general (ingresos - gastos) del período | Hecho |

### 6. Recordatorios de pagos/facturas

| ID | Historia | Estado |
|----|----------|--------|
| HU-17 | Crear recordatorio de pago con fecha de vencimiento | Pendiente |
| HU-18 | Notificación por correo antes del vencimiento | Pendiente |
| HU-19 | Marcar pago como realizado | Pendiente |
| HU-20 | Listado de pagos pendientes | Pendiente |

---

## Funcionalidades planeadas (no en historias de usuario originales)

- Lectura de correos con IA para detección automática de ingresos y gastos
- Conexión con amigos y división de cuentas (restaurantes, mercados, etc.)
- Registro por voz para captura rápida de movimientos
- Soporte multi-idioma (inglés)

---

## Stack técnico

React 19, TypeScript, Tailwind v4, TanStack Router, TanStack Query, Jotai, Recharts, React Hook Form + Zod, Better Auth, Bun, Vite, PWA.
