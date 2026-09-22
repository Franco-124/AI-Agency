import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { IBM_Plex_Sans, Inter, Plus_Jakarta_Sans } from 'next/font/google'
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
  /*
   * `cover` so the page paints under the notch and the home indicator, which
   * is what makes `env(safe-area-inset-*)` report real values — without it
   * every inset resolves to 0 and the fixed header has no way to know it is
   * sitting under a status bar. The header adds the top inset to its own
   * height and publishes the total as `--header-height`, so the hero's
   * padding follows automatically.
   */
  viewportFit: 'cover',
}

/*
  Display face. Space Grotesk was a geometric grotesque with a quirked `g`,
  a single-storey `a` in its lighter weights and very tight default tracking —
  the letterforms that read as "technology product". IBM Plex Sans is the
  opposite proposition: a corporate typeface commissioned by IBM as its
  institutional voice, neutral enough to disappear behind the words and
  authoritative enough to carry a claim without shouting.

  `latin-ext` is required, not optional: the site ships Spanish, and the
  `latin` subset alone does not cover every accented glyph the copy needs.
*/
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-display-face',
})

/*
  Body/UI face. Plus Jakarta Sans is a humanist sans with a warm, slightly
  rounded character set — well made, but its personality competes with the
  copy on a page whose job is to sound measured. Inter was drawn for user
  interfaces: a tall x-height, unambiguous figures and no voice of its own,
  which is exactly what body text on a professional-services site wants.
*/
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-body-face',
})

/*
  Hero-only display face, scoped to `.hero-jakarta` in globals.css.

  The site's own display face is IBM Plex Sans, chosen over Plus Jakarta Sans
  for its neutral, institutional voice (see the comment above). The Stitch
  redesign's hero calls for Plus Jakarta Sans specifically, on the product
  owner's explicit request to match that comp — so it is added as a second,
  narrowly-scoped face rather than replacing the site's chosen display face
  everywhere it appears.
*/
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['600', '700', '800'],
  display: 'swap',
  variable: '--font-hero-display',
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
    // IBM Plex Sans is the display face; Inter is the body/UI face (see the
    // token contract in globals.css).
    <html
      lang={locale}
      className={`${inter.variable} ${ibmPlexSans.variable} ${plusJakartaSans.variable}`}
      /*
        Opts into Next's smooth-scroll contract: `globals.css` sets
        `scroll-behavior: smooth` on this element, and without this attribute
        Next warns that it will also smooth-scroll route transitions — which
        would animate the jump between pages, not just the in-page anchors the
        rule is there for.
      */
      data-scroll-behavior="smooth"
    >
      {/*
        `page-grain` lays a fixed, very faint noise layer over the whole
        viewport (see `globals.css`). It covers the sections that do not opt
        into the heavier `.grain` treatment, so the page has one continuous
        surface tooth rather than three textured blocks separated by flat fill.
      */}
      <body className="page-grain relative min-h-dvh bg-surface text-ink antialiased">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  )
}
