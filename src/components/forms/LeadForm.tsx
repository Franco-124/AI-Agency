'use client'

import { ChevronDown, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useId, useState } from 'react'
import { useForm, useWatch, type RegisterOptions } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { useRouter } from '@/i18n/navigation'
import {
  ADVISORY_INTEREST_EVENT,
  forgetAdvisoryInterest,
  readAdvisoryInterest,
  type AdvisoryInterestKey,
} from '@/lib/advisory-interest'
import type { ApiResponse } from '@/lib/api'
import { rememberBookingHandoff } from '@/lib/booking-handoff'
import { forgetPackageInterest, readPackageInterest } from '@/lib/package-interest'
import type { Lead } from '@/lib/schemas'
import { cn } from '@/lib/utils'

import { Field } from './Field'

type Status = 'idle' | 'submitting' | 'error'

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
  interest: string
  whatsapp: string
  email: string
  message: string
}

/** Kept in sync with the niches section — the picker offers what the page sells. */
const nicheKeys = ['one', 'two', 'three', 'four', 'five'] as const

/** Mirrors `interestKeys` in `src/lib/schemas.ts`. */
const interestKeys = ['automation', 'diagnostic', 'training', 'unsure'] as const

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

const optionalText = (max: number): RegisterOptions<FormValues> => ({
  setValueAs: (value: string) => value?.trim() ?? '',
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
  const router = useRouter()
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
    defaultValues: { industryChoice: '', industryOther: '', interest: '' },
  })

  /*
   * Only the two Advisory offers pre-fill the message — the visitor already
   * told us which one they want by clicking its CTA, so there is nothing left
   * to type. The three packages deliberately do not do this: "no fit" is a
   * real answer there, and a package name alone is not a useful message.
   *
   * The landing is a single page, so this form is already mounted by the time
   * the visitor clicks a card CTA further up — reading session storage once on
   * mount would only catch a visitor who arrives with it already set. A
   * same-tab custom event covers the actual case: click happens after mount,
   * on any device, no hover or navigation involved.
   */
  useEffect(() => {
    const applyAdvisoryInterest = (key: AdvisoryInterestKey) => {
      setValue('interest', key, { shouldValidate: true })
      setValue('message', tFields(`messagePrefill.${key}`), { shouldValidate: true })
    }

    const stored = readAdvisoryInterest()
    if (stored) {
      applyAdvisoryInterest(stored)
      forgetAdvisoryInterest()
    }

    const onAdvisoryInterest = (event: Event) => {
      const key = (event as CustomEvent<AdvisoryInterestKey>).detail
      applyAdvisoryInterest(key)
      forgetAdvisoryInterest()
    }

    window.addEventListener(ADVISORY_INTEREST_EVENT, onAdvisoryInterest)
    return () => window.removeEventListener(ADVISORY_INTEREST_EVENT, onAdvisoryInterest)
  }, [setValue, tFields])

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

    // The `interest` picker only ever offers `interestKeys` values, so the
    // cast is safe — react-hook-form itself has no way to type a select's
    // value narrower than `string`.
    const payload: Lead = {
      name: values.name,
      business: values.business || undefined,
      industry: industryValue(values),
      interest: values.interest as Lead['interest'],
      whatsapp: values.whatsapp,
      email: values.email,
      message: values.message || undefined,
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

      reset()
      forgetPackageInterest()

      // The lead is already saved (`saveLead`, above) — this is only handed
      // to the calendar page so it can pre-fill the contact fields and, if
      // the calendar turns out to have nothing open, email the team the
      // same data instead of leaving the lead to book itself.
      rememberBookingHandoff(payload)

      // Straight to the booking panel: no intermediate confirmation screen
      // to read, the calendar itself is the confirmation that something
      // happened.
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
          label={tFields('businessOptional')}
          error={messageFor(errors.business?.message)}
        >
          {(props) => (
            <input
              type="text"
              autoComplete="organization"
              {...props}
              {...register('business', optionalText(160))}
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

      {/* Segments the lead before it reaches the CRM, so it lands already
          classified instead of needing to be triaged after the fact. */}
      <Field
        id={`${prefix}-interest`}
        label={tFields('interest')}
        error={messageFor(errors.interest?.message)}
      >
        {(props) => (
          <div className="relative">
            <select
              {...props}
              {...register('interest', { required: 'required' })}
              defaultValue=""
              className={cn(
                props.className,
                'cursor-pointer appearance-none pr-11',
                '[&>option]:bg-[var(--color-neutro-oscuro)] [&>option]:text-ink',
              )}
            >
              <option value="" disabled>
                {tFields('interestPlaceholder')}
              </option>
              {interestKeys.map((key) => (
                <option key={key} value={key}>
                  {tFields(`interestOptions.${key}`)}
                </option>
              ))}
            </select>

            <ChevronDown
              aria-hidden
              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
            />
          </div>
        )}
      </Field>

      <Field
        id={`${prefix}-message`}
        label={tFields('messageOptional')}
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
                setValueAs: (value: string) => value?.trim() ?? '',
                validate: (value) =>
                  String(value).trim().length === 0 || String(value).trim().length >= 10
                    ? true
                    : 'tooShort',
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
