# Spec — Sección "Asesoría y Capacitación en IA"

**Status:** Draft, copy validado con fundador. Pendiente de implementación.
**Stack objetivo:** Next.js 14 (App Router, `[locale]`) + TypeScript + Tailwind + shadcn/ui + Motion. Deploy en Vercel.
**Feature id:** `asesoria-capacitacion-ia`

## Contexto

Nueva línea de servicio, independiente de los tres paquetes actuales (`#paquetes`). Dos ofertas:

1. Diagnóstico de Automatización
2. Capacitación en Productividad con IA

## 1. Ubicación en la página

- Nueva sección **entre `#paquetes` y `#proceso`**. No modificar orden ni contenido de secciones existentes salvo los puntos en 4, 5, 6.
- `id` de sección: `asesoria`
- Nav (desktop + mobile), entre "Paquetes" y "Proceso":
  ```
  <a href="#asesoria">Asesoría</a>
  ```

## 2. Estructura visual

Reutilizar sistema de diseño existente — no introducir componentes ni patrones nuevos.

- Mismo fondo/textura oscura que secciones adyacentes (patrón de `#paquetes`, `10-textura-base-sitio.webp` o equivalente ya usado entre secciones).
- Encabezado con mismo tratamiento tipográfico que "Elige cómo empezar" (eyebrow + H2), pero **sin** el copy "Tres formas de empezar según el tamaño de tu operación" — no es escalera por tamaño, son dos servicios distintos.
- **No** reutilizar el grid de 3 columnas de Paquetes; usar grid de **2 columnas** (cards).
- Cards con misma estructura visual que cards de Paquetes (borde, jerarquía título/subtítulo/lista de bullets/precio/CTA), grid de 2 no de 3.
- CTA: mismo estilo que `[ Quiero este paquete ]` (accent naranja `#FF5C1A`, mismo componente de botón).
- Paleta "Naranja Ignición": Primario `#141A1F`, Secundario `#2B3238`, Acento `#FF5C1A`, Neutro oscuro `#0A0D10`, Neutro claro `#F6F4F0`. Tipografía GeistSans. Sin gradientes azul/morado, sin mascota tipo robot.

## 3. Copy (ES) — fuente de verdad: `copy-capacitacion-ia.md`

**Encabezado**
- Eyebrow: "Asesoría y Capacitación"
- H2: "No todos están listos para automatizar. Algunos primero necesitan saber si vale la pena — o que su equipo aprenda a hacerlo."

**Card A — Diagnóstico de Automatización**
- Título: Diagnóstico de Automatización
- Subtítulo: "Antes de invertir, sepan qué vale la pena automatizar y qué no."
- Bullets: 3 puntos del copy (sesiones, mapeo de procesos, entregable)
- Precio: "Desde COP $700.000 · 1–2 sesiones"
- Nota bajo precio (texto pequeño, sin bullet): "Si contratas alguno de los tres paquetes dentro de los 30 días siguientes, el valor del diagnóstico se descuenta del proyecto."
- CTA: `[ Quiero el diagnóstico ]` → `#agenda`

**Card B — Capacitación en Productividad con IA**
- Título: Capacitación en Productividad con IA
- Subtítulo: "Que tu equipo use IA para automatizar su propio trabajo, no solo hablar de IA."
- Bullets: 5 puntos del copy
- Precio: "Desde COP $2.500.000 · Programa de 4 sesiones"
- CTA: `[ Quiero la capacitación ]` → `#agenda`

**Bloque inferior** (fuera de cards, centrado, mismo patrón que "Por qué las empresas eligen Numi AI"): "Cómo se diferencia de un curso genérico" — párrafo corto ya redactado en el copy.

## 4. Cambios en `#paquetes` (Growth Partner)

Agregar línea al final de la descripción del Paquete 3 (Growth Partner), después del bullet "Sesión estratégica mensual con tu equipo":

> *La sesión estratégica mensual incluida puede evolucionar hacia un Programa de Capacitación para tu equipo.*

Tratamiento: texto secundario, tamaño menor a los bullets, sin bullet point (nota aclaratoria, no feature).

## 5. Cambios en `#preguntas-frecuentes`

3 entradas nuevas al final del acordeón existente, mismo componente/estilo:

1. **¿El diagnóstico reemplaza la llamada estratégica gratuita de 15 minutos?**
   No. La llamada gratuita es para conocernos y ver si encajamos. El diagnóstico es un análisis más profundo, con entregable escrito, sobre qué automatizar y qué no en tu negocio específico.

2. **¿Necesito contratar un agente de IA para tomar la capacitación?**
   No. Funciona como servicio independiente. Muchos negocios la usan como primer paso antes de decidir si automatizar algo.

3. **¿Puedo contratar los dos servicios juntos?**
   Sí. De hecho, el diagnóstico suele ser el primer paso natural antes de la capacitación o de cualquiera de los tres paquetes.

## 6. Cambios en formulario de contacto (`#agenda`)

Campo de segmentación **antes** de "Cuéntanos qué necesitas":

- Label: "¿Qué te interesa?"
- Tipo: select, mismo componente que "¿A qué se dedica tu negocio?"
- Opciones:
  - Automatización (uno de los 3 paquetes)
  - Diagnóstico de Automatización
  - Capacitación en Productividad con IA
  - Aún no estoy seguro

**Dependencia backend (bloqueante, coordinar antes de cerrar la tarea):** el valor debe viajar hasta la tabla `leads` / endpoint que alimenta `leads_prospeccion` en el CRM, como campo nuevo (`interes` o similar), para que el lead llegue clasificado. Confirmar con quien mantiene el endpoint de sincronización antes de dar por cerrado.

## 7. Internacionalización (bloqueante para publicar)

Sitio soporta ES/EN vía `messages/es.json` / `messages/en.json` (toggle en nav). Todo el copy nuevo — cards, FAQ, nota Growth Partner, campo de formulario — necesita versión EN antes de publicar. No publicar solo ES dejando EN desactualizado. Si hace falta, la traducción se pide como tarea aparte.

## 8. Checklist de QA antes de publicar

- [ ] Sección `#asesoria` visible en nav (desktop y mobile), ancla funciona
- [ ] Grid de 2 columnas, no reutiliza componente de 3 columnas de Paquetes
- [ ] Ambos CTA llevan a `#agenda`
- [ ] Nota de descuento del diagnóstico visible bajo Card A
- [ ] Línea de cross-sell agregada en Growth Partner
- [ ] 3 preguntas nuevas en FAQ, mismo componente de acordeón
- [ ] Campo "¿Qué te interesa?" en formulario, valor confirmado llegando al backend/CRM
- [ ] Versión en inglés completa (sección, FAQ, formulario)
- [ ] Paleta/tipografía consistentes (sin gradientes azul/morado, sin mascota)
- [ ] Responsive: cards se apilan en mobile igual que Paquetes

## Open questions / bloqueos conocidos

- Campo `interes` en backend/CRM: falta confirmar nombre exacto de campo y endpoint con quien mantiene la sincronización.
- Traducción EN: falta redactar si no se hace en la misma tarea.
