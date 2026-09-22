import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { defaultLocale } from '@/i18n/routing'

/*
  Next renders this for any unmatched route under `/[locale]/*`, and also for
  the invalid-locale branch in `[locale]/layout.tsx` (`notFound()`). In that
  second case the dynamic `locale` param never resolved, so there is no
  `params` prop here to read it from — fall back to `defaultLocale` for the
  copy, same as `generateMetadata` does elsewhere in this segment.
*/
export default async function NotFound() {
  const t = await getTranslations({ locale: defaultLocale, namespace: 'notFound' })

  setRequestLocale(defaultLocale)

  return (
    <>
      <Header />

      <main
        id="contenido"
        className="mx-auto flex min-h-[70dvh] max-w-3xl flex-col items-center justify-center px-5 pb-24 pt-[calc(var(--header-height)+5rem)] text-center sm:px-8"
      >
        <span className="type-eyebrow text-[var(--accent-text)]">{t('eyebrow')}</span>
        <h1 className="type-section-title mt-4">{t('title')}</h1>
        <p className="type-body mt-5 max-w-md text-ink-muted">{t('body')}</p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="solid" size="lg">
            <Link href="/agendar">{t('cta')}</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">{t('backHome')}</Link>
          </Button>
        </div>
      </main>

      <Footer />
    </>
  )
}
