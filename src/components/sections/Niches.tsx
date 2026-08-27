import {
  Dumbbell,
  Home,
  PawPrint,
  Smile,
  Stethoscope,
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
  { key: 'four', Icon: Smile, photo: '/images/29-niche-dental.webp' },
  { key: 'five', Icon: Dumbbell, photo: '/images/20-niche-gym.webp' },
]

/**
 * Five verticals as a strip of portrait photo cards.
 *
 * "Hecho para negocios como el tuyo" only holds up if a dentist and a vet
 * recognise their own room, so each card is a real photograph of that
 * trade shot in the site's own register — near-black ambience, violet
 * practical light — rather than the same icon-in-a-box reused five times.
 * Because the photography already matches the palette, it runs at full
 * opacity and full colour; the copy sits over a gradient scrim instead of a
 * blanket dimming filter.
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
                'group relative flex h-full flex-col justify-end overflow-hidden rounded-xl',
                /* 5:6 rather than a taller portrait: the source photographs
                   are square, so this crops the least while still giving the
                   copy a stable block to sit in. */
                'aspect-[5/6] ring-1 ring-inset ring-hairline',
                'transition-[transform,box-shadow] duration-300 ease-[var(--ease-entrance)]',
                'hover:-translate-y-1.5 hover:shadow-[0_28px_70px_-40px_rgba(0,0,0,0.95)]',
              )}
            >
              {/*
                Kept in real colour — no greyscale — but held slightly back so
                five stock photographs of very different temperature (a bright
                clinic, a cold gym floor) read as one set against the violet
                palette. Hover restores full saturation and brightness, which
                is the reward for attention the old dimming filter was trying
                to buy at the cost of the photograph always looking muddy.
              */}
              <Image
                src={photo}
                alt=""
                aria-hidden
                fill
                sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw"
                className={cn(
                  '-z-10 object-cover object-center',
                  'saturate-[0.75] brightness-[0.72] contrast-[1.05]',
                  'transition-[transform,filter] duration-700 ease-[var(--ease-entrance)]',
                  'group-hover:scale-[1.06] group-hover:saturate-100 group-hover:brightness-90',
                )}
              />

              {/* Violet wash that ties the five different photographs to the
                  page's palette without desaturating them to grey. */}
              <div
                aria-hidden
                className="absolute inset-0 -z-10 bg-[color-mix(in_srgb,var(--color-acento)_12%,transparent)] mix-blend-overlay"
              />

              {/* Scrim under the copy only — dense at the foot, clear at the
                  top so the subject of the photograph stays readable. */}
              <div
                aria-hidden
                className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,var(--color-neutro-oscuro)_4%,color-mix(in_srgb,var(--color-neutro-oscuro)_88%,transparent)_34%,color-mix(in_srgb,var(--color-neutro-oscuro)_20%,transparent)_72%,transparent_100%)]"
              />

              {/* Accent hairline on hover, matching the services deck. */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-xl opacity-0 ring-1 ring-inset ring-[var(--accent-hairline)] transition-opacity duration-300 group-hover:opacity-100"
              />

              <div className="relative flex flex-col gap-2 p-5">
                <Icon
                  size={20}
                  strokeWidth={1.5}
                  aria-hidden="true"
                  className="text-[var(--color-acento)] transition-transform duration-300 group-hover:-translate-y-0.5"
                />
                <span className="text-sm font-semibold leading-snug text-[var(--color-neutro-claro)]">
                  {t(`items.${key}`)}
                </span>
                <p className="text-[0.8125rem] leading-relaxed text-ink-muted">
                  {t(`hooks.${key}`)}
                </p>
              </div>
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
