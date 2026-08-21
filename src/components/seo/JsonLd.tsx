import { siteConfig, whatsappUrl } from '@/lib/site'

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
    '@type': ['Organization', 'ProfessionalService'],
    '@id': `${siteConfig.url}/#organization`,
    name,
    description,
    url: `${siteConfig.url}/${locale}`,
    logo: `${siteConfig.url}${siteConfig.logo}`,
    image: `${siteConfig.url}${siteConfig.ogImage}`,
    email: siteConfig.email,
    // WhatsApp only, not a voice line — listed as `sameAs`, never as
    // `telephone`, so an answer engine never tells someone to call it.
    sameAs: [whatsappUrl],
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
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: siteConfig.email,
        url: whatsappUrl,
        areaServed: siteConfig.country,
        availableLanguage: ['es', 'en'],
      },
    ],
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
