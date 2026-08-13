import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { Reveal } from '@/components/motion/Reveal'
import { sectionIds } from '@/lib/site'

export function Differentiation() {
  const t = useTranslations('differentiation')

  return (
    <section
      id={sectionIds.differentiation}
      aria-labelledby="diferenciacion-titulo"
      className="grain relative isolate scroll-mt-24 overflow-hidden border-y border-hairline py-24 lg:py-36"
    >
      {/* Shared site texture — carries visual continuity between sections. */}
      <Image
        src="/images/10-textura-base-sitio.webp"
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        className="-z-10 object-cover object-center"
      />

      <div className="mx-auto max-w-[80rem] px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-7">
            <Image
              src="/images/numi-mark.png"
              alt=""
              aria-hidden
              width={256}
              height={256}
              className="h-8 w-8 rounded-md object-cover"
            />
            <h2 id="diferenciacion-titulo" className="type-section-title mt-8">
              {t('title')}
            </h2>
          </Reveal>

          <Reveal
            delay={0.1}
            className="lg:col-span-5 lg:self-end lg:border-l lg:border-hairline lg:pl-12"
          >
            <p className="type-lead">{t('body')}</p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
