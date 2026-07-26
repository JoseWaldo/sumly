# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Personas individuales que quieren organizar sus finanzas personales de forma sencilla, sin complejidad bancaria. El producto está pensado inicialmente para amigos y familiares del creador. Usuarios colombianos como mercado inicial, con posibilidad de expandir a otros países hispanohablantes e inglés en el futuro.

## Product Purpose

Sumly ayuda a una persona a mantener sus finanzas en equilibrio mediante el registro y seguimiento de ingresos, gastos, suscripciones recurrentes y deudas. El producto busca reducir la fricción de registrar movimientos financieros usando mecanismos como lectura de correos con IA, comandos de voz, y conexión con amigos para dividir cuentas.

Éxito significa que el usuario siempre sepa exactamente cuánto tiene, cuánto debe y cuándo vencen sus compromisos, sin fricción de registro.

## Positioning

- **Sin sincronización bancaria.** A diferencia de apps como Fintonic o Wallet, Sumly no se conecta a bancos. La confianza está en el control manual del usuario, asistido por IA.
- **Detección por IA desde correos.** Lectura de correos electrónicos para identificar y registrar automáticamente ingresos y gastos.
- **Social y colaborativo.** Conexión con amigos, división de cuentas (restaurantes, mercados, etc.) y gestión de deudas entre personas.
- **Entrada rápida.** Registro por voz para capturar movimientos en segundos.
- **Enfoque en suscripciones.** Tracking dedicado de pagos recurrentes con recordatorios.
- **Hecho en Colombia.** Lenguaje, moneda (COP), fechas y contexto local como prioridad.

## Operating Context

- App web progresiva (PWA), mobile-first, accesible desde navegador en móvil y desktop.
- Los usuarios registran movimientos manualmente en su día a día, idealmente desde el teléfono.
- En el futuro, la IA procesará correos electrónicos en segundo plano para detectar transacciones.
- Escenarios de uso: en casa revisando finanzas, en un restaurante dividiendo cuenta con amigos, en el supermercado registrando un gasto rápido por voz.

## Capabilities and Constraints

**Capabilities actuales:**
- Registro manual de ingresos y gastos con categorías e iconos personalizables
- Gestión de suscripciones recurrentes con estados (activa, pausada, cancelada), recordatorios y registro de pagos
- Dashboard con balance, resumen mensual y gráfico de distribución de gastos
- Gestión de entidades financieras y formas de pago (tarjetas con gradientes personalizables)
- Perfil de usuario con tema claro/oscuro
- Autenticación por email y contraseña
- Tema oscuro inspirado en la estética de Supabase

**Capacidades planeadas (no implementadas aún):**
- Lectura de correos con IA para detección automática de ingresos y gastos
- Gestión de deudas y deudores (préstamos entre personas)
- Conexión con amigos y división de cuentas
- Registro por voz
- Soporte multi-idioma (inglés)

**Restricciones técnicas:**
- Stack: React 19, TypeScript, Tailwind v4, TanStack Router/Query, Bun, Vite
- Backend separado (API en el mismo monorepo)
- Sin dependencia de servicios bancarios externos
- PWA con soporte offline básico

**Decisiones abiertas:**
- Modelo de monetización si la base de usuarios escala
- Momento de transición de código abierto a privado
- Alcance exacto de la funcionalidad de IA por correos

## Brand Commitments

- **Nombre:** Sumly
- **Tagline:** "Tus finanzas en equilibrio"
- **Personalidad:** Profesional, confiable, minimalista. Estética developer-first con acentos de color medidos.
- **Idioma:** Español colombiano como prioridad. Inglés no descartado a futuro.
- **Modelo:** Gratuito en su fase inicial. Código abierto al inicio, con posibilidad de cerrar si escala.
- **Propósito del creador:** Primer producto de un portafolio personal para publicar en LinkedIn. Serie de productos planeados.

## Evidence on Hand

- Código fuente del frontend y backend en este monorepo (`apps/frontend`, `apps/backend`)
- DESIGN.md con sistema de diseño documentado (`apps/frontend/DESIGN.md`)
- Historias de usuario en español (`apps/frontend/docs/historias-usuario-finanzas-personales.md`)
- Logo y favicon en `apps/frontend/public/`
- No hay testimonios reales, estudios de caso ni prensa. No inventar.

## Product Principles

1. **Sin fricción de registro.** Si registrar un movimiento toma más de 5 segundos, el producto falla. Voz, IA por correo, y atajos deben reducir la barrera de entrada.
2. **Control manual, asistido por máquina.** El usuario siempre tiene la última palabra. La IA sugiere, no decide. Nada se registra sin visibilidad del usuario.
3. **Confianza visual.** Una interfaz que transmite solidez y precisión. Sin decoración innecesaria. Los números son sagrados y se muestran con claridad absoluta.
4. **Local primero, global después.** COP, fechas colombianas, español local. La experiencia debe sentirse nativa para el usuario colombiano antes de pensar en otros mercados.
5. **Social cuando suma, no cuando distrae.** Las funciones colaborativas (amigos, división de cuentas) deben resolverse en el momento exacto en que ocurren, sin convertir la app en una red social.

## Accessibility & Inclusion

- PWA accesible desde cualquier dispositivo con navegador moderno
- Soporte de tema oscuro para reducir fatiga visual
- Tamaños de texto y contraste adecuados (WCAG AA como objetivo)
- Interfaz en español colombiano como inclusión cultural
- Sin dependencia de hardware específico ni sistemas operativos propietarios
