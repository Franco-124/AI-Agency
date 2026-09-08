import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { AnsweredMark } from '@/components/brand/AnsweredMark'
import { CountUp } from '@/components/motion/CountUp'
import { Reveal } from '@/components/motion/Reveal'
import { sectionIds } from '@/lib/site'

export function Results() {
  const t = useTranslations('results')

  return (
    <section
      id={sectionIds.results}
      aria-labelledby="resultados-titulo"
      className="grain relative isolate scroll-mt-24 overflow-hidden bg-[var(--surface-raised)] py-[var(--space-section)]"
    >
      {/* Ruled texture with its accent line — the atmosphere of this block. */}
      <Image
        src="/images/04-textura-stats-testimonio.webp"
        alt={t('imageAlt')}
        fill
        sizes="100vw"
        className="-z-10 object-cover object-center"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-40 bg-[linear-gradient(to_bottom,var(--surface-base),transparent)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-[linear-gradient(to_top,var(--surface-base),transparent)]"
      />
      {/* Fading rules top and bottom, matching every other section seam. */}
      <span
        aria-hidden
        className="edge-rule pointer-events-none absolute inset-x-0 top-0"
      />
      <span
        aria-hidden
        className="edge-rule pointer-events-none absolute inset-x-0 bottom-0"
      />

      <div className="mx-auto w-full max-w-[var(--measure-page)] px-5 sm:px-8">
        <Reveal>
          <p className="type-eyebrow inline-flex items-center gap-2.5 text-[var(--accent-text)]">
            <AnsweredMark className="h-3.5 w-3.5" />
            {t('title')}
          </p>
        </Reveal>

        <div className="mt-10 grid items-center gap-10 sm:mt-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-6">
            {/*
              The only figure on the site. It is the documented result of a real
              client engagement — no additional statistics without evidence.
              Set in the display face so the number reads as a claim rather than
              a UI label.
            */}
            {/*
              The figure and its qualifier are now stacked rather than run
              together on one line. Previously the number and a 0.55em phrase
              shared a baseline, which put the site's single measured claim in
              the same breath as its own footnote; on a phone that wrapped into
              an unreadable mixed-size block. Split, the number lands first and
              the sentence explains it.
            */}
            <h2 id="resultados-titulo" className="text-balance">
              <span className="type-figure block text-[2.75rem] leading-[0.95] text-[var(--accent-text)] sm:text-[3.5rem] lg:text-[4.25rem]">
                <CountUp value={t('figureValue')} />
              </span>
              <span className="mt-4 block max-w-[24ch] font-sans text-[1.0625rem] font-medium leading-[1.4] tracking-[-0.015em] text-ink sm:mt-5 sm:text-xl lg:text-[1.5rem]">
                {t('figureRest')}
              </span>
            </h2>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-6">
            {/*
              Styled as the same "before" bubble shape as the hero's client
              messages — a real testimonial is, literally, an answered message.
              The squared top-left corner is what carries that read, so it
              survives the panel treatment.
            */}
            <figure className="surface-panel relative rounded-[1.125rem] rounded-tl-md p-6 sm:p-8">
              {/*
                An open quote mark set large and faint behind the text. It is
                the one piece of ornament on the page, and it earns its place:
                it marks the block as testimony at a glance, before a word is
                read.
              */}
              <span
                aria-hidden
                className="pointer-events-none absolute right-5 top-3 select-none font-display text-[4.5rem] leading-none text-[color-mix(in_srgb,var(--color-acento)_14%,transparent)] sm:text-[5.5rem]"
              >
                &rdquo;
              </span>

              <blockquote className="relative text-[0.9375rem] leading-[1.7] text-ink sm:text-base">
                <p>&ldquo;{t('quote')}&rdquo;</p>
              </blockquote>

              <figcaption className="mt-7 flex items-center gap-4 border-t border-hairline-subtle pt-6 text-[0.875rem] text-ink-muted">
                <Image
                  src="/images/logo-casas-y-espacios.webp"
                  alt={t('clientLogoAlt')}
                  width={112}
                  height={56}
                  className="h-8 w-auto shrink-0 object-contain opacity-90"
                />
                <span className="min-w-0">{t('attribution')}</span>
              </figcaption>
            </figure>
          </Reveal>
        </div>

        {/* TODO: agregar cuando exista testimonio real */}
      </div>
    </section>
  )
}
