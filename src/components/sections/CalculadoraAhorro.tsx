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
    <div className="rounded-2xl border border-hairline bg-[color-mix(in_srgb,var(--color-primario)_88%,transparent)] p-7 sm:p-9">
      <h3 className="text-lg font-semibold leading-snug tracking-[-0.02em]">{t('title')}</h3>
      <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-muted">{t('lead')}</p>

      <form className="mt-7 grid gap-5 sm:grid-cols-2">
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

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <div>
          <p className="text-sm text-ink-faint">{t('monthlyLabel')}</p>
          <p className="type-figure mt-2 text-2xl text-[var(--color-acento)] sm:text-[1.75rem]">
            {hasResult ? formatCOP(ahorroMensualEstimado, locale) : '—'}
          </p>
        </div>
        <div>
          <p className="text-sm text-ink-faint">{t('yearlyLabel')}</p>
          <p className="type-figure mt-2 text-2xl text-[var(--color-acento)] sm:text-[1.75rem]">
            {hasResult ? formatCOP(ahorroAnualEstimado, locale) : '—'}
          </p>
        </div>
      </div>

      <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-muted">
        {mesesParaPagarse !== null
          ? t('paybackLine', { months: mesesParaPagarse })
          : t('paybackEmpty')}
      </p>

      {/* Visible on purpose — not fine print. Covers both results above. */}
      <p className="mt-6 text-[0.8125rem] leading-relaxed text-ink-faint">{t('disclaimer')}</p>

      <Button asChild size="lg" variant="outline" className="mt-7">
        <a href={`#${sectionIds.finalCta}`}>
          {t('cta')}
          <ArrowRight
            aria-hidden
            className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-0.5"
          />
        </a>
      </Button>
    </div>
  )
}
