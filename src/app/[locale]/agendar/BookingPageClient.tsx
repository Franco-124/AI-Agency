'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

import {
  BookingCalendarPanel,
  type FallbackReason,
} from '@/components/forms/BookingCalendarPanel'
import { useRouter } from '@/i18n/navigation'
import { forgetBookingHandoff, readBookingHandoff, type BookingHandoff } from '@/lib/booking-handoff'

/** Mirrors the `notes` cap in `bookingRequestSchema`, which mirrors the booking service's own. */
const NOTES_MAX_LENGTH = 2000

/** Pure read — safe to call twice (React Strict Mode re-invokes `useState` initializers in dev). */
function resolveHandoff(): BookingHandoff | null {
  if (typeof window === 'undefined') return null
  return readBookingHandoff() ?? null
}

/**
 * Thin client wrapper around `BookingCalendarPanel` for this page only:
 * `onCancel` needs `useRouter` (a client-only hook), and a Server Component
 * cannot pass a closure as a prop to a Client Component, so the panel itself
 * cannot be mounted directly from `page.tsx`.
 *
 * Also resolves any hand-off left by `LeadForm` (session storage — see
 * `lib/booking-handoff.ts`). `BookingCalendarPanel` only reads its `initial*`
 * props once, into `useForm`'s `defaultValues`, so they must be known on its
 * very first render — a `useState` lazy initializer resolves them
 * synchronously on that first render, unlike an effect which would only
 * update them a render later (arriving too late for `useForm`).
 */
export function BookingPageClient() {
  const router = useRouter()
  const tFields = useTranslations('leadForm')
  const [handoff] = useState<BookingHandoff | null>(resolveHandoff)
  /** Guards against a double `onNoAvailability` call (Strict Mode, or the visitor paging back to today). */
  const notifiedRef = useRef(false)

  // Clearing storage is a side effect, kept out of the initializer above:
  // removing an already-removed key is a harmless no-op, so Strict Mode's
  // development-only double-invoke of that initializer can't race it into
  // silently discarding the hand-off before it's read.
  useEffect(() => {
    forgetBookingHandoff()
  }, [])

  // Capped at the booking service's own `notes` limit (see
  // `bookingRequestSchema`): the lead's message alone can run to 4000
  // characters, which would otherwise be rejected upstream as a 422.
  const notes = handoff
    ? [
        `Nicho: ${handoff.industry}`,
        `Interés: ${tFields(`interestOptions.${handoff.interest}`)}`,
        handoff.message ? `Mensaje: ${handoff.message}` : null,
      ]
        .filter(Boolean)
        .join('\n')
        .slice(0, NOTES_MAX_LENGTH)
    : undefined

  /*
   * The calendar is meant to be self-service — the visitor picks their own
   * slot, nobody on the team has to reach out. That only holds while the
   * calendar can actually take the booking. When it can't (nothing open, or
   * the booking service refusing), a person has to pick this up, so the
   * team is emailed the lead's details.
   *
   * Returns whether that was possible: a visitor who came straight from the
   * hero never filled the qualification form, so there is no hand-off and
   * nothing to email — the panel then points them at WhatsApp instead of
   * promising a follow-up that would never come.
   */
  const handleFallback = (reason: FallbackReason): boolean => {
    if (!handoff) return false
    if (notifiedRef.current) return true
    notifiedRef.current = true

    fetch('/api/contact/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...handoff, fallbackReason: reason }),
    }).catch((error) => {
      console.error('Fallback notification failed:', error)
    })

    return true
  }

  return (
    <BookingCalendarPanel
      onCancel={() => router.push('/')}
      onFallback={handleFallback}
      initialName={handoff?.name}
      initialPhone={handoff?.whatsapp}
      initialEmail={handoff?.email}
      notes={notes}
    />
  )
}
