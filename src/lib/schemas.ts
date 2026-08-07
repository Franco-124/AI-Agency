import { z } from 'zod'

/**
 * The landing has a single lead form. This schema is the trust boundary: the
 * client-side rules in `LeadForm` mirror it for UX, but this is what actually
 * guards the endpoint.
 */

const WHATSAPP_PATTERN = /^[+()\d][\d\s()+-]{6,19}$/

const requiredText = (max: number) =>
  z.string().trim().min(1, 'required').max(max, 'tooLong')

export const leadSchema = z.object({
  name: requiredText(120),
  business: requiredText(160),
  industry: requiredText(160),
  whatsapp: z
    .string()
    .trim()
    .min(1, 'required')
    .max(24, 'tooLong')
    .regex(WHATSAPP_PATTERN, 'invalidWhatsapp'),
  email: z.string().trim().min(1, 'required').max(180).pipe(z.email('invalidEmail')),
  message: z.string().trim().min(10, 'tooShort').max(4000, 'tooLong'),
})

export type Lead = z.infer<typeof leadSchema>
