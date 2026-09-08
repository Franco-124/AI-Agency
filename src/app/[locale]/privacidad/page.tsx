import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { isLocale, locales } from '@/i18n/routing'
import { siteConfig } from '@/lib/site'

type PageProps = { params: Promise<{ locale: string }> }

export const generateStaticParams = () => locales.map((locale) => ({ locale }))

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const safeLocale = isLocale(locale) ? locale : 'es'
  const t = await getTranslations({ locale: safeLocale, namespace: 'privacy' })

  return {
    title: t('title'),
    description: t('metaDescription'),
    alternates: { canonical: `/${safeLocale}/privacidad` },
  }
}

const dataKeys = ['one', 'two', 'three', 'four', 'five', 'six'] as const
const useKeys = ['one', 'two'] as const

export default async function PrivacyPage({ params }: PageProps) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'privacy' })

  return (
    <>
      <Header />

      <main
        id="contenido"
        className="mx-auto max-w-3xl px-5 pb-24 pt-[calc(var(--header-height)+5rem)] sm:px-8 lg:pb-32"
      >
        <h1 className="type-section-title">{t('title')}</h1>
        <p className="type-lead mt-8">{t('intro')}</p>

        <section className="mt-12 sm:mt-14">
          <h2 className="font-display text-[1.1875rem] font-medium tracking-[-0.022em] sm:text-xl">{t('dataTitle')}</h2>
          <p className="type-body mt-4">
            {t('dataIntro')}
          </p>
          <ul className="mt-5 flex flex-col gap-3">
            {dataKeys.map((key) => (
              <li key={key} className="type-body flex gap-3">
                <span
                  aria-hidden
                  className="mt-[0.6875em] h-1 w-1 shrink-0 rounded-full bg-[var(--accent-text)]"
                />
                {t(`data.${key}`)}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12 sm:mt-14">
          <h2 className="font-display text-[1.1875rem] font-medium tracking-[-0.022em] sm:text-xl">{t('useTitle')}</h2>
          <p className="type-body mt-4">
            {t('useIntro')}
          </p>
          <ul className="mt-5 flex flex-col gap-3">
            {useKeys.map((key) => (
              <li key={key} className="type-body flex gap-3">
                <span
                  aria-hidden
                  className="mt-[0.6875em] h-1 w-1 shrink-0 rounded-full bg-[var(--accent-text)]"
                />
                {t(`use.${key}`)}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12 sm:mt-14">
          <h2 className="font-display text-[1.1875rem] font-medium tracking-[-0.022em] sm:text-xl">
            {t('sharingTitle')}
          </h2>
          <p className="type-body mt-4">
            {t('sharing')}
          </p>
        </section>

        <section className="mt-12 sm:mt-14">
          <h2 className="font-display text-[1.1875rem] font-medium tracking-[-0.022em] sm:text-xl">
            {t('retentionTitle')}
          </h2>
          <p className="type-body mt-4">
            {t('retention')}
          </p>
        </section>

        <section className="mt-12 sm:mt-14">
          <h2 className="font-display text-[1.1875rem] font-medium tracking-[-0.022em] sm:text-xl">{t('rightsTitle')}</h2>
          <p className="type-body mt-4">
            {t('rights')}
          </p>
          <p className="type-body mt-4">
            {t('rightsContact')}{' '}
            {/*
              An inline link inside a sentence, so it deliberately does not get
              a 44px box — that would break the line it belongs to. `py-2` on an
              inline element grows the hit area without affecting the line box,
              which is the correct trade-off here: the same address is also
              offered in the footer as a full-height target.
            */}
            <a
              href={`mailto:${siteConfig.email}`}
              className="-my-2 inline-block py-2 text-[var(--accent-text)] underline decoration-[var(--accent-hairline)] underline-offset-4 transition-colors duration-200 hover:decoration-[var(--accent-text)]"
            >
              {siteConfig.email}
            </a>
          </p>
        </section>

        <p className="mt-16 border-t border-hairline-subtle pt-7 text-[0.8125rem] text-ink-faint">
          {t('updated')}
        </p>
      </main>

      <Footer />
    </>
  )
}
