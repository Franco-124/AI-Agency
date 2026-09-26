@AGENTS.md

# Design system — reglas obligatorias (Stitch "Rediseño Web Numinet")

El home (`/[locale]`) NO es React: `src/app/[locale]/route.ts` sirve HTML crudo
verbatim desde `src/app/[locale]/stitch-home.ts` (AUTO-GENERADO, minificado,
NUNCA editar a mano). La fuente de verdad del markup es
`design/stitch/code.html`, transformado por `scripts/build-stitch-home.mjs`
(`node scripts/build-stitch-home.mjs` regenera `stitch-home.ts`).

**Flujo obligatorio para cualquier cambio de contenido/estilo del home:**
1. Editar `design/stitch/code.html`.
2. Si el cambio toca texto traducible, agregar/editar la clave en
   `scripts/stitch-en.json` (inglés) — el build falla si un `swap()` no
   encuentra su texto o si sobran traducciones sin usar.
3. Correr `node scripts/build-stitch-home.mjs` para regenerar
   `stitch-home.ts`.
4. Nunca tocar `stitch-home.ts` directamente.

El resto del sitio (layout, agendar, emails) sigue siendo React/Tailwind y
consume los mismos tokens de `src/app/globals.css` — cualquier componente
React nuevo debe alinearse a las mismas reglas de abajo.

## Paleta — violeta-negro, un solo color cromático

- Fondo base `#12081F` (`--color-neutro-oscuro`), panel `#1a0f2c`
  (`--color-primario`), superficie `#201338` (`--color-secundario`), inset
  `#281745` (`--surface-inset`).
- Acento único `#8b5cf6` (`--color-acento`), con `-lift` `#b39cfb` (texto
  sobre fondo oscuro, contraste 4.5:1) y `-deep` `#5b21b6` (fills/sombras).
  NUNCA usar violeta saturado tipo `#9333ea` puro ni introducir un segundo
  color cromático (todo neutro se mezcla del mismo violeta vía `color-mix`).
- Texto: `--text-primary` (claro), `--text-secondary`/`--text-muted` via
  `color-mix(in srgb, var(--color-neutro-claro) N%, transparent)`.
- Prohibido pegar hex sueltos en componentes nuevos — usar siempre las
  variables de `globals.css` / clases de Tailwind del `tailwind.config`
  embebido en `code.html`.

## Tipografía

- Display/headline/cifras: **Plus Jakarta Sans** (`--font-hero-display` /
  `--font-display`) — usar solo en `.type-display`, `.type-section-title`,
  `.type-figure`. Nunca en body copy.
- Body/UI: **Inter** (`--font-body-face`).
- Cifras que cuentan o se animan: `font-variant-numeric: tabular-nums`
  siempre, para que no reflowen al cambiar dígitos.
- Eyebrows: `.type-eyebrow` — 12px, uppercase, tracking 0.11em (no más,
  0.16em+ deja de leerse como palabras).

## Componentes visuales reutilizables (nunca reinventar)

- `.liquid-glass-surface` (design/stitch) / `.glass-surface` (globals.css) —
  vidrio: gradiente diagonal 145°, borde blanco translúcido, sombra
  interior+exterior en capas, hover `translateY(-3px/-4px)` + borde acento.
  Evitar apilar muchas instancias con `backdrop-filter` real simultáneo
  (verificado: congela el compositor) — usar la variante sin blur
  (`.surface-panel`, `.glass-surface` de globals.css) cuando haya varias en
  pantalla a la vez.
- Botones: `.btn-volume`/`.btn-hero-primary` (primario) y
  `.btn-surface`/`.btn-hero-secondary` (secundario) — SIEMPRE
  `rounded-full`, gradiente vidrio, hover = lift + scale 1.02, active =
  scale-down. No crear una tercera variante de botón.
- Paneles/tarjetas: `.surface-panel`, `.surface-card`,
  `.surface-card-featured` (tier destacado = regla izquierda 2px en acento,
  no glow ni borde completo).
- Radios: `rounded-2xl` en tarjetas/paneles, `rounded-full` en botones y
  pills. Nunca radios chicos (2–8px) — ese registro fue revertido
  explícitamente por el product owner.
- Sombras: usar `--shadow-low/mid/high` (siempre dos capas: contacto +
  ambiente) y `--shadow-accent` solo para el CTA primario.

## Animaciones / motion

- Orbes de fondo: `blur(120–140px)`, loop 16–20s, solo `translate`+`scale`
  (`heroFloatOrbA/B`, `floatOrb1/2`). No agregar más de 2 por sección.
- Entradas al hacer scroll: atributo `[data-reveal]` (pending → opacity 0 +
  translateY(12px); visible = transición 320ms `--ease-entrance`
  `cubic-bezier(0.22,0.61,0.36,1)`). `will-change` solo vía `data-near`, no
  poner en todos los elementos a la vez (medido: congela scroll).
- Hero: anima solo con CSS (`.hero-rise`, `.rule-grow`), nunca JS — está
  above-the-fold, no hay nada que observar.
- Timeline/proceso: atributo `[data-rail]`, nodos y fill vía
  `transition-delay`, sin JS por frame.
- Acordeón (FAQ): Radix + `--radix-accordion-content-height`, entra con
  fade+grow, sale más rápido que entra.
- Grain: `.grain` (soft-light, puntual) y `.page-grain` (fixed, sin blend
  mode — el blend mode fixed+soft-light fue medido y descartado por costo
  de repintado en cada frame de scroll).
- TODO motion debe respetar `prefers-reduced-motion: reduce` (ya cubierto
  globalmente en `globals.css`, no duplicar overrides locales salvo casos
  con loop infinito que deban detenerse en su último frame en vez de
  colapsar a 0.01ms).

## Ritmo y layout

- Padding de sección: 3 roles con `clamp()` — `--space-section-tight`,
  `--space-section`, `--space-section-wide`. No usar un valor de padding
  suelto nuevo.
- Medidas de contenido: `--measure-page: 78rem`, `--measure-prose: 44rem`.
- `.section-index` — numeral de 2 dígitos antes de cada título de sección
  (`aria-hidden`), mantiene la secuencia editorial en toda página nueva.
- Tipografía fluida en dos rampas (móvil / `>= 48rem`) vía `clamp()` —
  seguir el mismo patrón de `.type-display` / `.type-section-title` para
  cualquier título nuevo, no un tamaño fijo.

## Regla general

Cualquier sección, componente o página nueva debe reusar las clases y
variables de arriba tal cual existen — no crear paleta, radios, sombras,
easing ni variantes de botón/tarjeta nuevas sin que el usuario lo pida
explícitamente. Si hace falta un ajuste, se ajusta el token/clase compartida
en `globals.css` (o `design/stitch/code.html` para el home), no se parchea
localmente en un componente.
