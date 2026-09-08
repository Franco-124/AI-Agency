import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { INTRO_GATE_SCRIPT } from '@/components/motion/IntroCurtain'
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

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
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
    // Space Grotesk is the display face; Plus Jakarta Sans is the body/UI
    // face (see the token contract in globals.css).
    <html
      lang={locale}
      className={`${plusJakartaSans.variable} ${spaceGrotesk.variable}`}
      /*
        Declared on the server so the gate script *changes* an attribute
        rather than adding one. React compares the server HTML against the
        DOM at hydration, and an attribute that appeared in between is a
        mismatch it reports as an error — which is exactly what happened
        when this was written only by the script.

        `suppressHydrationWarning` covers the value differing (the script
        rewrites it to "play" or "skip" before React ever looks), which is
        the sanctioned escape hatch for markup a pre-hydration script owns.
      */
      data-intro="pending"
      suppressHydrationWarning
    >
      {/*
        `page-grain` lays a fixed, very faint noise layer over the whole
        viewport (see `globals.css`). It covers the sections that do not opt
        into the heavier `.grain` treatment, so the page has one continuous
        surface tooth rather than three textured blocks separated by flat fill.
      */}
      <head>
        {/*
          Decides whether this visit sees the opening curtain, and does it
          *before* the first paint.

          The curtain is server-rendered so it is up from the first byte. This
          runs synchronously in `<head>`, ahead of any paint, and marks the
          root element `data-intro="skip"` for a visit that should not see it —
          a returning visitor in the same session, reduced motion, or a deep
          link. The CSS rule keyed to that attribute then hides the curtain
          before it is ever painted.

          It has to be an inline blocking script rather than a React effect:
          an effect cannot run until hydration, which was measured at 660-814ms
          after the hero was already on screen — so every visitor saw the page,
          then had it covered, then uncovered again.
        */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_GATE_SCRIPT }} />
      </head>
      <body className="page-grain relative min-h-dvh bg-surface text-ink antialiased">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  )
}
