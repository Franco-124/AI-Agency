'use client'

import { ArrowRight } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useId } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { Field } from '@/components/forms/Field'
import { Button } from '@/components/ui/button'
import {
  calcularAhorroEstimado,
  calcularMesesParaPagarse,
  formatCOP,
} from '@/lib/calculadora-ahorro/calcular'
import { sectionIds } from '@/lib/site'

type FormValues = {
  salarioPromedioMensual: string
  horasMensualesTareasRepetitivas: string
}

/**
 * Client-side engagement tool, not a lead form: calculation is 100% local,
 * nothing is submitted anywhere. Lives inside the packages panel rather than
 * as its own section — it is a way to size up a package, not a separate
 * pitch.
 */
export function CalculadoraAhorro() {
  const t = useTranslations('savingsCalculator')
  const locale = useLocale()
  const prefix = useId()

  const { register, control } = useForm<FormValues>({
    defaultValues: { salarioPromedioMensual: '', horasMensualesTareasRepetitivas: '' },
  })

  const values = useWatch({ control })

  const { ahorroMensualEstimado, ahorroAnualEstimado } = calcularAhorroEstimado({
    salarioPromedioMensual: Number(values.salarioPromedioMensual) || 0,
    horasMensualesTareasRepetitivas: Number(values.horasMensualesTareasRepetitivas) || 0,
  })

  const hasResult = ahorroMensualEstimado > 0
  const mesesParaPagarse = calcularMesesParaPagarse(ahorroMensualEstimado)

  return (
    <div className="surface-panel rounded-[1.125rem] p-6 sm:p-8">
      <h3 className="text-[1.0625rem] font-semibold leading-snug tracking-[-0.02em] sm:text-lg">
        {t('title')}
      </h3>
      <p className="type-body mt-2.5">{t('lead')}</p>

      <form className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field id={`${prefix}-salario`} label={t('salarioLabel')}>
          {(props) => (
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={50000}
              placeholder={t('salarioPlaceholder')}
              {...props}
              {...register('salarioPromedioMensual')}
            />
          )}
        </Field>

        <Field id={`${prefix}-horas`} label={t('horasLabel')}>
          {(props) => (
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              placeholder={t('horasPlaceholder')}
              {...props}
              {...register('horasMensualesTareasRepetitivas')}
            />
          )}
        </Field>
      </form>

      {/*
        The output is now a distinct inset panel rather than two more rows of
        the same column. This is the moment the tool actually pays off, and it
        previously looked identical to the labels above it — so the two figures
        read as more copy instead of as a result the visitor produced.

        `aria-live="polite"` is the substantive part: the numbers change as the
        visitor types, with no submit to announce them, so without it a screen
        reader user gets no result at all. `aria-atomic` makes the pair read as
        one figure rather than as two unrelated updates.
      */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="mt-7 rounded-[0.875rem] border border-hairline bg-[var(--surface-sunken)] p-5 shadow-[inset_0_1px_0_color-mix(in_srgb,white_4%,transparent)] sm:p-6"
      >
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
          <div>
            <p className="type-eyebrow">{t('monthlyLabel')}</p>
            <p className="type-figure mt-2.5 text-[1.625rem] leading-none text-[var(--accent-text)] sm:text-[1.875rem]">
              {hasResult ? formatCOP(ahorroMensualEstimado, locale) : '—'}
            </p>
          </div>
          {/* Ruled off from the monthly figure on wide layouts, so the pair
              reads as two columns of one result rather than two results. */}
          <div className="sm:border-l sm:border-hairline-subtle sm:pl-6">
            <p className="type-eyebrow">{t('yearlyLabel')}</p>
            <p className="type-figure mt-2.5 text-[1.625rem] leading-none text-[var(--accent-text)] sm:text-[1.875rem]">
              {hasResult ? formatCOP(ahorroAnualEstimado, locale) : '—'}
            </p>
          </div>
        </div>

        <p className="type-body mt-5 border-t border-hairline-subtle pt-5 text-[0.9375rem]">
          {mesesParaPagarse !== null
            ? t('paybackLine', { months: mesesParaPagarse })
            : t('paybackEmpty')}
        </p>
      </div>

      {/* Visible on purpose — not fine print. Covers both results above. */}
      <p className="mt-5 text-[0.8125rem] leading-relaxed text-ink-faint">
        {t('disclaimer')}
      </p>

      <Button asChild size="lg" variant="outline" block className="mt-6 sm:w-auto">
        <a href={`#${sectionIds.finalCta}`}>
          {t('cta')}
          <ArrowRight
            aria-hidden
            className="h-4 w-4 transition-transform duration-200 ease-[var(--ease-emphasis)] group-hover/btn:translate-x-0.5"
          />
        </a>
      </Button>
    </div>
  )
}
