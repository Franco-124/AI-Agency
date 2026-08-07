'use client'

import { CheckCircle2, ChevronDown, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useId, useState } from 'react'
import { useForm, useWatch, type RegisterOptions } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import type { ApiResponse } from '@/lib/api'
import { forgetPackageInterest, readPackageInterest } from '@/lib/package-interest'
import { cn } from '@/lib/utils'

import { Field } from './Field'

type Status = 'idle' | 'submitting' | 'success' | 'error'

/**
 * `industry` reaches the API as a single string, exactly as before. The form
 * splits it into a picker plus an optional free-text field purely for input UX:
 * most visitors belong to one of the niches the page already lists, and typing
 * that out is friction.
 */
type FormValues = {
  name: string
  business: string
  industryChoice: string
  industryOther: string
  whatsapp: string
  email: string
  message: string
}

/** Mirrors `leadSchema`, which is the trust boundary for these fields. */
type LeadPayload = {
  name: string
  business: string
  industry: string
  whatsapp: string
  email: string
  message: string
  packageInterest?: string
}

/** Kept in sync with the niches section — the picker offers what the page sells. */
const nicheKeys = ['one', 'two', 'three', 'four', 'five'] as const

const OTHER = 'other'

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
  const tNiches = useTranslations('niches')
  const tPackages = useTranslations('packages')
  const [status, setStatus] = useState<Status>('idle')
  /** Kept after `reset()` so the confirmation can address the visitor by name. */
  const [submittedName, setSubmittedName] = useState('')
  const prefix = useId()

  const {
    register,
    handleSubmit,
    reset,
    control,
    getValues,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({
    mode: 'onBlur',
    defaultValues: { industryChoice: '', industryOther: '' },
  })

  /*
   * `useWatch` rather than `watch()`: the latter subscribes while rendering,
   * which the React Compiler flags as an unsafe library call.
   */
  const isOtherIndustry =
    useWatch({ control, name: 'industryChoice' }) === OTHER

  /** The picker stores niche keys; the API receives the human-readable label. */
  const industryValue = (values: FormValues) =>
    values.industryChoice === OTHER
      ? values.industryOther
      : tNiches(`items.${values.industryChoice}`)

  const industryField = register('industryChoice', { required: 'required' })

  /** Maps the shared error codes onto the localized copy. */
  const messageFor = (code?: string) => {
    if (!code) return undefined
    const known = ['required', 'invalidEmail', 'invalidWhatsapp', 'tooShort', 'tooLong']
    return known.includes(code) ? t(code) : t('required')
  }

  /**
   * Read at submit time rather than on mount: the visitor may click a package
   * card after the form has already rendered, and this way there is no extra
   * state or subscription just to carry one optional label.
   */
  const packageInterestLabel = () => {
    const key = readPackageInterest()

    return key ? tPackages(`${key}.name`) : undefined
  }

  const onSubmit = handleSubmit(async (values) => {
    setStatus('submitting')

    const payload: LeadPayload = {
      name: values.name,
      business: values.business,
      industry: industryValue(values),
      whatsapp: values.whatsapp,
      email: values.email,
      message: values.message,
      packageInterest: packageInterestLabel(),
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

      // Only the first name: the full legal name in a thank-you reads cold.
      setSubmittedName(values.name.split(' ')[0] ?? values.name)
      setStatus('success')
      reset()
      forgetPackageInterest()
    } catch (error) {
      console.error('Lead submission failed:', error)
      setStatus('error')
    }
  })

  if (status === 'success') {
    return (
      <div
        role="status"
        className="relative overflow-hidden rounded-xl border border-[var(--accent-hairline)] bg-[var(--accent-soft)] p-7 motion-safe:animate-[greeting-in_420ms_var(--ease-entrance)_both]"
      >
        {/* The brand rule draws across the top edge as the panel lands. */}
        <span
          aria-hidden
          className="accent-rule absolute inset-x-0 top-0 origin-left motion-safe:animate-[rule-grow_700ms_var(--ease-entrance)_120ms_both]"
        />

        <div className="flex items-start gap-4">
          <CheckCircle2
            aria-hidden
            className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-acento)] motion-safe:animate-[check-pop_520ms_var(--ease-entrance)_140ms_both]"
          />
          <div>
            <p className="text-[0.9375rem] font-semibold leading-relaxed text-ink">
              {t('successNamed', { name: submittedName })}
            </p>
            <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-muted">
              {t('successDetail')}
            </p>

            {/* A visitor with a second, unrelated case should not have to
                reload the page to describe it. The fields were already
                cleared on submit, so this only puts the form back on screen. */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-5"
              onClick={() => setStatus('idle')}
            >
              {tFields('again')}
            </Button>
          </div>
        </div>
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
        error={messageFor(errors.industryChoice?.message)}
      >
        {(props) => (
          <div className="relative">
            <select
              {...props}
              {...industryField}
              onChange={(event) => {
                industryField.onChange(event)

                // Leaving "other" behind must not keep its value or its error.
                if (event.target.value !== OTHER) {
                  setValue('industryOther', '')
                  clearErrors('industryOther')
                }
              }}
              className={cn(
                props.className,
                // Native arrow removed in favour of the site's own chevron.
                'cursor-pointer appearance-none pr-11',
                // Some platforms paint the open list from the control's colours.
                '[&>option]:bg-[var(--color-neutro-oscuro)] [&>option]:text-ink',
              )}
            >
              <option value="" disabled>
                {tFields('industryPlaceholder')}
              </option>
              {nicheKeys.map((key) => (
                <option key={key} value={key}>
                  {tNiches(`items.${key}`)}
                </option>
              ))}
              <option value={OTHER}>{tFields('industryOptionOther')}</option>
            </select>

            <ChevronDown
              aria-hidden
              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
            />
          </div>
        )}
      </Field>

      {/* Progressive disclosure: only asked for when the picker cannot answer. */}
      {isOtherIndustry ? (
        <Field
          id={`${prefix}-industry-other`}
          label={tFields('industryOther')}
          error={messageFor(errors.industryOther?.message)}
          className="motion-safe:animate-[greeting-in_240ms_ease-out]"
        >
          {(props) => (
            <input
              type="text"
              autoFocus
              placeholder={tFields('industryOtherPlaceholder')}
              {...props}
              {...register('industryOther', {
                setValueAs: (value: string) => value?.trim() ?? '',
                validate: (value) =>
                  getValues('industryChoice') !== OTHER ||
                  String(value).trim().length > 0 ||
                  'required',
                maxLength: { value: 160, message: 'tooLong' },
              })}
            />
          )}
        </Field>
      ) : null}

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
