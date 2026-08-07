# Numi AI — Landing

Landing page de conversión de Numi AI, agencia colombiana de automatización con
inteligencia artificial para pymes.

## Stack

Next.js 16 (App Router) · TypeScript strict · Tailwind CSS v4 · Motion ·
next-intl · react-hook-form + zod · Radix UI · lucide-react · Geist (next/font).
Destino: Vercel.

## Comandos

```bash
npm run dev        # desarrollo (regenera en.json antes de arrancar)
npm run build      # build de producción
npm run start      # servidor de producción
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm run i18n:en    # regenera messages/en.json desde es.json
```

## Estructura

```
messages/            es.json (fuente de verdad del copy) + en.json generado
public/images/       assets optimizados a WebP + og:image en JPG
src/app/[locale]/    layout + page (única ruta de la landing)
src/app/api/contact/ Route Handler de leads
src/components/
  brand/             marca (chispa) como SVG
  forms/             LeadForm + Field accesible
  layout/            Header, Footer, Section
  motion/            Reveal, PulseBadge, chispa del Hero
  sections/          una por sección de la landing
  seo/               JSON-LD
  ui/                primitivas estilo shadcn (Button, Accordion)
src/i18n/            routing, request, navigation
src/lib/             schemas zod, tokens de sitio, utils
```

## Internacionalización

`localePrefix: 'always'` — `/` redirige a `/es`. El copy en inglés **no está
validado todavía**: `messages/en.json` se genera automáticamente desde `es.json`
prefijando `[PENDING EN TRANSLATION]` a cada valor. No edites `en.json` a mano;
cuando llegue la traducción real, reemplaza el archivo y elimina el paso
`predev`/`prebuild` correspondiente.

## Variables de entorno

Copia `.env.example` a `.env.local`. Ninguna es secreta hoy; `NEXT_PUBLIC_SITE_URL`
es obligatoria en producción para que `canonical`, `og:url`, `sitemap.xml` y el
JSON-LD apunten al dominio correcto.

## Formularios

Ambos formularios postean a `POST /api/contact`. La validación zod corre en el
cliente (UX) y **de nuevo en el servidor** (frontera de confianza). Hoy el
handler solo registra un log estructurado sin datos personales y responde 201 —
**antes de publicar hay que conectar el canal de entrega real** (Resend, n8n o
CRM); el punto exacto está marcado con un `TODO` en
`src/app/api/contact/route.ts`.

## Notas de marca

- Paleta activa: **Naranja Ignición**. El documento estratégico interno todavía
  tiene "Índigo Impacto" marcada como elegida en una versión anterior —
  confirmar con el equipo antes de publicar.
- Prohibido por definición de marca: partículas, redes neuronales, mascotas,
  glassmorphism, glow/blur pesado, gradientes azul/morado, 3D y contadores
  animados de estadísticas.
- La única cifra del sitio es `+40%`, estática, junto al testimonio de Casas y
  Espacios Inmobiliaria. No agregar prueba social sin respaldo real.
- Los PNG originales sin comprimir viven en `assets/`; `public/images/` contiene
  las versiones optimizadas que realmente sirve el sitio.
