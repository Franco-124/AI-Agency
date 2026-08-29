import { z } from 'zod'

/**
 * The landing has a single lead form. This schema is the trust boundary: the
 * client-side rules in `LeadForm` mirror it for UX, but this is what actually
 * guards the endpoint.
 */

const WHATSAPP_PATTERN = /^[+()\d][\d\s()+-]{6,19}$/

const requiredText = (max: number) =>
  z.string().trim().min(1, 'required').max(max, 'tooLong')

/** Mirrors the "¿Qué te interesa?" picker options in `LeadForm`. */
export const interestKeys = ['automation', 'diagnostic', 'training', 'unsure'] as const

export const leadSchema = z.object({
  name: requiredText(120),
  business: z
    .string()
    .trim()
    .max(160, 'tooLong')
    .optional()
    .transform((value) => value || undefined),
  industry: requiredText(160),
  interest: z.enum(interestKeys, 'required'),
  whatsapp: z
    .string()
    .trim()
    .min(1, 'required')
    .max(24, 'tooLong')
    .regex(WHATSAPP_PATTERN, 'invalidWhatsapp'),
  email: z.string().trim().min(1, 'required').max(180).pipe(z.email('invalidEmail')),
  message: z
    .string()
    .trim()
    .max(4000, 'tooLong')
    .optional()
    .transform((value) => value || undefined),
  /**
   * Set only when the visitor reached the form from a specific package card.
   * Empty strings are normalised away so the column stays null instead of ''.
   */
  packageInterest: z
    .string()
    .trim()
    .max(160, 'tooLong')
    .optional()
    .transform((value) => value || undefined),
})

export type Lead = z.infer<typeof leadSchema>

/**
 * Guards the three contact fields collected by the hero's live booking
 * widget. Client-side rules in `BookingCalendarPanel` mirror this for UX;
 * the real trust boundary is `bookingRequestSchema`, used by the
 * `/api/booking/book` route.
 *
 * Email is required, not optional: the booking backend's reminder job
 * (`find_due_reminders` in numi-agent-demo) silently drops any appointment
 * with no `contact_email` — there is nowhere to send that reminder — so a
 * booking made without one never gets reminded. Always collecting it here is
 * what keeps that job from silently skipping appointments.
 */
export const bookingContactSchema = z.object({
  name: requiredText(120),
  whatsapp: z
    .string()
    .trim()
    .min(1, 'required')
    .max(24, 'tooLong')
    .regex(WHATSAPP_PATTERN, 'invalidWhatsapp'),
  email: z.string().trim().min(1, 'required').max(180).pipe(z.email('invalidEmail')),
})

export type BookingContact = z.infer<typeof bookingContactSchema>

/**
 * Trust boundary for `POST /api/booking/book`. Extends the contact fields
 * with the chosen slot's start time, which the widget sends verbatim from
 * whatever `GET /api/booking/availability` returned. `notes` is optional
 * pass-through context — set when `BookingCalendarPanel` is opened from the
 * long qualification form (`LeadForm`), absent when opened from the hero's
 * bare `DemoBookingWidget`.
 */
export const bookingRequestSchema = bookingContactSchema.extend({
  start: z.string().trim().min(1, 'required'),
  /**
   * Capped at 2000 to match `BookPayload.notes` on the booking service — its
   * own limit, confirmed against the live `/openapi.json`. A longer value
   * would pass here only to be rejected upstream as a 422.
   */
  notes: z
    .string()
    .trim()
    .max(2000, 'tooLong')
    .optional()
    .transform((value) => value || undefined),
})

export type BookingRequest = z.infer<typeof bookingRequestSchema>
