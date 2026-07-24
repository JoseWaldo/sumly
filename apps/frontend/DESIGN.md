# Sistema de Diseño — Sumly

Sistema de diseño propio inspirado en la filosofía visual de Supabase (fondo oscuro, alto contraste, estética developer-first, separación por bordes) con una paleta azul de marca conservadora y profesional.

---

## 1. Paleta de color

Los tokens de color son variables CSS definidas en `globals.css` con doble tema (light/dark). Se usa el sistema de tokens semánticos de Tailwind v4.

### Tema claro

| Token CSS | HSL | Uso |
|---|---|---|
| `--background` | `hsl(217 100% 97%)` | Fondo principal de página |
| `--foreground` | `hsl(217 100% 22%)` | Texto principal |
| `--card` | `hsl(0 0% 100%)` | Tarjetas, paneles |
| `--card-foreground` | `hsl(217 100% 22%)` | Texto en tarjetas |
| `--primary` | `hsl(214 82% 41%)` | Acento de marca: CTAs, links activos |
| `--primary-foreground` | `hsl(0 0% 100%)` | Texto sobre acento |
| `--secondary` | `hsl(217 80% 94%)` | Fondo secundario |
| `--secondary-foreground` | `hsl(217 100% 22%)` | Texto sobre secundario |
| `--muted` | `hsl(217 40% 93%)` | Fondo atenuado |
| `--muted-foreground` | `hsl(216 21% 41%)` | Texto secundario, descripciones |
| `--accent` | `hsl(217 80% 94%)` | Fondo de acento (hover) |
| `--accent-foreground` | `hsl(217 100% 22%)` | Texto sobre acento |
| `--border` | `hsl(217 30% 88%)` | Líneas divisorias, bordes |
| `--input` | `hsl(217 30% 88%)` | Bordes de inputs |
| `--ring` | `hsl(217 100% 50%)` | Anillos de focus, glow |
| `--destructive` | `hsl(0 85% 64%)` | Estados de error/destrucción |

### Tema oscuro

| Token CSS | HSL | Uso |
|---|---|---|
| `--background` | `hsl(217 50% 6%)` | Fondo principal (casi negro con temperatura azul) |
| `--foreground` | `hsl(217 30% 90%)` | Texto principal |
| `--card` | `hsl(217 40% 10%)` | Tarjetas, superficie elevada |
| `--card-foreground` | `hsl(217 30% 90%)` | Texto en tarjetas |
| `--primary` | `hsl(217 100% 50%)` | Acento de marca: CTAs, glow del hero |
| `--primary-foreground` | `hsl(217 30% 98%)` | Texto sobre acento |
| `--secondary` | `hsl(217 30% 16%)` | Fondo secundario |
| `--muted-foreground` | `hsl(217 15% 55%)` | Metadatos, labels secundarias |
| `--border` | `hsl(217 25% 18%)` | Líneas divisorias, bordes de tarjetas |
| `--sidebar` | `hsl(217 40% 8%)` | Fondo del sidebar |
| `--sidebar-foreground` | `hsl(217 25% 85%)` | Texto del sidebar |

**Filosofía de color:** el azul (`--primary`) se usa con moderación — como un "glow" puntual (headline, botón primario, bordes activos), nunca como relleno de grandes superficies. El fondo oscuro se mantiene casi negro para que el azul brille por contraste. La separación entre superficies se logra con bordes (`border`), no con sombras.

---

## 2. Tipografía

Una sola familia sans para todo el texto, con restricción deliberada de pesos: la jerarquía se construye con tamaño y tracking, no con negritas.

| Rol | Fuente | Tamaño | Peso | Line-height | Dónde se usa |
|---|---|---|---|---|---|
| Hero display | Hanken Grotesk | 56-72px | 400 (Regular) | 1.0 | Titular principal del hero |
| Section heading | Hanken Grotesk | 28-36px | 400 | 1.2 | Encabezados de sección (`<h2>`) |
| Subheading | Hanken Grotesk | 20-24px | 400 | 1.3 | Títulos de tarjetas, subtítulos |
| Body default | Hanken Grotesk | 16px | 400 | 1.5 | Texto de párrafo estándar |
| Body medium | Hanken Grotesk | 14px | 400 | 1.4 | Texto secundario, descripciones |
| Label medium | Hanken Grotesk | 14px | **500 (Medium)** | 1.4 | Links de navegación, texto de botones |
| Label small | Hanken Grotesk | 12px | 400 | 1.3 | Badges, metadatos, captions |

**Reglas de peso:**
- El **400 (Regular)** domina el 90% del contenido.
- El **500 (Medium)** se reserva exclusivamente para elementos interactivos (botones, links del menú).
- **No se usa 700 (Bold)** en ningún punto.

---

## 3. Layout y estructura

