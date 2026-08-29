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

export const faqKeys = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'] as const

export const sectionIds = {
  hero: 'inicio',
  services: 'servicios',
  integrations: 'integraciones',
  benefits: 'beneficios',
  results: 'resultados',
  why: 'por-que-numi',
  packages: 'paquetes',
  advisory: 'asesoria',
  process: 'proceso',
  faq: 'preguntas-frecuentes',
  about: 'sobre-nosotros',
  finalCta: 'agenda',
} as const
