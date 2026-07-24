# Historias de Usuario – App Web de Finanzas Personales

## Resumen del producto
Aplicación web para uso individual que permite a una persona gestionar sus finanzas personales: registrar ingresos y gastos manualmente, categorizarlos, visualizar reportes gráficos, dar seguimiento a deudas (propias y de terceros) y recibir recordatorios de pagos por correo electrónico.

---

## 1. Gestión de usuario

**HU-01: Registro de usuario**
Como usuario nuevo, quiero poder registrarme con correo y contraseña, para tener una cuenta personal y segura donde guardar mis datos financieros.
- Criterios de aceptación:
  - El registro requiere correo electrónico y contraseña.
  - El sistema valida que el correo no esté ya registrado.
  - Se envía confirmación de registro exitoso.

**HU-02: Inicio de sesión**
Como usuario registrado, quiero iniciar sesión con mi correo y contraseña, para acceder a mi información financiera de forma privada.
- Criterios de aceptación:
  - Se valida correo y contraseña.
  - Se muestra mensaje de error si las credenciales son incorrectas.
  - Existe opción de "recuperar contraseña".

**HU-03: Cierre de sesión**
Como usuario autenticado, quiero poder cerrar sesión, para proteger el acceso a mi cuenta cuando termino de usar la app.

---

## 2. Registro de movimientos (ingresos y gastos)

**HU-04: Registrar un ingreso**
Como usuario, quiero registrar manualmente un ingreso (monto, fecha, descripción y categoría), para llevar control de mi dinero entrante.

**HU-05: Registrar un gasto**
Como usuario, quiero registrar manualmente un gasto (monto, fecha, descripción y categoría), para llevar control de mi dinero saliente.

**HU-06: Editar un movimiento**
Como usuario, quiero poder editar un ingreso o gasto ya registrado, para corregir errores de captura.

**HU-07: Eliminar un movimiento**
Como usuario, quiero poder eliminar un ingreso o gasto, para quitar registros duplicados o incorrectos.

**HU-08: Listado de movimientos**
Como usuario, quiero ver un listado de todos mis movimientos ordenados por fecha, para revisar mi historial financiero.

---

## 3. Categorías

**HU-09: Uso de categorías predefinidas**
Como usuario, quiero elegir entre categorías predefinidas (ej. comida, transporte, ocio, salud, vivienda) al registrar un movimiento, para clasificar mis gastos rápidamente.

**HU-10: Creación de categorías personalizadas**
Como usuario, quiero crear mis propias categorías, para clasificar movimientos que no encajan en las categorías predefinidas.

**HU-11: Edición/eliminación de categorías personalizadas**
Como usuario, quiero editar o eliminar las categorías que yo mismo creé, para mantener mi clasificación organizada y actualizada.

---

## 4. Gestión de deudas

**HU-21: Registrar deuda a favor (me deben)**
Como usuario, quiero registrar una deuda que otra persona tiene conmigo (monto, nombre/contacto de la persona, concepto y fecha de vencimiento), para llevar control de lo que me deben.

**HU-22: Registrar deuda en contra (yo debo)**
Como usuario, quiero registrar una deuda que yo tengo con otra persona (monto, nombre/contacto de la persona, concepto y fecha de vencimiento), para llevar control de lo que debo pagar.

**HU-23: Registrar abonos/pagos parciales a una deuda**
Como usuario, quiero registrar abonos parciales sobre una deuda (propia o de terceros), para llevar el seguimiento del saldo pendiente conforme se va pagando o cobrando.

**HU-24: Ver saldo pendiente de una deuda**
Como usuario, quiero ver el saldo pendiente de cada deuda (monto original menos abonos realizados), para saber cuánto falta por pagar o cobrar.

**HU-25: Marcar deuda como saldada**
Como usuario, quiero marcar una deuda como completamente saldada, para sacarla de mi lista de deudas activas.

**HU-26: Listado de deudas activas**
Como usuario, quiero ver un listado separado de deudas a favor y deudas en contra, para tener claridad de mi situación con terceros sin mezclarlo con mis gastos e ingresos personales.

