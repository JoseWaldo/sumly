# Glosario — Sumly

## Dominio financiero

| Término | Definición |
|---------|-----------|
| **Movimiento** | Registro genérico de una entrada o salida de dinero. Puede ser ingreso o gasto. |
| **Ingreso** | Dinero que entra. Ej: salario, venta, regalo. |
| **Gasto** | Dinero que sale. Ej: supermercado, transporte, ocio. |
| **Categoría** | Clasificación de un movimiento. Puede ser de tipo `INCOME` o `EXPENSE`. Tiene nombre e icono (Lucide). Las del sistema (`esSistema: true`) no se pueden editar/eliminar. |
| **Suscripción** | Pago recurrente con frecuencia definida (mensual, anual, trimestral, quincenal, semanal). Tiene estado (activa, pausada, cancelada), monto, fecha de próximo pago y forma de pago asociada. |
| **Reportar pago** | Acción de registrar que se realizó el pago de una suscripción. Crea automáticamente un gasto en la categoría "Suscripciones" y actualiza la fecha del próximo pago. |
| **Balance** | Ingresos menos gastos en un período. |
| **Tag** | Etiqueta de color aplicable a suscripciones para agruparlas visualmente. Ej: "Streaming", "Servicios". |
| **Forma de pago** | Medio por el cual se paga. Tipos: crédito, débito, efectivo. Almacena número cifrado (AES-256-GCM), últimos 4 dígitos, gradiente visual personalizado y entidad financiera asociada. |
| **Entidad financiera** | Banco o billetera digital. Tiene nombre, gradiente de colores y formato de número de tarjeta. Algunas son del sistema (`esSistema: true`). |

## Entidades del sistema

| Entidad | Tabla DB | Props clave |
|---------|----------|-------------|
| User | `tbl_user` | name, email |
| Category | `tbl_category` | name, type (INCOME/EXPENSE), icon, userId |
| Transaction | `tbl_transaction` | amount (Decimal), date (Date), description, categoryId, userId |
| Subscription | `tbl_subscription` | name, amount, nextPaymentDate, frequency, status, formaPagoId, userId |
| SubscriptionTag | `tbl_subscription_tag` | name, color, userId |
| FormaPago | `tbl_forma_pago` | nombre, tipo (CREDIT/DEBIT/CASH), numeroEncriptado, ultimosCuatro, gradienteInicio, gradienteFin |
| EntidadFinanciera | `tbl_entidad_financiera` | nombre, gradienteInicio, gradienteFin, esSistema |

## Siglas y acrónimos internos

| Sigla | Significado |
|-------|-------------|
| PWA | Progressive Web App |
| COP | Peso colombiano (moneda) |
| ghcr.io | GitHub Container Registry |
| CUID | Collision-resistant Unique ID (generador de IDs) |

## Frecuencias de suscripción

| Valor | Significado |
|-------|-------------|
| MONTHLY | Mensual |
| YEARLY | Anual |
| QUARTERLY | Trimestral |
| BIWEEKLY | Quincenal |
| WEEKLY | Semanal |

## Estados de suscripción

| Valor | Significado |
|-------|-------------|
| ACTIVE | Activa — se espera el próximo pago |
| PAUSED | Pausada — temporalmente detenida |
| CANCELLED | Cancelada — definitivamente terminada |

## Verbos de acción

| Verbo en UI | Significado en el dominio |
|-------------|--------------------------|
| Registrar | Crear un movimiento o suscripción |
| Reportar pago | Marcar una suscripción como pagada este período |
| Saldar | Marcar una deuda como completamente pagada (feature pendiente) |
| Abonar | Hacer un pago parcial sobre una deuda (feature pendiente) |
