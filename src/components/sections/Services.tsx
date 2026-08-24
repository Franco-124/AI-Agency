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

const services: ReadonlyArray<{ key: string; Icon: LucideIcon; photo?: string }> = [
  { key: 'one', Icon: MessageSquare, photo: '/images/21-services-whatsapp-ai.webp' },
  { key: 'two', Icon: CalendarCheck },
  { key: 'three', Icon: Repeat },
  { key: 'four', Icon: Globe },
  { key: 'five', Icon: Database },
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
        {services.map(({ key, Icon, photo }, index) => (
          <Reveal
            as="li"
            key={key}
            delay={index * 0.06}
            className={cn(index === services.length - 1 && 'md:col-span-2')}
          >
            {/* Card visuals live one level down so the hover transition and the
                scroll entrance never compete for the same `transition` property. */}
            <div
              className={cn(
                'group relative flex h-full flex-col overflow-hidden rounded-xl border border-hairline p-7 transition-colors duration-200 hover:border-hairline-strong',
                !photo && 'bg-[var(--color-neutro-oscuro)]',
              )}
            >
              {photo ? (
                <>
                  {/*
                    One card gets a photo treatment — enough to make the
                    "atención por WhatsApp" claim concrete without turning
                    all five cards into a photo grid. The card has no
                    background color of its own here, since a painted `bg-*`
                    on this element would otherwise sit in front of a
                    negative-z sibling within the same stacking context.
                  */}
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-[var(--color-neutro-oscuro)]"
                  />
                  <Image
                    src={photo}
                    alt=""
                    aria-hidden
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover object-[75%_center] opacity-60 transition-opacity duration-300 group-hover:opacity-75"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-neutro-oscuro)_0%,color-mix(in_srgb,var(--color-neutro-oscuro)_55%,transparent)_45%,color-mix(in_srgb,var(--color-neutro-oscuro)_30%,transparent)_100%)]"
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
        ))}
      </ul>
    </Section>
  )
}
