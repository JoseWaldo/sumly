---
name: crear-pr
description: Automatiza la creación de un Pull Request en GitHub de principio a fin — lee los cambios aplicados contra la rama base, crea una rama nueva con nombre convencional (tipo/descripcion-corta), commitea los cambios en Conventional Commits en español, hace push y crea el PR con "gh pr create" usando una estructura estándar. Úsala siempre que el usuario pida "crea un PR", "abre un pull request", "sube estos cambios", "haz commit y PR", o cualquier variante donde quiera pasar de cambios locales a un PR listo para revisión, incluso si no lo pide con esas palabras exactas.
---

# Crear PR

Skill para llevar cambios locales en un repositorio Git hasta un Pull Request en GitHub, siguiendo siempre el mismo flujo de 4 pasos. Usa la CLI `gh` (GitHub) para todo lo relacionado con el PR.

## Requisitos previos

Antes de empezar, verifica silenciosamente (sin pedir permiso al usuario para esto):

```bash
git rev-parse --is-inside-work-tree   # confirma que estamos en un repo git
gh auth status                        # confirma que gh está autenticado
```

Si `gh` no está disponible o no está autenticado, dilo y detente ahí — no se puede crear el PR sin eso.

## Paso 1 — Leer los cambios aplicados contra la rama de origen

1. Detecta la rama base de la que se partió (la rama desde la que se hizo checkout originalmente):
   ```bash
   git rev-parse --abbrev-ref HEAD                     # rama actual
   git merge-base --fork-point <rama-base-candidata> HEAD   # o usa:
   git log --oneline HEAD --not --remotes=origin       # commits no subidos
   ```
   Si no es evidente cuál es la rama base, asume la rama por defecto del remoto:
   ```bash
   git symbolic-ref refs/remotes/origin/HEAD --short
   ```
2. Revisa el estado y el diff completo:
   ```bash
   git status
   git diff <rama-base>...HEAD     # cambios ya commiteados
   git diff                        # cambios sin commitear (working tree)
   git diff --staged               # cambios en stage
   ```
3. Con esto arma un resumen mental de: qué archivos cambiaron, qué tipo de cambio es (funcionalidad nueva, corrección de bug, refactor, docs, tests, config), y por qué (basado en el contexto de la conversación).

No sigas al paso 2 sin haber leído el diff real — nunca asumas el contenido de los cambios.

## Paso 2 — Crear la rama en base al contexto

Convención de nombres: **`tipo/descripcion-corta`**, todo en minúsculas, palabras separadas por guiones, sin tildes ni espacios.

Tipos válidos (elige el que mejor describa el cambio dominante):
`feature`, `fix`, `hotfix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`

Ejemplos: `feature/login-social`, `fix/validacion-formulario-pago`, `refactor/servicio-notificaciones`

Reglas:

- Si el usuario ya está en una rama de feature creada para este trabajo (no en `main`/`master`/`develop`), **no crees una rama nueva** — usa la actual.
- Si el usuario está en la rama base (main/master/develop) con cambios pendientes, crea la rama nueva antes de commitear:
  ```bash
  git checkout -b tipo/descripcion-corta
  ```
- La descripción corta debe salir del contenido real del diff, no de una interpretación genérica. 3-5 palabras máximo.
- Si el usuario ya indicó un nombre de rama explícito, respétalo tal cual (solo ajusta formato si viola las reglas básicas: minúsculas, guiones).

## Paso 3 — Commitear con Conventional Commits en español

Formato de cada commit:

```
<tipo>(<alcance opcional>): <descripción corta en español, imperativo, sin punto final>

<cuerpo opcional explicando el "qué" y el "por qué", en español>
```

Tipos (se mantienen en inglés por convención, es lo estándar de la industria):
`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `build`, `ci`, `revert`

Reglas:

- **Agrupa lógicamente**: si el diff mezcla cosas no relacionadas (ej. un fix y una nueva feature), haz commits separados en vez de uno solo gigante. Usa `git add -p` o rutas específicas para separar el stage.
- Descripción corta en modo imperativo: "agrega validación de email", no "agregado" ni "agregando".
- Si el cambio es grande, añade cuerpo explicando el motivo, no solo el qué (eso ya se ve en el diff).
- Nunca inventes contexto que no esté en el código o en lo que dijo el usuario.
- Ejemplo:
  ```
  feat(auth): agrega inicio de sesión con Google

  Se integra OAuth2 con Google para permitir login social,
  reduciendo fricción en el registro de nuevos usuarios.
  ```

Ejecuta:

```bash
git add <archivos del grupo lógico>
git commit -m "tipo(alcance): descripción corta" -m "cuerpo opcional"
```

Repite por cada grupo lógico de cambios.

## Paso 4 — Push y creación del PR

1. Antes de crear el PR, **pregunta al usuario la rama destino** si no la mencionó (ej. `main`, `develop`, `staging`). No asumas — distintos equipos tienen distintos flujos de ramas. Si ya la mencionó en la conversación, úsala directamente sin volver a preguntar.
2. Sube la rama:
   ```bash
   git push -u origin tipo/descripcion-corta
   ```
3. Crea el PR con `gh pr create`, usando la estructura de `assets/pr_template.md` como cuerpo. Título en el mismo formato que el commit principal (tipo: descripción corta), o si hay varios commits de tipos distintos, usa el tipo/alcance que mejor resuma el conjunto.

   ```bash
   gh pr create \
     --base <rama-destino> \
     --head tipo/descripcion-corta \
     --title "tipo: descripción corta del cambio" \
     --body-file assets/pr_template.md
   ```

   Antes de usar `--body-file`, copia `assets/pr_template.md` a un archivo temporal y **rellena las secciones con el contenido real** (descripción, cambios, motivo, cómo probar) basado en lo que leíste en el Paso 1 — no dejes los placeholders sin completar ni el checklist sin marcar lo que ya verificaste.

4. Al terminar, comparte con el usuario el link del PR que devuelve `gh pr create` en stdout.

## Estructura estándar del PR

La plantilla vive en `assets/pr_template.md` y siempre lleva estas secciones, en este orden:

1. **Descripción** — resumen de 2-4 líneas
2. **Cambios realizados** — lista de bullets, uno por cambio lógico (debe alinear con los commits del Paso 3)
3. **Motivo / Contexto** — por qué se hizo, y referencia al issue/ticket si el usuario lo mencionó (`Closes #123`)
4. **Cómo probar** — pasos numerados y reproducibles
5. **Checklist** — estándares de código, pruebas, documentación, verificación local
6. **Capturas de pantalla** — solo si hay cambios visuales; si no aplica, omite la sección completa en vez de dejarla vacía

## Errores comunes a evitar

- No crear una rama nueva si ya se está trabajando en una rama de feature — evita ramas anidadas innecesarias.
- No mezclar cambios no relacionados en un solo commit.
- No crear el PR sin preguntar la rama destino cuando no es obvia.
- No dejar placeholders del template sin rellenar en el PR final.
- No inventar el "por qué" de un cambio si no hay contexto suficiente — en ese caso, pregúntale brevemente al usuario en vez de rellenar con suposiciones.
