'use client'

import { CheckCircle2, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useId, useState } from 'react'
import { useForm, type RegisterOptions } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import type { ApiResponse } from '@/lib/api'

import { Field } from './Field'

type Status = 'idle' | 'submitting' | 'success' | 'error'

type FormValues = {
  name: string
  business: string
  industry: string
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

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const result = (await response.json()) as ApiResponse<unknown>

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? 'request_failed')
      }

      setStatus('success')
      reset()
    } catch (error) {
      console.error('Lead submission failed:', error)
      setStatus('error')
    }
  })

  if (status === 'success') {
    return (
      <div
        role="status"
        className="flex items-start gap-4 rounded-xl border border-[var(--accent-hairline)] bg-[var(--accent-soft)] p-7"
      >
        <CheckCircle2
          aria-hidden
          className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-acento)]"
        />
        <p className="text-[0.9375rem] leading-relaxed text-ink">{t('success')}</p>
      </div>
    )
  }

  return (
    <form
      action="/api/contact"
      method="POST"
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
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

        <Field
          id={`${prefix}-business`}
          label={tFields('business')}
          error={messageFor(errors.business?.message)}
        >
          {(props) => (
            <input
              type="text"
              autoComplete="organization"
              {...props}
              {...register('business', requiredText(160))}
            />
          )}
        </Field>
      </div>

      {/* Deliberately before the contact details: it is the field that tells the
          team fastest whether the lead matches a known niche. */}
      <Field
        id={`${prefix}-industry`}
        label={tFields('industry')}
        error={messageFor(errors.industry?.message)}
      >
        {(props) => (
          <input type="text" {...props} {...register('industry', requiredText(160))} />
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
          <textarea
            rows={5}
            placeholder={tFields('messagePlaceholder')}
            {...props}
            {...register('message', {
              required: 'required',
              minLength: { value: 10, message: 'tooShort' },
              maxLength: { value: 4000, message: 'tooLong' },
            })}
          />
        )}
      </Field>

      <div className="mt-2 flex flex-col gap-4">
        <Button type="submit" size="lg" block disabled={status === 'submitting'}>
          {status === 'submitting' ? (
            <>
              <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
              {t('sending')}
            </>
          ) : (
            tFields('submit')
          )}
        </Button>

        {/* Sets the expectation that a person follows up — there is no live
            booking calendar behind this form. */}
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
