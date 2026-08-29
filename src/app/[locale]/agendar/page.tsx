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
          className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,var(--color-neutro-oscuro)_0%,color-mix(in_srgb,var(--color-primario)_42%,var(--color-neutro-oscuro))_100%)]"
        />

        <div className="mx-auto grid min-h-dvh max-w-[80rem] items-center gap-14 px-5 pb-16 pt-[calc(var(--header-height)+3rem)] sm:px-8 lg:grid-cols-12 lg:gap-10 lg:pb-24 2xl:max-w-[132rem] 2xl:px-[clamp(5rem,7.5vw,11rem)]">
          {/* Trust column. Only the figure shows on phone/tablet — the quote
              card is kept for `lg` and up, so it never pushes the calendar
              far down the mobile scroll. */}
          <div className="flex min-w-0 flex-col lg:col-span-5">
            <Link
              href="/"
              className="inline-flex w-fit items-center gap-2 text-sm text-ink-muted transition-colors duration-200 hover:text-ink"
            >
              <ArrowLeft aria-hidden className="h-4 w-4" />
              {tBooking('backHome')}
            </Link>

            <p className="type-eyebrow mt-8 text-[var(--color-acento)]">{tResults('title')}</p>

            <p className="type-figure mt-6 text-3xl leading-[1.1] lg:mt-8 lg:text-[2.75rem]">
              <span className="text-[var(--color-acento)]">{tResults('figureValue')}</span>{' '}
              <span className="font-sans text-[0.5em] font-medium leading-snug tracking-[-0.01em] text-ink">
                {tResults('figureRest')}
              </span>
            </p>

            <figure className="mt-10 hidden rounded-2xl rounded-tl-md border border-hairline bg-[var(--color-secundario)] p-7 lg:block">
              <blockquote className="text-[0.9375rem] leading-relaxed text-ink">
                <p>&ldquo;{tResults('quote')}&rdquo;</p>
              </blockquote>
              <figcaption className="mt-6 border-t border-hairline pt-5 text-sm text-ink-muted">
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
