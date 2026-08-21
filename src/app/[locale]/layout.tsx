import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { GeistSans } from 'geist/font/sans'
import { Fraunces } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { defaultLocale, isLocale, locales, type Locale } from '@/i18n/routing'
import { siteConfig } from '@/lib/site'

import '../globals.css'

type LocaleParams = { params: Promise<{ locale: string }> }

export const generateStaticParams = () => locales.map((locale) => ({ locale }))

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  const safeLocale: Locale = isLocale(locale) ? locale : 'es'
  const t = await getTranslations({ locale: safeLocale, namespace: 'metadata' })

  const title = t('title')
  const description = t('description')

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: title,
      template: `%s — ${siteConfig.name}`,
    },
    description,
    applicationName: siteConfig.name,
    alternates: {
      canonical: `/${safeLocale}`,
      languages: {
        ...Object.fromEntries(locales.map((item) => [item, `/${item}`])),
        'x-default': `/${defaultLocale}`,
      },
    },
    openGraph: {
      type: 'website',
      siteName: siteConfig.name,
      locale: safeLocale === 'es' ? 'es_CO' : 'en_US',
      url: `${siteConfig.url}/${safeLocale}`,
      title,
      description,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: t('ogImageAlt'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [siteConfig.ogImage],
    },
    robots: {
      index: true,
      follow: true,
    },
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
      : {}),
  }
}

export const viewport = {
  themeColor: '#0D0A11',
  colorScheme: 'dark',
}

/**
 * The display face, used only for the hero headline, section titles and the
 * numeric hero figures — never for body copy, cards or UI. Its soft optical
 * sizing and low-contrast strokes are what carry the "made for you" register
 * that a grotesque sans (used everywhere else) cannot.
 */
const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  axes: ['opsz', 'SOFT'],
  variable: '--font-fraunces',
})

export default async function LocaleLayout({
  children,
  params,
}: LocaleParams & { children: ReactNode }) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  setRequestLocale(locale)

  return (
    // Geist Sans stays the body/UI face; Fraunces is the second, deliberately
    // restricted display face (see the token contract in globals.css).
    <html lang={locale} className={`${GeistSans.variable} ${fraunces.variable}`}>
      <body className="min-h-dvh bg-surface text-ink antialiased">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  )
}
