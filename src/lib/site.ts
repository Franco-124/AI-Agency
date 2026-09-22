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
