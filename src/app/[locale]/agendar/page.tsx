import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { Link } from '@/i18n/navigation'
import { isLocale, locales } from '@/i18n/routing'

import { BookingPageClient } from './BookingPageClient'

type PageProps = { params: Promise<{ locale: string }> }

export const generateStaticParams = () => locales.map((locale) => ({ locale }))

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const safeLocale = isLocale(locale) ? locale : 'es'
  const t = await getTranslations({ locale: safeLocale, namespace: 'booking' })

  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: { canonical: `/${safeLocale}/agendar` },
  }
}

/**
 * Dedicated scheduling page. Used to be `BookingCalendarPanel` expanding
 * inline under the hero, but its day navigator + slot grid pushed the rest
 * of the landing down and competed with the hero's own headline — this page
 * gives it the room that inline expansion couldn't.
 *
 * Desktop layout mirrors the hero's own two-column pattern (trust content on
 * one side, the interactive element on the other) rather than a new one —
 * the same `max-w-[80rem]`/`grid-cols-12` shell, just with the panel in flow
 * instead of the hero's absolutely-positioned figure. Below `lg` it collapses
 * to a single column: trust content first, calendar under it.
 */
export default async function BookingPage({ params }: PageProps) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  setRequestLocale(locale)

  // Reused verbatim from the landing's "Real results" section (`Results.tsx`)
  // rather than new copy — reinforcing the decision to book right before the
  // visitor picks a time converts better than leaving the calendar with no
  // context of its own.
  const tResults = await getTranslations({ locale, namespace: 'results' })
  const tBooking = await getTranslations({ locale, namespace: 'booking' })

  return (
    <>
      <Header />

      <main id="contenido" className="relative isolate overflow-hidden">
        {/* A single restrained wash in the existing brand tones — no new
            imagery or motion, just enough so the page reads as designed
            instead of a card floating on flat black. */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,var(--surface-base)_0%,color-mix(in_srgb,var(--surface-raised)_60%,var(--surface-base))_100%)]"
        />
        {/* Accent bloom behind the calendar column, echoing the landing's
            final CTA — the page's one job is this panel, so it is lit. */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(56%_52%_at_76%_38%,color-mix(in_srgb,var(--color-acento-deep)_26%,transparent)_0%,transparent_100%)]"
        />

        <div className="mx-auto grid min-h-dvh w-full max-w-[var(--measure-page)] items-center gap-12 px-5 pb-16 pt-[calc(var(--header-height)+2.5rem)] sm:px-8 lg:grid-cols-12 lg:gap-10 lg:pb-24 2xl:max-w-[132rem] 2xl:px-[clamp(5rem,7.5vw,11rem)]">
          {/* Trust column. Only the figure shows on phone/tablet — the quote
              card is kept for `lg` and up, so it never pushes the calendar
              far down the mobile scroll. */}
          <div className="flex min-w-0 flex-col lg:col-span-5">
            {/* Given the back arrow a seated tile: this is the only way off
                the page, and as a bare 14px text link it read as metadata. */}
            <Link
              href="/"
              className="group -ml-1 inline-flex min-h-11 w-fit items-center gap-2.5 rounded-lg pl-1 pr-2 text-[0.8125rem] font-medium text-ink-muted transition-colors duration-200 hover:text-ink"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-[0.5rem] border border-hairline bg-[var(--surface-panel)] transition-colors duration-200 group-hover:border-hairline-strong group-hover:bg-[var(--surface-inset)]">
                <ArrowLeft
                  aria-hidden
                  className="h-4 w-4 transition-transform duration-200 ease-[var(--ease-emphasis)] group-hover:-translate-x-0.5"
                />
              </span>
              {tBooking('backHome')}
            </Link>

            <p className="type-eyebrow mt-9 text-[var(--accent-text)]">
              {tResults('title')}
            </p>

            {/* Stacked, matching `Results` — the figure leads, its qualifier
                explains it. Same reasoning as there: the two do not belong on
                one baseline at two different sizes. */}
            <p className="mt-5 lg:mt-6">
              <span className="type-figure block text-[2.5rem] leading-[0.95] text-[var(--accent-text)] lg:text-[3.25rem]">
                {tResults('figureValue')}
              </span>
              <span className="mt-3.5 block max-w-[24ch] font-sans text-[1.0625rem] font-medium leading-[1.4] tracking-[-0.015em] text-ink lg:mt-4 lg:text-[1.375rem]">
                {tResults('figureRest')}
              </span>
            </p>

            <figure className="surface-panel mt-10 hidden rounded-[1.125rem] rounded-tl-md p-6 lg:block">
              <blockquote className="text-[0.9375rem] leading-[1.7] text-ink">
                <p>&ldquo;{tResults('quote')}&rdquo;</p>
              </blockquote>
              <figcaption className="mt-6 border-t border-hairline-subtle pt-5 text-[0.875rem] text-ink-muted">
                {tResults('attribution')}
              </figcaption>
            </figure>
          </div>

          {/* Booking column — notably wider than the old single `max-w-2xl`
              page, since its width now comes from this grid column rather
              than an artificial cap on the panel itself. */}
          <div id="reserva" className="min-w-0 scroll-mt-24 lg:col-span-7">
            <BookingPageClient />
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
