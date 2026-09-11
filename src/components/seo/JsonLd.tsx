import { siteConfig, socialLinks, whatsappUrl } from '@/lib/site'

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
  const organization = {
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
    // The agency's own profiles join it here so search engines can tie the
    // site and the social accounts to one entity.
    sameAs: [whatsappUrl, ...socialLinks.map((link) => link.href)],
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

  /*
    The site as its own entity, published alongside the organization rather
    than folded into it.

    Search engines and answer engines model "the company" and "the website"
    separately: `Organization` answers *who this business is*, `WebSite`
    answers *what this domain is and who publishes it*. Without the second
    node the domain has no entity of its own to attach to, which is what
    `publisher` here supplies via the organization's `@id`.

    No `potentialAction`/`SearchAction`: that declares a site search endpoint,
    and this site has none. Declaring one that does not exist is worse than
    omitting it.
  */
  const website = {
    '@type': 'WebSite',
    '@id': `${siteConfig.url}/#website`,
    url: `${siteConfig.url}/${locale}`,
    name,
    description,
    inLanguage: locale,
    publisher: { '@id': `${siteConfig.url}/#organization` },
  }

  const data = {
    '@context': 'https://schema.org',
    '@graph': [organization, website],
  }

  return (
    <script
      type="application/ld+json"
      // Values come from our own message catalogue, never from user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
