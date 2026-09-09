'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ChevronLeft, ChevronRight, Loader2, MessageCircle, X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useId, useRef, useState } from 'react'
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

/**
 * The backend's `label` field comes pre-formatted in 24h ("14:00"), but
 * visitors read 12h clock times more naturally ("2pm"). Reformats from
 * `start` (already in the tenant's timezone) instead of trusting the label.
 */
function formatSlotTime(isoStart: string, locale: string): string {
  const formatted = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(isoStart))
  return formatted.replace(/^(\d+):00\s?/, '$1').replace(/\s+/g, '').toLowerCase()
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
  const panelRef = useRef<HTMLDivElement>(null)

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

  /*
   * Landing on a terminal phase collapses the day navigator, the slot grid
   * and the three-field form all at once — on mobile that is most of the
   * panel's height, gone in one render. The visitor was scrolled down to
   * reach the submit button (often past a keyboard eating half the screen),
   * and with nothing left above to hold that scroll position the browser
   * clamps it to the new, much shorter document — which lands on whatever
   * now sits at that offset, almost always the footer. There is no
   * "confirmed" message to read at that point, just the page underneath it.
   *
   * Re-anchoring to the panel itself is what fixes that: whichever terminal
   * state just landed, the panel — confirmation or fallback — is guaranteed
   * to be the thing on screen. `requestAnimationFrame` waits for the
   * collapsed layout to actually commit before measuring where to scroll to;
   * scrolling against the pre-collapse layout would target the wrong offset.
   */
  useEffect(() => {
    if (!isTerminal) return

    const frame = requestAnimationFrame(() => {
      // `nearest`, not `start`: the panel is very likely already visible
      // (the bug is the browser having clamped scroll *past* it, not short
      // of it), so this only moves the viewport the minimum needed to bring
      // it back — no jump on a desktop where it never left view at all.
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })

    return () => cancelAnimationFrame(frame)
  }, [isTerminal])

  return (
    <div
      ref={panelRef}
      className={cn(
        'surface-panel w-full basis-full rounded-[1.125rem] p-5 shadow-[var(--shadow-high)] sm:p-7 lg:p-9',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-[1.0625rem] font-semibold tracking-[-0.02em] text-ink sm:text-lg">
            {phase.step === 'fallback' ? t('fallbackTitle') : t('title')}
          </h3>
          {phase.step !== 'fallback' && (
            <p className="mt-1.5 text-[0.875rem] leading-relaxed text-ink-muted">
              {t('subtitle')}
            </p>
          )}
        </div>
        {!isTerminal && (
          <button
            type="button"
            onClick={onCancel}
            aria-label={t('dismiss')}
            /* Grown to a 44px target — it was a 28px hit area on a control
               that dismisses the booking flow. */
            className="-m-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-[var(--accent-soft)] hover:text-ink"
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        )}
      </div>

      {/*
        Day navigator. Now a bordered strip rather than three loose controls on
        a shared row: the strip is what identifies the two chevrons and the
        date between them as one navigator, and it gives the arrows a surface
        to sit on so they are visibly buttons rather than glyphs.
      */}
      {currentDay && (
        <div className="mt-6 flex items-center justify-between gap-2 rounded-[0.75rem] border border-hairline bg-[var(--surface-sunken)] p-1">
          <button
            type="button"
            disabled={!canGoBack || isBusy}
            onClick={() => goToDay(addDays(currentDay, -1))}
            aria-label={t('prevDay')}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.5rem] text-ink-faint transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--accent-text)] disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft aria-hidden className="h-4 w-4" />
          </button>
          <p className="min-w-0 truncate text-center text-[0.875rem] font-medium capitalize text-ink">
            {formatDayLabel(currentDay, locale)}
          </p>
          <button
            type="button"
            disabled={isBusy}
            onClick={() => goToDay(addDays(currentDay, 1))}
            aria-label={t('nextDay')}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.5rem] text-ink-faint transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--accent-text)] disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronRight aria-hidden className="h-4 w-4" />
          </button>
        </div>
      )}

      {phase.step === 'loading' && (
        <p className="mt-4 text-[0.875rem] text-ink-muted">{t('loadingSlots')}</p>
      )}

      {phase.step === 'error' && (
        <p
          role="alert"
          className="mt-4 rounded-[0.625rem] border border-[var(--accent-hairline)] bg-[var(--accent-soft)] px-3.5 py-2.5 text-[0.875rem] leading-relaxed text-[var(--accent-text)]"
        >
          {phase.message}
        </p>
      )}

      {(phase.step === 'slots' || phase.step === 'confirming') && (
        <>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:gap-2.5">
            {phase.step === 'slots' && phase.slots.length === 0 && (
              <p className="col-span-full text-[0.875rem] text-ink-muted">
                {t('noSlots')}
              </p>
            )}
            {(phase.step === 'slots' ? phase.slots : [phase.slot]).map((slot) => (
              <button
                key={slot.start}
                type="button"
                disabled={phase.step === 'confirming'}
                onClick={() => setSelectedSlot(slot)}
                /*
                  The selected slot is the accent gradient with white text.
                  It was previously the flat accent with `--color-neutro-oscuro`
                  text on it, which is a near-black on mid-violet pairing that
                  does not reach 4.5:1 — the one state in this flow the visitor
                  most needs to read. White on the same fill clears it.

                  `aria-pressed` is what actually communicates the selection:
                  colour alone left screen-reader users with no way to tell
                  which of eight identical time buttons was chosen.
                */
                aria-pressed={selectedSlot?.start === slot.start}
                className={cn(
                  'flex min-h-11 items-center justify-center rounded-[0.5rem] border px-2 text-[0.875rem] font-medium tabular-nums',
                  'transition-[background-color,border-color,color,box-shadow] duration-200',
                  'disabled:pointer-events-none disabled:opacity-55 lg:text-[0.9375rem]',
                  selectedSlot?.start === slot.start
                    ? [
                        'border-[color-mix(in_srgb,var(--color-acento)_70%,white_30%)] text-white',
                        'bg-[linear-gradient(to_bottom,color-mix(in_srgb,var(--color-acento)_92%,white)_0%,var(--color-acento)_100%)]',
                        'shadow-[inset_0_1px_0_color-mix(in_srgb,white_28%,transparent),var(--shadow-accent)]',
                      ].join(' ')
                    : [
                        'border-hairline bg-[var(--surface-sunken)] text-ink',
                        'hover:border-[var(--accent-hairline)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent-text)]',
                      ].join(' '),
                )}
              >
                {formatSlotTime(slot.start, locale)}
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

      {/*
        The confirmation is the payoff of the whole flow, so it lands as a
        marked state rather than as two more paragraphs: an accent-washed
        inset with a ticked glyph. Without it, a visitor who has just given
        their details gets no visual acknowledgement that anything happened.
      */}
      {phase.step === 'confirmed' && (
        <div
          role="status"
          className="mt-6 rounded-[0.875rem] border border-[var(--accent-hairline)] bg-[var(--accent-soft)] p-5"
        >
          <span
            aria-hidden
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--accent-hairline)] bg-[color-mix(in_srgb,var(--color-acento)_18%,transparent)]"
          >
            <Check className="h-[1.125rem] w-[1.125rem] text-[var(--accent-text)]" strokeWidth={2.25} />
          </span>

          <p className="mt-4 text-[1.0625rem] font-semibold tracking-[-0.015em] text-ink">
            {t('confirmedTitle')}
          </p>
          <p className="mt-1.5 text-[0.875rem] leading-relaxed text-ink-muted">
            {t('confirmedBody')}
          </p>

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
