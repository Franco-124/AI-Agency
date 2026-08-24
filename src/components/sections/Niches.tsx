import {
  Dumbbell,
  Home,
  PawPrint,
  Stethoscope,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { Section, SectionHeading } from '@/components/layout/Section'
import { Reveal } from '@/components/motion/Reveal'
import { sectionIds } from '@/lib/site'
import { cn } from '@/lib/utils'

const niches: ReadonlyArray<{ key: string; Icon: LucideIcon; photo: string }> = [
  { key: 'one', Icon: Stethoscope, photo: '/images/16-niche-clinic.webp' },
  { key: 'two', Icon: Home, photo: '/images/17-niche-realestate.webp' },
  { key: 'three', Icon: PawPrint, photo: '/images/18-niche-vet.webp' },
  { key: 'four', Icon: Wrench, photo: '/images/19-niche-mechanic.webp' },
  { key: 'five', Icon: Dumbbell, photo: '/images/20-niche-gym.webp' },
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
    <Section
      id={sectionIds.niches}
      labelledBy="nichos-titulo"
      divided={false}
      surface="texture"
      backgroundSrc="/images/14-niches-new.webp"
    >
      <Reveal>
        <SectionHeading id="nichos-titulo" title={t('title')} />
      </Reveal>

      <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {niches.map(({ key, Icon, photo }, index) => (
          <Reveal as="li" key={key} delay={index * 0.05} className="h-full">
            <div
              className={cn(
                'group relative flex h-full flex-col gap-3 overflow-hidden border-t-2 border-dashed border-[var(--surface-border-strong)] p-5',
                index % 2 === 0
                  ? 'bg-[color-mix(in_srgb,var(--color-primario)_55%,transparent)]'
                  : 'bg-transparent',
              )}
            >
              {/*
                A real photo of the vertical this card names — the clinic,
                the listing, the vet visit, the shop, the gym floor — so a
                reader recognizes their own business at a glance instead of
                reading five cards in identical icon-in-a-box language. Dim
                and desaturated by default; the scroll-reveal and hover both
                bring it into fuller color as a small reward for attention.
              */}
              <Image
                src={photo}
                alt=""
                aria-hidden
                fill
                sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw"
                className="-z-10 object-cover object-center opacity-45 grayscale transition-all duration-500 group-hover:opacity-70 group-hover:grayscale-0"
              />
              <div
                aria-hidden
                className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,var(--color-neutro-oscuro)_15%,color-mix(in_srgb,var(--color-neutro-oscuro)_35%,transparent)_100%)]"
              />

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
