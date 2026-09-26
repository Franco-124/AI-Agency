import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'

import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { legalDocuments, legalPaths, type LegalDocKey } from '@/content/legal'
import { isLocale, type Locale } from '@/i18n/routing'
import { legalEntity } from '@/lib/site'

export type LegalPageProps = { params: Promise<{ locale: string }> }

/** Title, description and hreflang for one of the three legal pages. */
export async function legalMetadata(doc: LegalDocKey, { params }: LegalPageProps): Promise<Metadata> {
  const { locale } = await params
  const safeLocale: Locale = isLocale(locale) ? locale : 'es'
  const { title, metaDescription } = legalDocuments[doc][safeLocale]
  const path = legalPaths[doc]

  return {
    title,
    description: metaDescription,
    // Repeated rather than inherited — see the note in `agendar/page.tsx`.
    alternates: {
      canonical: `/${safeLocale}/${path}`,
      languages: {
        es: `/es/${path}`,
        en: `/en/${path}`,
        'x-default': `/es/${path}`,
      },
    },
  }
}

const updatedLabel: Record<Locale, string> = {
  es: 'Última actualización',
  en: 'Last updated',
}

const otherDocsLabel: Record<Locale, string> = {
  es: 'Documentos legales',
  en: 'Legal documents',
}

/**
 * Renders a legal document from `content/legal.ts`. The three pages share one
 * layout so they read as one set, and so a fix to their structure (heading
 * order, link targets) lands on all three at once.
 */
export async function LegalPage({ doc, params }: { doc: LegalDocKey } & LegalPageProps) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const { title, intro, sections } = legalDocuments[doc][locale]
  const siblings = (Object.keys(legalDocuments) as LegalDocKey[]).filter((key) => key !== doc)

  return (
    <>
      <Header />

      <main
        id="contenido"
        className="mx-auto max-w-3xl px-5 pb-24 pt-[calc(var(--header-height)+5rem)] sm:px-8 lg:pb-32"
      >
        <h1 className="type-section-title">{title}</h1>
        <p className="type-lead mt-8">{intro}</p>

        {sections.map((section) => (
          <section key={section.title} className="mt-12 sm:mt-14">
            <h2 className="font-display text-[1.1875rem] font-medium tracking-[-0.022em] sm:text-xl">
              {section.title}
            </h2>
            {section.body.map((block, index) =>
              typeof block === 'string' ? (
                <p key={index} className="type-body mt-4">
                  {block}
                </p>
              ) : (
                <ul key={index} className="mt-5 flex flex-col gap-3">
                  {block.list.map((item) => (
                    <li key={item} className="type-body flex gap-3">
                      <span
                        aria-hidden
                        className="mt-[0.6875em] h-1 w-1 shrink-0 rounded-full bg-[var(--accent-text)]"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ),
            )}
          </section>
        ))}

        <nav aria-label={otherDocsLabel[locale]} className="mt-16 border-t border-hairline-subtle pt-7">
          <p className="text-[0.8125rem] text-ink-faint">
            {updatedLabel[locale]}: {legalEntity.updated[locale]}
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-6">
            {siblings.map((key) => (
              <li key={key}>
                <a
                  href={`/${locale}/${legalPaths[key]}`}
                  className="inline-flex min-h-11 items-center text-[0.9375rem] text-[var(--accent-text)] underline decoration-[var(--accent-hairline)] underline-offset-4 transition-colors duration-200 hover:decoration-[var(--accent-text)]"
                >
                  {legalDocuments[key][locale].title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </main>

      <Footer />
    </>
  )
}
