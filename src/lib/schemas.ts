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
