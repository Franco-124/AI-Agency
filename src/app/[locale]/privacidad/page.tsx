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

        <section className="mt-14">
          <h2 className="text-xl font-semibold tracking-[-0.02em]">{t('dataTitle')}</h2>
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-muted">
            {t('dataIntro')}
          </p>
          <ul className="mt-5 flex flex-col gap-3">
            {dataKeys.map((key) => (
              <li key={key} className="flex gap-3 text-[0.9375rem] text-ink-muted">
                <span
                  aria-hidden
                  className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-[var(--color-acento)]"
                />
                {t(`data.${key}`)}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="text-xl font-semibold tracking-[-0.02em]">{t('useTitle')}</h2>
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-muted">
            {t('useIntro')}
          </p>
          <ul className="mt-5 flex flex-col gap-3">
            {useKeys.map((key) => (
              <li key={key} className="flex gap-3 text-[0.9375rem] text-ink-muted">
                <span
                  aria-hidden
                  className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-[var(--color-acento)]"
                />
                {t(`use.${key}`)}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="text-xl font-semibold tracking-[-0.02em]">
            {t('sharingTitle')}
          </h2>
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-muted">
            {t('sharing')}
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-xl font-semibold tracking-[-0.02em]">
            {t('retentionTitle')}
          </h2>
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-muted">
            {t('retention')}
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-xl font-semibold tracking-[-0.02em]">{t('rightsTitle')}</h2>
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-muted">
            {t('rights')}
          </p>
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-muted">
            {t('rightsContact')}{' '}
            <a
              href={`mailto:${siteConfig.email}`}
              className="text-[var(--color-acento)] underline underline-offset-4"
            >
              {siteConfig.email}
            </a>
          </p>
        </section>

        <p className="mt-16 border-t border-hairline pt-7 text-sm text-ink-faint">
          {t('updated')}
        </p>
      </main>

      <Footer />
    </>
  )
}
