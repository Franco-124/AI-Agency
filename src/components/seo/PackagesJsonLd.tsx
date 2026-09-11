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

/**
 * The starting figure from a human price string.
 *
 * Takes the FIRST number in the text, not every digit in it. The previous
 * version stripped all non-digits from the whole string, which is correct only
 * while every price names a single figure — the website tier names a range
 * ("Desde COP $800.000 hasta COP $1.500.000, según la cantidad de contenido")
 * and it concatenated both into 8 000 001 500 000 COP. That is an invalid
 * Offer that Google would reject, and a figure an answer engine could quote
 * verbatim.
 *
 * Thousands separators are dots in `es` and commas in `en`, so both are
 * stripped from inside the matched run of digits.
 */
const toMinPrice = (price: string): number | undefined => {
  const match = price.match(/\d[\d.,]*/)
  if (!match) return undefined

  const digits = match[0].replace(/\D/g, '')

  return digits ? Number(digits) : undefined
}

/** OfferCatalog for the three service packages — lets answer engines quote real starting prices instead of guessing. */
export function PackagesJsonLd({ locale, items }: PackagesJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: `${siteConfig.name} — ${sectionIds.packages}`,
    itemListElement: items.map(({ name, description, price }) => ({
      '@type': 'Offer',
      name,
      description,
      url: `${siteConfig.url}/${locale}#${sectionIds.packages}`,
      priceCurrency: 'COP',
      availability: 'https://schema.org/InStock',
      /*
        `minPrice` alone, without a sibling `price`. Every figure on the page
        is a "from" price, and schema.org treats `price` as the exact amount —
        publishing both said the offer costs exactly its own floor, which is
        not what any of these tiers mean.
      */
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
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
