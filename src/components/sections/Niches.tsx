import {
  Dumbbell,
  Home,
  PawPrint,
  Stethoscope,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Section, SectionHeading } from '@/components/layout/Section'
import { Reveal } from '@/components/motion/Reveal'
import { sectionIds } from '@/lib/site'
import { cn } from '@/lib/utils'

const niches: ReadonlyArray<{ key: string; Icon: LucideIcon }> = [
  { key: 'one', Icon: Stethoscope },
  { key: 'two', Icon: Home },
  { key: 'three', Icon: PawPrint },
  { key: 'four', Icon: Wrench },
  { key: 'five', Icon: Dumbbell },
]

/**
 * Five verticals as a strip of index cards, each with its own one-line hook —
 * "hecho para negocios como el tuyo" only holds up if a workshop owner and a
 * vet see a different sentence, not the same icon-in-a-box reused five times
 * with a swapped glyph. The dashed top edge reads as a ticket stub rather than
 * the bordered squares used for "Cómo trabajamos", so the two sections never
 * share a container language back to back.
 */
export function Niches() {
  const t = useTranslations('niches')

  return (
    <Section id={sectionIds.niches} labelledBy="nichos-titulo" divided={false}>
      <Reveal>
        <SectionHeading id="nichos-titulo" title={t('title')} />
      </Reveal>

      <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {niches.map(({ key, Icon }, index) => (
          <Reveal as="li" key={key} delay={index * 0.05} className="h-full">
            <div
              className={cn(
                'flex h-full flex-col gap-3 border-t-2 border-dashed border-[var(--surface-border-strong)] p-5',
                index % 2 === 0
                  ? 'bg-[color-mix(in_srgb,var(--color-primario)_55%,transparent)]'
                  : 'bg-transparent',
              )}
            >
              <Icon size={22} strokeWidth={1.5} aria-hidden="true" className="text-[var(--color-acento)]" />
              <span className="text-sm font-semibold leading-snug text-[var(--color-neutro-claro)]">
                {t(`items.${key}`)}
              </span>
              <p className="text-[0.8125rem] leading-relaxed text-ink-muted">
                {t(`hooks.${key}`)}
              </p>
            </div>
          </Reveal>
        ))}
      </ul>

      <Reveal delay={0.16} className="mt-12">
        <div className="flex items-start gap-5">
          <span aria-hidden className="mt-4 h-px w-10 shrink-0 bg-[var(--color-acento)]" />
          <p className="max-w-2xl text-lg leading-relaxed text-ink sm:text-xl">
            {t('closing')}
          </p>
        </div>
      </Reveal>
    </Section>
  )
}
