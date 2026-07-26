---
name: workflow
description: |
  Flujo de trabajo completo para implementar cambios en el proyecto Sumly. Usa esta skill cuando el usuario pida implementar una funcionalidad, corregir un bug, refactorizar, o cualquier tarea de desarrollo que requiera modificar el codigo. Cubre: planificacion, critica del plan (grilling), creacion de rama, ejecucion, verificacion de tipos y build, y creacion de PR a dev. NO usar para tareas simples como responder preguntas, buscar informacion o cambios triviales en documentacion.
---

# Workflow de Desarrollo

Skill orquestadora que guia todo el ciclo de vida de un cambio de codigo: desde la idea hasta el PR listo en GitHub.

## Reglas de oro

- **Nunca saltees fases.** Cada fase debe completarse antes de pasar a la siguiente.
- **Si una verificacion falla**, corregi el error y volve a ejecutar esa verificacion. No avances con errores.
- **Rama destino siempre `dev`** a menos que el usuario diga explicitamente otra cosa.
- **No commitees hasta la fase final** (PR). Acumula los cambios en el working tree y stagealos al final, justo antes del PR, para poder iterar libremente durante la ejecucion.

---

## Fase 1 — Planificacion

1. **Lee el contexto** del proyecto:
   - Lee `CONTEXT.md` para entender alcance y estado de funcionalidades.
   - Explora el codigo relevante al cambio pedido: esquema de BD, rutas, servicios, componentes afectados.
   - Identifica archivos que habra que crear, modificar o eliminar.

2. **Escribi un plan detallado** con esta estructura:

   ```
   ## Plan: <titulo corto>

   ### Objetivo
   <1-2 lineas describiendo que se va a lograr>

   ### Alcance
   - <lista de entregables concretos>
   - <lo que NO se va a hacer en este cambio>

   ### Archivos a modificar
   - `ruta/archivo.ts` — <que cambio y por que>

   ### Archivos a crear
   - `ruta/nuevo-archivo.ts` — <proposito>

   ### Documentacion a actualizar
   - `CONTEXT.md` — <que seccion/cambio>
   - `AGENTS.md` — <que seccion/cambio> (o "No requiere cambios")

   ### Orden de ejecucion
   1. <primer paso>
   2. <segundo paso>
   ...

   ### Riesgos / Puntos de atencion
   - <posible problema> — <mitigacion>
   ```

3. **Presenta el plan al usuario** y decile que vamos a la fase de critica. No empieces a implementar todavia.

---

## Fase 2 — Critica del plan (Grill Me)

1. **Invoca la skill `grill-me`** con la herramienta `skill`:
   ```
   skill name="grill-me"
   ```

2. La skill de grilling hara preguntas una por una. El usuario debe responder cada una.

3. **Resultado de la critica:**
   - Si el usuario confirma que el plan es solido y estamos alineados, pasa a la Fase 3.
   - Si surgen cambios en el plan durante el grilling, **actualiza el plan** y volve a presentarlo antes de avanzar. No pases a la Fase 3 sin confirmacion explicita del usuario.

---

## Fase 3 — Crear rama

1. **Verifica el estado del repo**:
   ```bash
   git status
   git branch --show-current
   ```

2. **Crea una rama nueva desde `dev`** usando la convencion de nombres:
   - Formato: `tipo/descripcion-corta` (minusculas, guiones, sin tildes)
   - Tipos: `feature`, `fix`, `hotfix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`
   - La descripcion corta sale del plan aprobado, 3-5 palabras maximo.
   - Ejemplos: `feature/deudas-gestion`, `fix/categoria-duplicada`, `refactor/servicio-email`

   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b tipo/descripcion-corta
   ```

3. **Confirma la rama creada** y mostrala al usuario antes de seguir.

---

## Fase 4 — Ejecucion

1. **Implementa los cambios** siguiendo el plan aprobado, en el orden definido.

2. **Reglas durante la ejecucion:**
   - Respeta las convenciones del proyecto (estilo de codigo, imports, estructura de archivos).
   - Si el cambio toca el schema de Prisma, carga la skill `prisma-schema`.
   - No commitees nada todavia — acumula los cambios en el working tree.
   - Si encontras un obstaculo no previsto en el plan, informalo al usuario y propon ajustes.

3. **Actualizar documentacion** al terminar la implementacion:
   - Revisa si el cambio afecta a `CONTEXT.md`: nuevas historias de usuario, cambios en stack tecnologico, nuevas rutas API, o cambio de estado de funcionalidades existentes. Si algo cambio, actualizalo.
   - Revisa si el cambio afecta a `AGENTS.md`: nuevas convenciones, patrones de arquitectura, checklists, o estandares que los agentes deban seguir en el futuro.
   - Si no hay nada que actualizar, indicarlo explicitamente ("Documentacion no requiere cambios").

4. **Al terminar**, hace un resumen de lo implementado y confirma que coincide con el plan aprobado.

---

## Fase 5 — Verificacion de tipos y build

Ejecuta estos comandos desde la raiz del monorepo en orden. Si alguno falla, **corregi los errores y volve a ejecutar** ese mismo comando hasta que pase.

### 5.1 — Type checking del backend

```bash
bun run lint
```

Esto ejecuta `turbo lint`, que en el backend corre `tsc --noEmit` y en el frontend `oxlint`.

### 5.2 — Type checking individual (si es necesario)

Si `turbo lint` no atrapa todo o queres ser mas exhaustivo, ejecuta por separado:

```bash
cd apps/backend; bun run lint       # tsc --noEmit
cd apps/frontend; bun run lint      # oxlint
```

### 5.3 — Build

```bash
bun run build
```

Esto ejecuta `turbo build`, que compila ambos proyectos. El build del frontend ademas genera la ruta de TanStack Router (`tsc -b && vite build`).

**Si el build falla**, lee los errores, corregilos en el codigo, y volve a correr `bun run build` hasta que pase limpio. No pases a la Fase 6 con errores.

---

## Fase 6 — Pull Request a DEV

1. **Invoca la skill `crear-pr`** con la herramienta `skill`:
   ```
   skill name="crear-pr"
   ```

2. La skill `crear-pr` se encargara de:
   - Leer los cambios aplicados
   - Commitear en Conventional Commits en espanol
   - Hacer push de la rama
   - Crear el PR contra `dev`
   - Devolver el link del PR

3. **Rama destino**: `dev` (a menos que el usuario indique otra en la Fase 1).

4. Al finalizar, comparti el link del PR con el usuario y hace un resumen de todo el proceso.

---

## Diagrama de flujo

```
Fase 1: Planificacion
    │
    ▼
Fase 2: Critica (grill-me) ◄─── [ajustar plan si es necesario]
    │
    ▼ [plan aprobado]
Fase 3: Crear rama (tipo/descripcion)
    │
    ▼
Fase 4: Ejecucion + Actualizar docs
     │
     ▼
Fase 5: Type check + Build ◄─── [corregir errores si falla]
    │
    ▼ [todo verde]
Fase 6: PR a DEV (crear-pr)
    │
    ▼
   LISTO
```

---

## Notas

- Esta skill esta disenada para el monorepo Sumly (Bun + Turbo). Los comandos de verificacion asumen esta estructura.
- Para cambios que solo afectan documentacion o assets (sin logica), podes saltear la Fase 5 si el usuario lo autoriza.
- Si el usuario ya esta en una rama de feature creada especificamente para este cambio, no crees una nueva rama en la Fase 3 — usa la actual.
