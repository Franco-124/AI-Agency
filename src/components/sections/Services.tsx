import {
  CalendarCheck,
  Database,
  Globe,
  MessageSquare,
  Repeat,
  type LucideIcon,
} from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { Section, SectionHeading } from '@/components/layout/Section'
import { Reveal } from '@/components/motion/Reveal'
import { sectionIds } from '@/lib/site'
import { cn } from '@/lib/utils'

const services: ReadonlyArray<{ key: string; Icon: LucideIcon; visual?: string }> = [
  { key: 'one', Icon: MessageSquare, visual: '/images/25-services-whatsapp.webp' },
  { key: 'two', Icon: CalendarCheck, visual: '/images/24-services-calendar.webp' },
  { key: 'three', Icon: Repeat, visual: '/images/22-services-followup.webp' },
  { key: 'four', Icon: Globe, visual: '/images/23-services-website.webp' },
  { key: 'five', Icon: Database, visual: '/images/27-services-database.webp' },
]

export function Services() {
  const t = useTranslations('services')

  return (
    <Section
      id={sectionIds.services}
      labelledBy="servicios-titulo"
      surface="texture"
      backgroundSrc="/images/13-services-new.webp"
    >
      <Reveal>
        <SectionHeading id="servicios-titulo" title={t('title')} />
      </Reveal>

      {/*
        Five cards on a two-column grid: rows of 2-2-1, with the fifth spanning
        the full width so no empty cell is ever left over.
      */}
      <ul className="mt-14 grid gap-5 md:grid-cols-2">
        {services.map(({ key, Icon, visual }, index) => {
          const isWide = index === services.length - 1

          return (
          <Reveal
            as="li"
            key={key}
            delay={index * 0.06}
            className={cn(isWide && 'md:col-span-2')}
          >
            {/* Card visuals live one level down so the hover transition and the
                scroll entrance never compete for the same `transition` property. */}
            <div
              className={cn(
                'group relative flex h-full flex-col overflow-hidden rounded-xl border border-hairline p-7 transition-colors duration-200 hover:border-hairline-strong',
                !visual && 'bg-[var(--color-neutro-oscuro)]',
              )}
            >
              {visual ? (
                <>
                  {/*
                    Each illustration is already a self-contained scene on a
                    near-black background (phone mockup, calendar, flow
                    diagram, browser window, CRM dashboard) — shown whole
                    rather than cropped, so the mockup inside it is never cut
                    off. The full-width card gets a wide banner treatment
                    instead of the corner motif the narrower cards use, since
                    its source image is itself a wide dashboard screenshot.
                    The card has no background color of its own here, since a
                    painted `bg-*` on this element would otherwise sit in
                    front of a negative-z sibling within the same stacking
                    context.
                  */}
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-[var(--color-neutro-oscuro)]"
                  />
                  <div
                    aria-hidden
                    className={cn(
                      'pointer-events-none absolute opacity-80 transition-opacity duration-300 group-hover:opacity-100',
                      isWide
                        ? 'inset-y-0 right-[-2%] w-[62%] sm:w-[52%]'
                        : '-right-4 -top-4 h-40 w-56 sm:h-48 sm:w-64',
                    )}
                  >
                    <Image
                      src={visual}
                      alt=""
                      fill
                      sizes={isWide ? '55vw' : '256px'}
                      className={cn(
                        'object-contain',
                        isWide ? 'object-right' : 'object-right-top',
                      )}
                    />
                  </div>
                  <div
                    aria-hidden
                    className={
                      isWide
                        ? 'absolute inset-0 bg-[linear-gradient(to_right,var(--color-neutro-oscuro)_0%,var(--color-neutro-oscuro)_38%,transparent_62%),linear-gradient(to_bottom,transparent_60%,var(--color-neutro-oscuro)_100%)]'
                        : 'absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,var(--color-neutro-oscuro)_72%),linear-gradient(to_left,transparent_0%,color-mix(in_srgb,var(--color-neutro-oscuro)_25%,transparent)_55%)]'
                    }
                  />
                </>
              ) : null}

              <span
                aria-hidden
                className="accent-rule absolute inset-x-7 top-0 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              />

              <span className="relative z-10 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-hairline bg-[var(--color-neutro-oscuro)] text-[var(--color-acento)]">
                <Icon className="h-5 w-5" aria-hidden />
              </span>

              <h3 className="relative z-10 mt-7 text-lg font-semibold leading-snug tracking-[-0.02em]">
                {t(`items.${key}.title`)}
              </h3>
              <p className="relative z-10 mt-3 max-w-prose text-[0.9375rem] leading-relaxed text-ink-muted">
                {t(`items.${key}.body`)}
              </p>
            </div>
          </Reveal>
          )
        })}
      </ul>
    </Section>
  )
}
