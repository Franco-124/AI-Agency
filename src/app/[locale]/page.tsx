import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { ScrollProgress } from '@/components/layout/ScrollProgress'
import { WhatsAppFab } from '@/components/layout/WhatsAppFab'
import { About } from '@/components/sections/About'
import { Advisory } from '@/components/sections/Advisory'
import { Benefits } from '@/components/sections/Benefits'
import { Faq } from '@/components/sections/Faq'
import { FinalCta } from '@/components/sections/FinalCta'
import { Hero } from '@/components/sections/Hero'
import { Integrations } from '@/components/sections/Integrations'
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
        {/*
          Order follows the visitor's decision, not the product taxonomy:
          what we do → how we start → value → proof → differentiation → offer →
          objection handling → ask.

          `Process` takes the third slot, where the vertical strip used to sit.
          Listing the trades we serve only restated the audience the visitor
          already knows they belong to; "how we start" answers the question
          they actually have after `Services` — what happens if I say yes —
          and it does so before the page asks for anything.

          `Results` carries the only measured outcome on the page, so it lands
          right after `Benefits` — the claim is immediately backed by evidence
          instead of the proof sitting six screens down where most visitors
          never reach it. And `Integrations` drops below the offer: "it works
          with your tools" answers an objection from someone already
          interested, so spending an early slot on it interrupted the
          persuasion arc before there was anything to object to.

          `Advisory` stays directly after `Packages` on purpose — both are
          priced entry points, and the lighter option reads as the fallback for
          anyone who found the packages too big a first step.
        */}
        <Hero />
        <Services />
        <Process />
        <Benefits />
        <Results />
        <Why />
        <Packages />
        <Advisory />
        <Integrations />
        <About />
        <Faq />
        <FinalCta />
      </main>

      <Footer />
      <WhatsAppFab />
    </>
  )
}
