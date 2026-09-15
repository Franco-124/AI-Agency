'use client'

import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useId, useState } from 'react'
import { useForm, type RegisterOptions } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { useRouter } from '@/i18n/navigation'
import type { ApiResponse } from '@/lib/api'
import { rememberBookingHandoff } from '@/lib/booking-handoff'
import type { Lead } from '@/lib/schemas'

import { Field } from './Field'

type Status = 'idle' | 'submitting' | 'error'

/**
 * Four fields: who you are, two ways to reach you, and what you need.
 *
 * The form used to also ask for a business name, a vertical picker (with a
 * free-text escape hatch when the picker could not answer) and an interest
 * picker, so that leads arrived pre-segmented. That was seven controls and two
 * native selects standing between a visitor and telling us what they want, and
 * the message field — the only one that says anything a human could act on —
 * was the one marked optional. The segmentation is now the team's job on the
 * follow-up call, where it costs the visitor nothing.
 */
type FormValues = {
  name: string
  whatsapp: string
  email: string
  message: string
}

/**
 * Client-side rules mirror `src/lib/schemas.ts`, which is what actually guards
 * the endpoint. They are kept as plain react-hook-form rules on purpose: the
 * validation library stays server-only, so the landing does not ship it to
 * every visitor. The server remains the single source of truth.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const WHATSAPP_PATTERN = /^[+()\d][\d\s()+-]{6,19}$/

const requiredText = (max: number): RegisterOptions<FormValues> => ({
  required: 'required',
  setValueAs: (value: string) => value?.trim() ?? '',
  validate: (value) => (String(value).trim().length > 0 ? true : 'required'),
  maxLength: { value: max, message: 'tooLong' },
})

/**
 * The landing's only contact form. It covers both intents — booking a call and
 * describing a case that does not match a package — so visitors never have to
 * choose between two competing forms.
 */
export function LeadForm() {
  const t = useTranslations('form')
  const tFields = useTranslations('leadForm')
  const [status, setStatus] = useState<Status>('idle')
  const router = useRouter()
  const prefix = useId()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ mode: 'onBlur' })

  /** Maps the shared error codes onto the localized copy. */
  const messageFor = (code?: string) => {
    if (!code) return undefined
    const known = ['required', 'invalidEmail', 'invalidWhatsapp', 'tooShort', 'tooLong']
    return known.includes(code) ? t(code) : t('required')
  }

  const onSubmit = handleSubmit(async (values) => {
    setStatus('submitting')

    const payload: Lead = {
      name: values.name,
      whatsapp: values.whatsapp,
      email: values.email,
      message: values.message,
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = (await response.json()) as ApiResponse<unknown>

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? 'request_failed')
      }

      reset()

      // The lead is already saved (`saveLead`, above) — this is only handed
      // to the calendar page so it can pre-fill the contact fields and, if
      // the calendar turns out to have nothing open, email the team the
      // same data instead of leaving the lead to book itself.
      rememberBookingHandoff(payload)

      // Straight to the booking panel: no intermediate confirmation screen
      // to read, the calendar itself is the confirmation that something
      // happened.
      //
      // Released before navigating, not after: `router.push` is a client
      // navigation that may be slow, blocked, or reversed with Back, and this
      // component survives all three. Leaving the status at `submitting`
      // stranded the form with a spinning, permanently disabled button.
      setStatus('idle')
      router.push('/agendar#reserva')
    } catch (error) {
      console.error('Lead submission failed:', error)
      setStatus('error')
    }
  })

  return (
    <form
      action="/api/contact"
      method="POST"
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-5"
    >
      <Field
        id={`${prefix}-name`}
        label={tFields('name')}
        error={messageFor(errors.name?.message)}
      >
        {(props) => (
          <input
            type="text"
            autoComplete="name"
            {...props}
            {...register('name', requiredText(120))}
          />
        )}
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id={`${prefix}-whatsapp`}
          label={tFields('whatsapp')}
          error={messageFor(errors.whatsapp?.message)}
        >
          {(props) => (
            <input
              type="tel"
              autoComplete="tel"
              {...props}
              {...register('whatsapp', {
                required: 'required',
                pattern: { value: WHATSAPP_PATTERN, message: 'invalidWhatsapp' },
                maxLength: { value: 24, message: 'tooLong' },
              })}
            />
          )}
        </Field>

        <Field
          id={`${prefix}-email`}
          label={tFields('email')}
          error={messageFor(errors.email?.message)}
        >
          {(props) => (
            <input
              type="email"
              autoComplete="email"
              {...props}
              {...register('email', {
                required: 'required',
                pattern: { value: EMAIL_PATTERN, message: 'invalidEmail' },
                maxLength: { value: 180, message: 'tooLong' },
              })}
            />
          )}
        </Field>
      </div>

      <Field
        id={`${prefix}-message`}
        label={tFields('message')}
        error={messageFor(errors.message?.message)}
      >
        {(props) => (
          <>
            <textarea
              rows={5}
              placeholder={tFields('messagePlaceholder')}
              {...props}
              aria-describedby={[props['aria-describedby'], `${props.id}-hint`].filter(Boolean).join(' ')}
              {...register('message', {
                required: 'required',
                setValueAs: (value: string) => value?.trim() ?? '',
                /*
                 * Required now, and still floored at 10 characters. This is
                 * the only field left that says what the visitor wants, so
                 * "hola" reaching the team is the failure this guards against.
                 */
                validate: (value) =>
                  String(value).trim().length >= 10 ? true : 'tooShort',
                maxLength: { value: 4000, message: 'tooLong' },
              })}
            />
            <p id={`${props.id}-hint`} className="text-xs text-ink-faint">
              {tFields('messageHint')}
            </p>
          </>
        )}
      </Field>

      <div className="mt-2 flex flex-col gap-4">
        <Button
          type="submit"
          variant="solid"
          size="lg"
          block
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? (
            <>
              <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
              {t('sending')}
            </>
          ) : (
            tFields('submit')
          )}
        </Button>

        {/* Sets the expectation that a person follows up too — a successful
            submit also redirects to /agendar, but that is a bonus, not a
            replacement for the team reaching out. */}
        <p className="text-[0.8125rem] leading-relaxed text-[color-mix(in_srgb,var(--color-neutro-claro)_60%,transparent)]">
          {tFields('note')}
        </p>

        <p aria-live="polite" className="text-sm">
          {status === 'submitting' ? (
            <span className="text-ink-faint">{t('loading')}</span>
          ) : null}
          {status === 'error' ? (
            <span className="text-[var(--color-acento)]">{t('error')}</span>
          ) : null}
        </p>
      </div>
    </form>
  )
}
