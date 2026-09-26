/**
 * Single source of truth for site-wide constants used by metadata, JSON-LD,
 * the sitemap and the contact CTAs.
 */
export const siteConfig = {
  name: 'Numi AI',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.numinet.co',
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '573127676549',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'atencionnumi@gmail.com',
  country: 'CO',
  region: 'Colombia',
  city: 'Medellín',
  // JPEG rather than WebP: broadest compatibility across social crawlers.
  ogImage: '/images/03-og-social-preview.jpg',
  logo: '/images/numi-mark.png',
} as const

export const whatsappUrl = `https://wa.me/${siteConfig.whatsapp}`

/**
 * Who answers for the site in law: the data controller ("Responsable del
 * Tratamiento", Ley 1581 de 2012 / Decreto 1377 de 2013, art. 13) and the
 * provider identified to consumers (Ley 1480 de 2011, art. 50; Ley 527 de
 * 1999). Numi AI is operated by a natural person, so the controller is that
 * person, trading under the commercial name.
 *
 * The privacy policy, the terms and the cookie policy all read from here, so
 * a change of address or holder is one edit. A field still set to `PENDING`
 * renders as "[pendiente]" — `hasPendingLegalData` lets the build flag it.
 */
const PENDING = '[pendiente]'

export const legalEntity = {
  commercialName: 'Numi AI',
  /** Full legal name of the natural person who operates Numi AI. */
  holderName: PENDING,
  /** "C.C." or "NIT" followed by the number, as it appears in the RUT. */
  holderId: PENDING,
  /** Physical address for notices and data-protection requests. */
  address: PENDING,
  city: 'Medellín, Antioquia, Colombia',
  email: siteConfig.email,
  phone: '+57 312 767 6549',
  /** Bump whenever the privacy policy's substance changes — stored with each consent. */
  policyVersion: '2026-09-26',
  /** Date shown as "última actualización" on the three legal pages. */
  updated: { es: '26 de septiembre de 2026', en: 'September 26, 2026' },
} as const

export const hasPendingLegalData = Object.values(legalEntity).includes(PENDING)

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * Fills the operator line the Stitch pages carry in their footer
 * (`__LEGAL_HOLDER__ · __LEGAL_ID__`). Those pages are raw HTML built outside
 * TypeScript, so the identity is injected per request rather than baked in —
 * which keeps `legalEntity` the only place it is written.
 */
export const fillLegalPlaceholders = (html: string) =>
  html
    .replaceAll('__LEGAL_HOLDER__', escapeHtml(legalEntity.holderName))
    .replaceAll('__LEGAL_ID__', escapeHtml(legalEntity.holderId))

/**
 * The agency's own profiles. Order is the order they render in the footer,
 * and the same list feeds `sameAs` in the Organization JSON-LD — one place to
 * edit when a profile is added, so the page and the structured data cannot
 * drift apart.
 */
export const socialLinks = [
  { key: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/num_iai/' },
  { key: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/company/numi-ai' },
] as const

/*
 * Six questions, down from eight, and every one of them is an objection that
 * actually stops a signature: timeline, escalation, price, maintenance,
 * integrations, exit. The two that went were about the firm's own service
 * taxonomy ("does the diagnosis replace the free call", "can I buy both") —
 * questions the page raised for itself rather than ones a buyer arrives with.
 *
 * This list drives both the accordion and the FAQ JSON-LD, so it must stay in
 * step with `faq.items` in every locale file; `npm run i18n:check` enforces
 * that the messages match across locales, and the build fails on a key here
 * that no locale defines.
 */
export const faqKeys = ['one', 'two', 'three', 'four', 'five', 'six'] as const

export const sectionIds = {
  hero: 'inicio',
  services: 'servicios',
  pricing: 'planes',
  integrations: 'integraciones',
  benefits: 'beneficios',
  results: 'resultados',
  why: 'por-que-numi',
  process: 'proceso',
  faq: 'preguntas-frecuentes',
  finalCta: 'agenda',
} as const
