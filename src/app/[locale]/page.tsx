import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { ScrollProgress } from '@/components/layout/ScrollProgress'
import { WhatsAppFab } from '@/components/layout/WhatsAppFab'
import { About } from '@/components/sections/About'
import { Advisory } from '@/components/sections/Advisory'
import { Benefits } from '@/components/sections/Benefits'
import { Contrast } from '@/components/sections/Contrast'
import { Differentiation } from '@/components/sections/Differentiation'
import { Faq } from '@/components/sections/Faq'
import { FinalCta } from '@/components/sections/FinalCta'
import { Hero } from '@/components/sections/Hero'
import { Niches } from '@/components/sections/Niches'
import { Packages, packages as packageDefinitions } from '@/components/sections/Packages'
import { Process } from '@/components/sections/Process'
import { Results } from '@/components/sections/Results'
import { Services } from '@/components/sections/Services'
import { Why } from '@/components/sections/Why'
import { FaqJsonLd } from '@/components/seo/FaqJsonLd'
import { JsonLd } from '@/components/seo/JsonLd'
import { PackagesJsonLd } from '@/components/seo/PackagesJsonLd'
import { isLocale } from '@/i18n/routing'
import { faqKeys } from '@/lib/site'

type PageProps = { params: Promise<{ locale: string }> }

const nicheKeys = ['one', 'two', 'three', 'four', 'five'] as const

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const tMeta = await getTranslations({ locale, namespace: 'metadata' })
  const tNiches = await getTranslations({ locale, namespace: 'niches' })
  const tFaq = await getTranslations({ locale, namespace: 'faq' })
  const tResults = await getTranslations({ locale, namespace: 'results' })
  const tPackages = await getTranslations({ locale, namespace: 'packages' })

  return (
    <>
      <JsonLd
        locale={locale}
        name="Numi AI"
        description={tMeta('description')}
        services={nicheKeys.map((key) => tNiches(`items.${key}`))}
        review={{
          body: tResults('quote'),
          authorName: tResults('attribution').replace(/^[—-]\s*/, ''),
        }}
      />
      <FaqJsonLd
        items={faqKeys.map((key) => ({
          question: tFaq(`items.${key}.question`),
          answer: tFaq(`items.${key}.answer`),
        }))}
      />
      <PackagesJsonLd
        locale={locale}
        items={packageDefinitions.map(({ key, featureKeys }) => ({
          name: tPackages(`${key}.name`),
          description: [
            tPackages(`${key}.audience`),
            ...featureKeys.map((featureKey) => tPackages(`${key}.features.${featureKey}`)),
          ].join(' — '),
          price: tPackages(`${key}.price`),
        }))}
      />

      <ScrollProgress />
      <Header />

      <main id="contenido">
        <Hero />
        <Contrast />
        <Differentiation />
        <Niches />
        <Services />
        <Benefits />
        <Results />
        <Why />
        <Packages />
        <Advisory />
        <Process />
        <Faq />
        <About />
        <FinalCta />
      </main>

      <Footer />
      <WhatsAppFab />
    </>
  )
}
