import { useTranslations } from 'next-intl'

import { NumiMark } from '@/components/brand/NumiMark'
import { Section } from '@/components/layout/Section'
import { Reveal } from '@/components/motion/Reveal'
import { sectionIds } from '@/lib/site'
import { cn } from '@/lib/utils'

const itemKeys = ['one', 'two', 'three', 'four'] as const

type ColumnProps = {
  title: string
  items: readonly string[]
  variant: 'before' | 'after'
}

function Column({ title, items, variant }: ColumnProps) {
  const isAfter = variant === 'after'

  return (
    <div
      className={cn(
        'relative flex h-full flex-col rounded-xl border p-7 sm:p-9',
        isAfter
          ? 'border-hairline-strong bg-[var(--color-primario)]'
          : 'border-hairline bg-transparent',
      )}
    >
      {isAfter ? (
        <span
          aria-hidden
          className="accent-rule absolute inset-x-7 top-0 sm:inset-x-9"
        />
      ) : null}

      <h2
        className={cn(
          'text-sm font-medium uppercase tracking-[0.16em]',
          isAfter ? 'text-[var(--color-acento)]' : 'text-ink-faint',
        )}
      >
        {title}
      </h2>

      <ul className="mt-8 flex flex-col gap-6">
        {items.map((item) => (
          <li key={item} className="flex gap-4">
            {isAfter ? (
              <NumiMark
                className="mt-1 h-4 w-4 shrink-0 text-[var(--color-acento)]"
              />
            ) : (
              <span
                aria-hidden
                className="mt-3 h-px w-4 shrink-0 bg-[var(--surface-border-strong)]"
              />
            )}
            <p
              className={cn(
                'text-[0.9375rem] leading-relaxed sm:text-base',
                isAfter ? 'text-ink' : 'text-ink-faint',
              )}
            >
              {item}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Contrast() {
  const t = useTranslations('contrast')

  const before = itemKeys.map((key) => t(`before.${key}`))
  const after = itemKeys.map((key) => t(`after.${key}`))

  return (
    <Section id={sectionIds.contrast} divided={false}>
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <Reveal className="h-full">
          <Column title={t('beforeTitle')} items={before} variant="before" />
        </Reveal>
        <Reveal className="h-full" delay={0.08}>
          <Column title={t('afterTitle')} items={after} variant="after" />
        </Reveal>
      </div>

      <Reveal delay={0.16} className="mt-16 lg:mt-20">
        <span aria-hidden className="accent-rule block w-24" />
        <p className="mt-8 max-w-4xl text-balance text-2xl font-semibold leading-[1.25] tracking-tight sm:text-3xl lg:text-[2.5rem]">
          {t('closing')}
        </p>
      </Reveal>
    </Section>
  )
}
