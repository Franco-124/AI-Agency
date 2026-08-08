import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { CountUp } from '@/components/motion/CountUp'
import { Reveal } from '@/components/motion/Reveal'
import { sectionIds } from '@/lib/site'

export function Results() {
  const t = useTranslations('results')

  return (
    <section
      id={sectionIds.results}
      aria-labelledby="resultados-titulo"
      className="grain relative isolate scroll-mt-24 overflow-hidden border-y border-hairline bg-[var(--color-primario)] py-24 lg:py-32"
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
        className="absolute inset-x-0 top-0 -z-10 h-40 bg-[linear-gradient(to_bottom,var(--color-neutro-oscuro),transparent)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-[linear-gradient(to_top,var(--color-neutro-oscuro),transparent)]"
      />

      <div className="mx-auto max-w-[80rem] px-5 sm:px-8">
        <Reveal>
          <p className="type-eyebrow inline-flex items-center gap-2.5">
            <span aria-hidden className="rule-draw h-px w-8 bg-[var(--color-acento)]" />
            {t('title')}
          </p>
        </Reveal>

        <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-6">
            {/*
              The only figure on the site. It is the documented result of a real
              client engagement — no additional statistics without evidence.
            */}
            <h2
              id="resultados-titulo"
              className="text-balance text-3xl font-bold leading-[1.1] tracking-[-0.035em] sm:text-4xl lg:text-[3.25rem]"
            >
              <CountUp
                value={t('figureValue')}
                className="text-[var(--color-acento)]"
              />{' '}
              {t('figureRest')}
            </h2>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-6">
            <figure className="rounded-xl border border-hairline bg-[color-mix(in_srgb,var(--color-primario)_88%,transparent)] p-7 sm:p-9">
              <blockquote className="text-[0.9375rem] leading-relaxed text-ink sm:text-base">
                <p>&ldquo;{t('quote')}&rdquo;</p>
              </blockquote>

              <figcaption className="mt-8 flex items-center gap-4 border-t border-hairline pt-7 text-sm text-ink-muted">
                <Image
                  src="/images/logo-casas-y-espacios.webp"
                  alt={t('clientLogoAlt')}
                  width={112}
                  height={56}
                  className="h-9 w-auto object-contain opacity-90"
                />
                <span>{t('attribution')}</span>
              </figcaption>
            </figure>
          </Reveal>
        </div>

        {/* TODO: agregar cuando exista testimonio real */}
      </div>
    </section>
  )
}