**HU-27: Recordatorio de vencimiento de deuda**
Como usuario, quiero recibir un correo electrónico antes de la fecha de vencimiento de una deuda (propia o de terceros), para no olvidar pagarla o darle seguimiento al cobro.

---

## 5. Reportes y gráficos

**HU-12: Reporte diario**
Como usuario, quiero ver un resumen diario de mis ingresos y gastos, para entender mi actividad financiera día a día.

**HU-13: Visualización con gráfico de barras**
Como usuario, quiero ver mis gastos por categoría en un gráfico de barras, para comparar fácilmente cuánto gasto en cada rubro.

**HU-14: Visualización con gráfico circular (pie)**
Como usuario, quiero ver la distribución de mis gastos en un gráfico circular, para identificar de un vistazo qué categorías consumen mayor proporción de mi dinero.

**HU-15: Visualización con línea de tendencia**
Como usuario, quiero ver una gráfica de línea con la evolución de mis ingresos y gastos en el tiempo, para detectar tendencias y cambios en mis hábitos financieros.

**HU-16: Balance general**
Como usuario, quiero ver mi balance (ingresos menos gastos) del período seleccionado, para saber si estoy ahorrando o gastando de más.

---

## 5. Gestión de deudas

**HU-21: Registrar deuda a favor (me deben)**
Como usuario, quiero registrar una deuda que otra persona tiene conmigo (monto, nombre/contacto de la persona, concepto y fecha de vencimiento), para llevar control de lo que me deben.

**HU-22: Registrar deuda en contra (yo debo)**
Como usuario, quiero registrar una deuda que yo tengo con otra persona (monto, nombre/contacto de la persona, concepto y fecha de vencimiento), para llevar control de lo que debo.

**HU-23: Registrar abonos/pagos parciales de una deuda**
Como usuario, quiero registrar abonos parciales sobre una deuda (propia o de terceros), para llevar el control de cuánto se ha pagado y cuánto queda pendiente.

**HU-24: Ver saldo pendiente de una deuda**
Como usuario, quiero ver el saldo restante de cada deuda después de los abonos registrados, para saber cuánto falta por cobrar o pagar.

**HU-25: Marcar deuda como saldada**
Como usuario, quiero marcar una deuda como completamente saldada, para sacarla de mi listado de deudas activas.

**HU-26: Recordatorio de vencimiento de deuda**
Como usuario, quiero recibir un correo electrónico de recordatorio antes de la fecha de vencimiento de una deuda (propia o de terceros), para no olvidar cobrar o pagar a tiempo.

**HU-27: Listado de deudas activas**
Como usuario, quiero ver un listado separado de mis deudas activas, distinguiendo entre "me deben" y "yo debo", para tener claridad de mi situación con terceros sin mezclarlo con mis gastos e ingresos habituales.

> Nota: las deudas se gestionan de forma independiente y **no** se incluyen en los reportes/gráficos generales de gastos e ingresos, para no distorsionar esas métricas.

---

## 6. Recordatorios de pagos/facturas

**HU-17: Crear recordatorio de pago**
Como usuario, quiero registrar un pago o factura pendiente con fecha de vencimiento, para no olvidar realizarlo a tiempo.

**HU-18: Notificación por correo electrónico**
Como usuario, quiero recibir un correo electrónico antes de la fecha de vencimiento de un pago, para tener tiempo suficiente de realizarlo.

**HU-19: Marcar pago como realizado**
Como usuario, quiero marcar un recordatorio como "pagado", para llevar control de qué pagos ya cumplí y cuáles siguen pendientes.

**HU-20: Listado de pagos pendientes**
Como usuario, quiero ver un listado de todos mis pagos/facturas pendientes, para tener visibilidad de mis próximas obligaciones financieras.

---

## Notas / supuestos
- Plataforma: aplicación web.
- Uso individual (no colaborativo ni multiusuario compartido).
- El registro de movimientos es manual (sin conexión bancaria automática ni importación de archivos).
- Los recordatorios (de pagos/facturas y de deudas) se envían únicamente por correo electrónico.
- Los reportes combinan gráficos de barras, circulares y de línea.
- Las deudas (propias y de terceros) se gestionan de forma independiente de los reportes de gastos/ingresos, e incluyen abonos parciales y nombre/contacto de la persona involucrada.

