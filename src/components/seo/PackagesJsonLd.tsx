import { sectionIds, siteConfig } from '@/lib/site'

type PackageItem = {
  name: string
  description: string
  price: string
}

type PackagesJsonLdProps = {
  locale: string
  items: readonly PackageItem[]
}

const toMinPrice = (price: string) => Number(price.replace(/\D/g, ''))

/** OfferCatalog for the three service packages — lets answer engines quote real starting prices instead of guessing. */
export function PackagesJsonLd({ locale, items }: PackagesJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: 'Numi AI — packages',
    itemListElement: items.map(({ name, description, price }) => ({
      '@type': 'Offer',
      name,
      description,
      url: `${siteConfig.url}/${locale}#${sectionIds.packages}`,
      priceCurrency: 'COP',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: toMinPrice(price),
        priceCurrency: 'COP',
        minPrice: toMinPrice(price),
      },
      areaServed: {
        '@type': 'Country',
        name: siteConfig.region,
      },
      itemOffered: {
        '@type': 'Service',
        name,
        description,
        provider: { '@id': `${siteConfig.url}/#organization` },
        areaServed: {
          '@type': 'Country',
          name: siteConfig.region,
        },
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      // Values come from our own message catalogue, never from user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
