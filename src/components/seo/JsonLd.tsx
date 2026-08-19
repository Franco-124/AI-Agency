import { siteConfig } from '@/lib/site'

type ReviewData = {
  body: string
  authorName: string
}

type JsonLdProps = {
  locale: string
  name: string
  description: string
  /** The five niche labels, used as the service catalogue. */
  services: readonly string[]
  /** The one real, documented client testimonial shown in the Results section. */
  review: ReviewData
}

export function JsonLd({ locale, name, description, services, review }: JsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${siteConfig.url}/#organization`,
    name,
    description,
    url: `${siteConfig.url}/${locale}`,
    image: `${siteConfig.url}${siteConfig.ogImage}`,
    email: siteConfig.email,
    telephone: `+${siteConfig.whatsapp}`,
    inLanguage: locale,
    areaServed: {
      '@type': 'Country',
      name: siteConfig.region,
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: siteConfig.city,
      addressCountry: siteConfig.country,
    },
    knowsAbout: services,
    review: {
      '@type': 'Review',
      reviewBody: review.body,
      author: {
        '@type': 'Organization',
        name: review.authorName,
      },
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name,
      itemListElement: services.map((service) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: service,
          areaServed: siteConfig.region,
        },
      })),
    },
  }

  return (
    <script
      type="application/ld+json"
      // Values come from our own message catalogue, never from user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
