# Numi AI — Sitio web

Sitio de Numi AI, agencia colombiana de automatización con inteligencia
artificial para pymes. Incluye la landing (español e inglés), la página para
agendar llamadas y la política de privacidad.

## Stack

Next.js 16 (App Router) · TypeScript strict · next-intl · Tailwind CSS v4
(páginas en React) · Tailwind CSS v3 compilado (landing de Stitch) · zod ·
Supabase · Resend. Destino: Vercel.

## Comandos

```bash
npm run dev          # desarrollo en http://localhost:3000
npm run build        # build de producción
npm run start        # servidor de producción
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run i18n:check   # verifica que messages/es.json y en.json tengan las mismas claves

node scripts/build-stitch-home.mjs   # regenera la landing desde el diseño de Stitch
```

## Rutas

| Ruta                     | Qué es                                                        |
| ------------------------ | ------------------------------------------------------------- |
| `/` → `/es`              | Redirige al idioma por defecto (español)                      |
| `/es`, `/en`             | Landing (diseño de Stitch servido como HTML)                  |
| `/es/agendar`            | Calendario para agendar la llamada                            |
| `/es/privacidad`         | Política de privacidad                                        |
| `POST /api/contact`      | Recibe leads del formulario de la landing                     |
| `/api/booking/*`         | Disponibilidad y reserva contra el servicio de calendario     |

## La landing (Stitch)

La página de inicio es el diseño **"Rediseño Web Numinet"** de Google Stitch,
servido tal cual para que se vea exactamente igual al diseño.

```
design/stitch/code.html                    diseño original exportado de Stitch (fuente)
scripts/build-stitch-home.mjs              genera la landing a partir del diseño
scripts/stitch-en.json                     traducciones español → inglés
src/app/[locale]/stitch-home.ts            HTML generado (no editar a mano)
src/app/[locale]/route.ts                  sirve el HTML según el idioma
public/images/stitch/                      logos descargados del diseño
```

`build-stitch-home.mjs` hace todo en un paso:

1. Lee `code.html` y conecta los enlaces reales (ES/EN, privacidad).
2. Cambia textos puntuales (por ejemplo, llamadas sin duración fija) y deja el
   año del footer como `__YEAR__`, que la ruta reemplaza por el año actual.
3. Conecta el formulario: envía a `/api/contact`, guarda los datos en
   `sessionStorage` y lleva al visitante a `/agendar#reserva` con todo
   prellenado.
4. Descarga los logos a `public/images/stitch/` en WebP.
5. Pide a Google Fonts solo los íconos de Material Symbols que usa la página.
6. Compila Tailwind v3 (paquete `tailwindcss3`) con la configuración del
   diseño y lo incrusta en la página; no se usa el CDN de Tailwind.
7. Genera la versión en inglés con `stitch-en.json`.

### Cómo cambiar la landing

- **Nuevo diseño en Stitch:** reemplaza `code.html` y corre el script.
- **Cambiar un texto:** agrega un `swap(...)` en el script (y la traducción
  correspondiente en `stitch-en.json`), luego corre el script.
- **Traducciones:** cada clave de `stitch-en.json` es el texto exacto en
  español. El script avisa si alguna traducción no se usó.

Siempre corre `node scripts/build-stitch-home.mjs` después de cualquier cambio
y revisa `/es` y `/en`.

## Agendar llamada

1. El visitante llena el formulario de la landing.
2. `POST /api/contact` valida con zod (`src/lib/schemas.ts`), aplica rate limit
   y guarda el lead.
3. El navegador pasa a `/[locale]/agendar#reserva`, donde
   `BookingPageClient` lee los datos guardados y muestra el calendario.
4. `/api/booking/availability` y `/api/booking/book` hablan con el servicio
   de calendario (`CALENDAR_API_BASE_URL`) y se envía el correo de
   confirmación.

## Estructura

```
messages/                 textos de las páginas en React (es.json / en.json)
public/images/            imágenes del sitio
scripts/                  generador de la landing y utilidades
src/app/[locale]/         landing (route.ts), agendar/, privacidad/, layout
src/app/api/              contacto y reservas
src/components/
  brand/                  logo y marcas
  forms/                  calendario de reservas y campos
  layout/                 Header, Footer, selector de idioma
  ui/                     Button
src/emails/               plantillas de correo (React Email)
src/i18n/                 routing, request, navigation
src/lib/                  schemas, calendario, leads, rate limit, utils
src/proxy.ts              middleware de idioma
```

## Variables de entorno

Crea `.env.local` con:

| Variable                       | Uso                                                  |
| ------------------------------ | ---------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`         | Dominio público (canonical, sitemap). Obligatoria en producción |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`  | Número de WhatsApp de contacto                       |
| `NEXT_PUBLIC_CONTACT_EMAIL`    | Correo de contacto                                   |
| `CALENDAR_API_BASE_URL`        | Servicio de calendario para disponibilidad y reservas |
| `NEXT_PUBLIC_SUPABASE_URL`     | Proyecto de Supabase donde se guardan los leads      |
| `SUPABASE_SECRET_KEY`          | Clave de servidor de Supabase (secreta)              |
| `RESEND_API_KEY`               | Envío de correos (secreta)                           |
| `LEAD_FROM_EMAIL`              | Remitente de los correos                             |
| `NOTIFICATION_EMAIL`           | Correo del equipo que recibe avisos                  |
| `GOOGLE_SITE_VERIFICATION`     | Verificación de Google Search Console (opcional)     |

No subas `.env.local` al repositorio.

MADE WITH ❤️ BY THE NUMI AI TEAM