- **Espaciado entre secciones:** 90–128px (`py-28` a `py-32` en Tailwind), para un ritmo donde cada sección se siente como una escena aislada.
- **Espaciado interno:** denso (16–24px, `p-4` a `p-6`) dentro de cada sección, generando bloques de información concentrados.
- **Separación por borde, no por sombra:** usar `border` para delimitar tarjetas y paneles en vez de `box-shadow`.
- **Grid tipo "bento"** para secciones de features: tarjetas de tamaños desiguales con bordes de acento sutil.
- **Breakpoint principal:** 600px (`sm:`), priorizando mobile-first.

---

## 4. Elemento de firma (signature)

El **glow azul del hero**: el titular principal se renderiza en `text-primary`, pero una palabra o frase clave se resalta con `text-primary` y un `text-shadow` sutil en dark mode, simulando el efecto de una terminal iluminada. Este mismo glow reaparece de forma contenida en el borde superior de las tarjetas activas y en el CTA principal.

---

## 5. Notas de uso rápido

- CTA primario → fondo `bg-primary`, texto `text-primary-foreground`, peso 500.
- CTA secundario (ghost/outline) → borde `border-border`, texto `text-muted-foreground`, hover a `text-primary`.
- Links de navegación → `text-muted-foreground` en reposo, `text-foreground` + underline en hover.
- Tarjetas → `border border-border/30 bg-card` sin `shadow`.
- Inputs → `border border-input/50 bg-transparent`, focus con `ring-1 ring-ring`.

---

## 6. Sidebar

El sidebar es colapsable con dos estados en desktop: expandido (`w-60`) y colapsado (`w-16`, solo iconos). En mobile es un drawer/overlay que se despliega a ancho completo.

### Estructura de navegación

Los 8 items se organizan en 3 grupos lógicos separados por encabezados de sección. Perfil queda al final con un divider (`border-t`) que lo separa visualmente del resto.

```
Panel                              (sin grupo, siempre primero)
──────────────────────────────────
Movimientos
  Ingresos
  Gastos
  Suscripciones
──────────────────────────────────
Configuración
  Entidades financieras
  Formas de pago
  Categorías
──────────────────────────────────
Perfil                            (sin grupo, con divider superior)
```

### Comportamiento responsive

| Estado | Mobile (`<md`) | Desktop (`md:`) |
|---|---|---|
| Sidebar cerrado | Oculto (`-translate-x-full`) | Colapsado (`w-16`, solo iconos) |
| Sidebar abierto | Overlay (`translate-x-0`, `w-60`) con backdrop `bg-black/50` | Expandido (`w-60`, inline, empuja el contenido) |
| Toggle | Botón hamburguesa (`Menu`) en el header | Botón flotante en el borde derecho del sidebar |

### Tokens de sidebar

| Token | Uso |
|---|---|
| `--sidebar` (`bg-sidebar`) | Fondo del sidebar |
| `--sidebar-foreground` (`text-sidebar-foreground`) | Texto de items inactivos |
| `--sidebar-primary` (`bg-sidebar-primary`) | Fondo del item activo |
| `--sidebar-primary-foreground` (`text-sidebar-primary-foreground`) | Texto del item activo |
| `--sidebar-accent` (`bg-sidebar-accent`) | Fondo hover de items |
| `--sidebar-accent-foreground` (`text-sidebar-accent-foreground`) | Texto hover de items |

### Encabezados de grupo

- Tipografía: 11px, peso 600, uppercase, tracking-wider
- Color: `text-muted-foreground`
- Espaciado: `pt-4 pb-1 px-3`
- Solo visibles cuando el sidebar está expandido

### Sección inferior

Avatar circular con inicial del usuario + nombre (truncado). Botón de logout con `LogOut` icon. Todo centrado cuando el sidebar está colapsado.

---

## 7. Tooltips

Componente propio (`src/components/ui/tooltip.tsx`) sin dependencias externas. Se usa para mostrar el label de cada item del sidebar cuando está colapsado (solo iconos visibles).

### Comportamiento

| Atributo | Valor |
|---|---|
| Activación | Hover + focus (accesible por teclado) |
| Delay de entrada | 200ms |
| Transición | `opacity` + `translate-x` en 200ms (`transition-all duration-200`) |
| Posición | Derecha del trigger (`left-full top-1/2 -translate-y-1/2 ml-2`) |
| Z-index | `z-50` |
| Interactividad | `pointer-events-none` (no bloquea clicks) |

### Estilo

- Fondo invertido: `bg-foreground text-background` (contraste máximo)
- Borde: `border border-border/50`
- Tipografía: 12px (`text-xs`), peso 400, sin salto de línea (`whitespace-nowrap`)
- Padding: `px-2.5 py-1.5`
- Radio: `rounded-md`
- Sombra sutil: `shadow-sm`

### Uso

```tsx
<Tooltip content="Panel">
  <Link to="/dashboard">
    <LayoutDashboard className="h-5 w-5" />
  </Link>
</Tooltip>
```

Envolver cualquier elemento interactivo cuyo significado no sea obvio sin texto. El tooltip siempre se renderiza pero solo aparece al hacer hover; en mobile el sidebar siempre está expandido al abrirse, por lo que los tooltips no interfieren.
