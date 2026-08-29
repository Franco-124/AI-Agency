'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, ChevronRight, Loader2, MessageCircle, X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useId, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  bookSlot,
  getAvailability,
  SlotUnavailableError,
  type AvailabilitySlot,
} from '@/lib/calendar-client'
import { bookingContactSchema, type BookingContact } from '@/lib/schemas'
import { whatsappUrl } from '@/lib/site'
import { cn } from '@/lib/utils'

import { Field } from './Field'

/**
 * Explicit phases rather than loose booleans (isLoading, hasError,
 * isBooking…): with a single `step` field there is no way to represent an
 * invalid combination like "loading and confirmed at the same time". Every
 * phase but `confirmed` carries the day it refers to, so the day navigator
 * always knows what it's looking at. Unlike the old inline version, there is
 * no `idle` phase — the panel is only ever mounted once a caller has already
 * decided to show it, so it fetches from the moment it appears.
 */
type Phase =
  | { step: 'loading'; day: string }
  | { step: 'slots'; day: string; slots: AvailabilitySlot[] }
  | { step: 'confirming'; day: string; slot: AvailabilitySlot }
  | { step: 'confirmed' }
  | { step: 'error'; day: string; message: string }
  /**
   * Self-service booking is off the table — either the calendar has nothing
   * open at all, or the booking service itself refused the write. Terminal
   * like `confirmed`: there is no day to go back to, the hand-off to the team
   * has already happened. `notified` records whether that hand-off actually
   * had contact details to send, which decides what the visitor is told.
   */
  | { step: 'fallback'; reason: FallbackReason; notified: boolean }

/** Why self-service booking could not happen — see `onFallback`. */
export type FallbackReason = 'no_availability' | 'service_failed'

/** How many days ahead to auto-search for the first day with any open slot. */
const MAX_LOOKAHEAD_DAYS = 14

const todayIsoDate = () => new Date().toISOString().slice(0, 10)

/** Pure calendar-date arithmetic in UTC — immune to the visitor's local timezone. */
function addDays(isoDay: string, delta: number): string {
  const [year, month, day] = isoDay.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() + delta)
  return date.toISOString().slice(0, 10)
}

function formatDayLabel(isoDay: string, locale: string): string {
  const [year, month, day] = isoDay.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(date)
}

type BookingCalendarPanelProps = {
  onCancel: () => void
  /**
   * Called once when self-service booking becomes impossible: the initial
   * lookahead search (see `findFirstAvailableDay` below) found no open slot
   * within `MAX_LOOKAHEAD_DAYS`, or the booking service refused the write.
   * Not called for a day the visitor navigates to manually with the day
   * arrows — an empty day there is normal (evenings, weekends), not a sign
   * the calendar has nothing at all — nor for a slot that was simply taken
   * while the visitor was choosing, which is recoverable by picking another.
   *
   * Returns whether the team was actually notified: false when there are no
   * contact details to send (the hero's bare widget), which is what decides
   * whether the visitor is told "we'll reach out" or "message us".
   */
  onFallback?: (reason: FallbackReason) => boolean
  /** Pre-fills the name field — the visitor can still edit it, this is not read-only. */
  initialName?: string
  /** Pre-fills the WhatsApp field — same, editable. */
  initialPhone?: string
  /** Pre-fills the email field — same, editable. Always asked, never optional (see `bookingContactSchema`). */
  initialEmail?: string
  /** Free-form context that travels to the backend's `notes` field on booking. */
  notes?: string
  /** Overrides the default card chrome — used when a caller already provides its own container. */
  className?: string
}

/**
 * The live scheduling panel: fetches real availability, lets the visitor
 * pick a slot, and books it against the calendar backend. Deliberately does
 * NOT expose the WhatsApp agent — this only picks a slot on the calendar, it
 * never talks back.
 *
 * Reused from two places: the hero's bare `DemoBookingWidget` (no pre-fill,
 * mounted on click) and `LeadForm`'s success step (pre-filled with what the
 * long qualification form already collected, mounted right after that
 * form's email + Supabase insert both succeed) — so the visitor never
 * re-types what they already gave, and never leaves with just a "we'll
 * call you" promise.
 */
