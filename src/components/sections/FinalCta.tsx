import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { LeadForm } from '@/components/forms/LeadForm'
import { Reveal } from '@/components/motion/Reveal'
import { sectionIds } from '@/lib/site'

export function FinalCta() {
  const t = useTranslations('finalCta')
  const tForm = useTranslations('leadForm')

  return (
    <section
      id={sectionIds.finalCta}
      aria-labelledby="cta-final-titulo"
      className="relative isolate scroll-mt-24 overflow-hidden py-[var(--space-section-wide)]"
    >
      <Image
        src="/images/15-cta-new.webp"
        alt={t('imageAlt')}
        fill
        sizes="100vw"
        className="-z-10 object-cover object-center"
      />
      {/*
        Two overlays rather than one. The horizontal wash keeps the copy
        column legible over the artwork, exactly as before; the new radial
        one lifts an accent bloom behind the form panel, so the page's final
        ask is the brightest thing on the screen. Closing a landing on the
        darkest block is what makes the last screen feel like an afterthought.
      */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--surface-base)_0%,color-mix(in_srgb,var(--surface-base)_80%,transparent)_55%,color-mix(in_srgb,var(--surface-base)_93%,transparent)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(58%_60%_at_78%_45%,color-mix(in_srgb,var(--color-acento-deep)_34%,transparent)_0%,transparent_100%)]"
      />
      <span
        aria-hidden
        className="edge-rule pointer-events-none absolute inset-x-0 top-0"
      />

      <div className="mx-auto w-full max-w-[var(--measure-page)] px-5 sm:px-8">
        <div className="grid min-w-0 gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="min-w-0 lg:col-span-5 lg:self-center">
            {/* The one heading on the page with no index: this is the ask, not
                another entry in the sequence. */}
            <h2 id="cta-final-titulo" className="type-section-title">
              {t('title')}
            </h2>
            <p className="type-lead mt-5 max-w-[34ch] sm:mt-6">{t('body')}</p>
          </Reveal>

          <Reveal delay={0.1} className="min-w-0 lg:col-span-6 lg:col-start-7">
            {/* The landing's single contact form — covers booking a call and
                describing a case that does not match a package. Given the
                page's strongest elevation: it is the final destination, so it
                should read as sitting closest to the viewer. */}
            <div className="surface-panel rounded-[1.125rem] p-5 shadow-[var(--shadow-high)] sm:p-8">
              <h3 className="text-[1.0625rem] font-semibold tracking-[-0.02em] sm:text-lg">
                {tForm('title')}
              </h3>
              <div className="mt-6">
                <LeadForm />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
