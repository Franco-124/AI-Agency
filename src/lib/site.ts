/**
 * Single source of truth for site-wide constants used by metadata, JSON-LD,
 * the sitemap and the contact CTAs.
 */
export const siteConfig = {
  name: 'Numi AI',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://numi.ai',
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '573135820975',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'atencionnumi@gmail.com',
  country: 'CO',
  region: 'Colombia',
  city: 'Medellín',
  // JPEG rather than WebP: broadest compatibility across social crawlers.
  ogImage: '/images/03-og-social-preview.jpg',
} as const

export const whatsappUrl = `https://wa.me/${siteConfig.whatsapp}`

export const sectionIds = {
  hero: 'inicio',
  contrast: 'diagnostico',
  differentiation: 'enfoque',
  niches: 'nichos',
  services: 'servicios',
  benefits: 'beneficios',
  results: 'resultados',
  why: 'por-que-numi',
  packages: 'paquetes',
  process: 'proceso',
  faq: 'preguntas-frecuentes',
  about: 'sobre-nosotros',
  finalCta: 'agenda',
} as const
