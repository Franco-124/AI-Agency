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
      className="relative isolate scroll-mt-24 overflow-hidden border-t border-hairline py-24 lg:py-32"
    >
      <Image
        src="/images/15-cta-new.webp"
        alt={t('imageAlt')}
        fill
        sizes="100vw"
        className="-z-10 object-cover object-center"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--color-neutro-oscuro)_0%,color-mix(in_srgb,var(--color-neutro-oscuro)_78%,transparent)_60%,color-mix(in_srgb,var(--color-neutro-oscuro)_92%,transparent)_100%)]"
      />

      <div className="mx-auto max-w-[80rem] px-5 sm:px-8">
        <div className="grid min-w-0 gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="min-w-0 lg:col-span-5 lg:self-center">
            <h2 id="cta-final-titulo" className="type-section-title">
              {t('title')}
            </h2>
            <p className="type-lead mt-7 max-w-md">{t('body')}</p>
          </Reveal>

          <Reveal delay={0.1} className="min-w-0 lg:col-span-6 lg:col-start-7">
            {/* The landing's single contact form — covers booking a call and
                describing a case that does not match a package. */}
            <div className="rounded-2xl border border-hairline bg-[color-mix(in_srgb,var(--color-primario)_94%,transparent)] p-6 sm:p-9">
              <h3 className="text-lg font-semibold tracking-[-0.02em]">
                {tForm('title')}
              </h3>
              <div className="mt-7">
                <LeadForm />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