export function BookingCalendarPanel({
  onCancel,
  onFallback,
  initialName,
  initialPhone,
  initialEmail,
  notes,
  className,
}: BookingCalendarPanelProps) {
  const t = useTranslations('booking')
  const tForm = useTranslations('form')
  const tWhatsapp = useTranslations('whatsapp')
  const locale = useLocale()
  const prefix = useId()

  const [phase, setPhase] = useState<Phase>({ step: 'loading', day: todayIsoDate() })
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingContact>({
    resolver: zodResolver(bookingContactSchema),
    defaultValues: {
      name: initialName ?? '',
      whatsapp: initialPhone ?? '',
      email: initialEmail ?? '',
    },
  })

  /** Maps the shared zod error codes onto the localized copy, same convention as `LeadForm`. */
  const messageFor = (code?: string) => {
    if (!code) return undefined
    if (code === 'invalidWhatsapp') return tForm('invalidWhatsapp')
    if (code === 'invalidEmail') return tForm('invalidEmail')
    return tForm('required')
  }

  /**
   * Reports that self-service is off the table, and answers whether the team
   * was reachable. The two fallback paths are mutually exclusive — an empty
   * lookahead goes straight to the terminal phase without ever rendering a
   * slot to book — and de-duplicating the notification itself belongs to the
   * caller, which is what actually owns the lead's details.
   */
  const notifyTeam = (reason: FallbackReason): boolean => onFallback?.(reason) ?? false

  /** Fetches one day only — used for manual prev/next navigation. */
  const goToDay = async (day: string) => {
    setSelectedSlot(null)
    setPhase({ step: 'loading', day })
    try {
      const slots = await getAvailability(day)
      setPhase({ step: 'slots', day, slots })
    } catch {
      setPhase({ step: 'error', day, message: t('loadError') })
    }
  }

  /**
   * Most days have nothing open (evenings, weekends), so starting from
   * "today" and stopping at the first empty response would show "no slots"
   * far more often than it shows a calendar. Walks forward day by day until
   * one has an open slot, up to `MAX_LOOKAHEAD_DAYS` out, then stops there —
   * the visitor can still page further with the day navigator.
   */
  const findFirstAvailableDay = async (
    day: string,
    attemptsLeft: number,
  ): Promise<{ day: string; slots: AvailabilitySlot[] }> => {
    const slots = await getAvailability(day)

    if (slots.length > 0 || attemptsLeft <= 0) {
      return { day, slots }
    }

    return findFirstAvailableDay(addDays(day, 1), attemptsLeft - 1)
  }

  useEffect(() => {
    let cancelled = false
    const startDay = todayIsoDate()

    findFirstAvailableDay(startDay, MAX_LOOKAHEAD_DAYS)
      .then(({ day, slots }) => {
        if (cancelled) return

        // Nothing open in the whole lookahead window: there is no calendar
        // worth showing, so hand straight off to the team rather than
        // leaving the visitor to page through empty days one by one.
        if (slots.length === 0) {
          setPhase({
            step: 'fallback',
            reason: 'no_availability',
            notified: notifyTeam('no_availability'),
          })
          return
        }

        setPhase({ step: 'slots', day, slots })
      })
      .catch(() => {
        // The calendar never loaded, so there is nothing for the visitor to
        // act on — same hand-off as an empty calendar rather than an error
        // message that leaves them staring at a dead panel.
        if (cancelled) return
        setPhase({
          step: 'fallback',
          reason: 'service_failed',
          notified: notifyTeam('service_failed'),
        })
      })

    return () => {
      cancelled = true
    }
    // Runs once on mount only — this panel is never reused for a different day range.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSubmit = handleSubmit(async (values) => {
    // `confirmed` and `fallback` are terminal: neither refers to a day, and
    // there is nothing left to submit from either.
    if (!selectedSlot || phase.step === 'confirmed' || phase.step === 'fallback') return

    const day = phase.day
    setPhase({ step: 'confirming', day, slot: selectedSlot })
    try {
      await bookSlot({
        start: selectedSlot.start,
        name: values.name,
        whatsapp: values.whatsapp,
        email: values.email,
        notes,
      })
      setPhase({ step: 'confirmed' })
    } catch (error) {
      // A slot taken while the visitor was filling the form is recoverable:
      // refresh the day so it disappears and let them pick another.
      if (error instanceof SlotUnavailableError) {
        setPhase({ step: 'error', day, message: t('slotUnavailable') })
        setSelectedSlot(null)
        void goToDay(day)
        return
      }

      // Anything else is the booking service refusing the write — retrying
      // would fail the same way, so hand off to the team instead of showing
      // a generic error the visitor can only bounce off.
      console.error('Booking failed:', error)
      setPhase({
        step: 'fallback',
        reason: 'service_failed',
        notified: notifyTeam('service_failed'),
      })
    }
  })

  /** `confirmed` and `fallback` are terminal — neither refers to a day, and neither offers a way back into the grid. */
  const isTerminal = phase.step === 'confirmed' || phase.step === 'fallback'
  const currentDay = isTerminal ? undefined : phase.day
  const isBusy = phase.step === 'loading' || phase.step === 'confirming'
  const canGoBack = currentDay !== undefined && currentDay > todayIsoDate()

  return (
    <div
      className={cn(
        'w-full basis-full rounded-2xl border border-hairline bg-[color-mix(in_srgb,var(--color-primario)_94%,transparent)] p-6 sm:p-7 lg:p-10',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold tracking-[-0.02em] text-ink">
            {phase.step === 'fallback' ? t('fallbackTitle') : t('title')}
          </h3>
          {phase.step !== 'fallback' && (
            <p className="mt-1 text-sm text-ink-muted">{t('subtitle')}</p>
          )}
        </div>
        {!isTerminal && (
          <button
            type="button"
            onClick={onCancel}
            aria-label={t('dismiss')}
            className="shrink-0 rounded-full p-1.5 text-ink-faint transition-colors hover:bg-[var(--accent-soft)] hover:text-ink"
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        )}
      </div>

      {currentDay && (
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            disabled={!canGoBack || isBusy}
            onClick={() => goToDay(addDays(currentDay, -1))}
            aria-label={t('prevDay')}
            className="rounded-full p-1.5 text-ink-faint transition-colors hover:bg-[var(--accent-soft)] hover:text-ink disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft aria-hidden className="h-4 w-4" />
          </button>
          <p className="text-sm font-medium capitalize text-ink">
            {formatDayLabel(currentDay, locale)}
          </p>
          <button
            type="button"
            disabled={isBusy}
            onClick={() => goToDay(addDays(currentDay, 1))}
            aria-label={t('nextDay')}
            className="rounded-full p-1.5 text-ink-faint transition-colors hover:bg-[var(--accent-soft)] hover:text-ink disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronRight aria-hidden className="h-4 w-4" />
          </button>
        </div>
      )}

      {phase.step === 'loading' && (
        <p className="mt-3 text-sm text-ink-muted">{t('loadingSlots')}</p>
      )}

      {phase.step === 'error' && (
        <p role="alert" className="mt-3 text-sm text-[var(--color-acento)]">
          {phase.message}
        </p>
      )}

      {(phase.step === 'slots' || phase.step === 'confirming') && (
        <>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:gap-3">
            {phase.step === 'slots' && phase.slots.length === 0 && (
              <p className="col-span-full text-sm text-ink-muted">{t('noSlots')}</p>
            )}
            {(phase.step === 'slots' ? phase.slots : [phase.slot]).map((slot) => (
              <button
                key={slot.start}
                type="button"
                disabled={phase.step === 'confirming'}
                onClick={() => setSelectedSlot(slot)}
                className={cn(
                  'rounded-lg border px-3 py-2 text-sm transition-colors disabled:pointer-events-none disabled:opacity-55 lg:px-4 lg:py-3 lg:text-base',
                  selectedSlot?.start === slot.start
                    ? 'border-[var(--color-acento)] bg-[var(--color-acento)] text-[var(--color-neutro-oscuro)]'
                    : 'border-hairline text-ink hover:border-[var(--accent-hairline)]',
                )}
              >
                {slot.label}
              </button>
            ))}
          </div>

          {selectedSlot && (
            <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-4">
              <Field
                id={`${prefix}-name`}
                label={t('name')}
                error={messageFor(errors.name?.message)}
              >
                {(props) => (
                  <input
                    type="text"
                    autoComplete="name"
                    placeholder={t('namePlaceholder')}
                    {...props}
                    {...register('name')}
                  />
                )}
              </Field>

              <Field
                id={`${prefix}-whatsapp`}
                label={t('whatsapp')}
                error={messageFor(errors.whatsapp?.message)}
              >
                {(props) => (
                  <input
                    type="tel"
                    autoComplete="tel"
                    placeholder={t('whatsappPlaceholder')}
                    {...props}
                    {...register('whatsapp')}
                  />
                )}
              </Field>

              <Field
                id={`${prefix}-email`}
                label={t('email')}
                error={messageFor(errors.email?.message)}
              >
                {(props) => (
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder={t('emailPlaceholder')}
                    {...props}
                    {...register('email')}
                  />
                )}
              </Field>

              <Button
                type="submit"
                variant="solid"
                size="lg"
                block
                disabled={phase.step === 'confirming'}
              >
                {phase.step === 'confirming' ? (
                  <>
                    <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
                    {t('confirming')}
                  </>
                ) : (
                  t('confirm')
                )}
              </Button>
            </form>
          )}
        </>
      )}

      {phase.step === 'confirmed' && (
        <div role="status" className="mt-6">
          <p className="text-base font-semibold text-ink">{t('confirmedTitle')}</p>
          <p className="mt-1.5 text-sm text-ink-muted">{t('confirmedBody')}</p>

          <Button type="button" variant="outline" size="lg" className="mt-6" onClick={onCancel}>
            {t('backHome')}
          </Button>
        </div>
      )}

      {/*
        Self-service is off the table. The visitor is told what happens next
        in plain terms rather than being shown a failure they cannot act on:
        if their details reached the team, a person follows up on WhatsApp;
        if there were none to send (the hero's bare widget), the WhatsApp
        link is the way to reach us, so it is offered directly.
      */}
      {phase.step === 'fallback' && (
        <div role="status" className="mt-6">
          <p className="text-sm leading-relaxed text-ink-muted">
            {phase.reason === 'no_availability' ? t('fallbackNoSlots') : t('fallbackFailed')}
          </p>
          <p className="mt-3 text-[0.9375rem] font-semibold leading-relaxed text-ink">
            {phase.notified ? t('fallbackNotified') : t('fallbackWriteUs')}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {!phase.notified && (
              <Button asChild variant="solid" size="lg">
                <a
                  href={`${whatsappUrl}?text=${encodeURIComponent(tWhatsapp('prefill'))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle aria-hidden className="h-4 w-4" />
                  {t('fallbackWhatsappCta')}
                </a>
              </Button>
            )}
            <Button type="button" variant="outline" size="lg" onClick={onCancel}>
              {t('backHome')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
