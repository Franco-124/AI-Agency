import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { IntroCurtain } from '@/components/motion/IntroCurtain'
import { ScrollProgress } from '@/components/layout/ScrollProgress'
import { WhatsAppFab } from '@/components/layout/WhatsAppFab'
import { Benefits } from '@/components/sections/Benefits'
import { Faq } from '@/components/sections/Faq'
import { FinalCta } from '@/components/sections/FinalCta'
import { Hero } from '@/components/sections/Hero'
import { Integrations } from '@/components/sections/Integrations'
import { Process } from '@/components/sections/Process'
import { Results } from '@/components/sections/Results'
import { Services } from '@/components/sections/Services'
import { Why } from '@/components/sections/Why'
import { FaqJsonLd } from '@/components/seo/FaqJsonLd'
import { JsonLd } from '@/components/seo/JsonLd'
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

      {/*
        The opening curtain. Mounted first but painted on top: the page
        renders underneath it from the first frame, so this delays nothing —
        it is an overlay, not a loading gate. Plays once per session, skips
        itself for deep links and under reduced motion, and is dismissed by
        any tap, key or scroll. See `IntroCurtain`.
      */}
      <IntroCurtain />

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

          The three-tier package panel and the advisory/training block that
          used to sit between `Why` and `Integrations` are both gone. The page
          now makes its case and asks for the call directly, with `FinalCta`
          carrying the only offer.
        */}
        <Hero />
        <Services />
        <Process />
        <Benefits />
        <Results />
        <Why />
        <Integrations />
        <Faq />
        <FinalCta />
      </main>

      <Footer />
      <WhatsAppFab />
    </>
  )
}
