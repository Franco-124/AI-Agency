import { Mail, MapPin, MessageCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

import { Wordmark } from '@/components/brand/Wordmark'
import { InstagramGlyph, LinkedInGlyph } from '@/components/brand/SocialMarks'
import { Link } from '@/i18n/navigation'
import { sectionIds, siteConfig, socialLinks, whatsappUrl } from '@/lib/site'

const socialGlyphs = {
  instagram: InstagramGlyph,
  linkedin: LinkedInGlyph,
} as const

// Rooted at "/" rather than bare hashes so the links also work from the
// privacy page, where none of these sections exist.
const footerNav = [
  { key: 'services', href: `/#${sectionIds.services}` },
  { key: 'packages', href: `/#${sectionIds.packages}` },
  { key: 'process', href: `/#${sectionIds.process}` },
  { key: 'faq', href: `/#${sectionIds.faq}` },
  { key: 'about', href: `/#${sectionIds.about}` },
] as const

export function Footer() {
  const t = useTranslations('footer')
  const tNav = useTranslations('nav')
  const tPrivacy = useTranslations('privacy')
  const tWhatsapp = useTranslations('whatsapp')
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-hairline bg-[var(--color-primario)]">
      <div className="mx-auto max-w-[80rem] px-5 py-16 sm:px-8 lg:py-20">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <span className="relative inline-flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-md">
                <span aria-hidden className="mark-halo" />
                <Image
                  src="/images/numi-mark.png"
                  alt=""
                  aria-hidden
                  width={256}
                  height={256}
                  className="relative h-6 w-6 object-cover"
                />
              </span>
              <Wordmark />
            </div>
            <p className="mt-5 text-sm leading-relaxed text-ink-muted">{t('tagline')}</p>

            {/* `-ml-2.5` pulls the row back to the text's optical left edge:
                each link carries its own padding to reach a 44px tap target,
                which would otherwise indent the first glyph. */}
            <ul aria-label={t('socialLabel')} className="-ml-2.5 mt-6 flex items-center gap-1">
              {socialLinks.map(({ key, label, href }) => {
                const Glyph = socialGlyphs[key]

                return (
                  <li key={key}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-md text-ink-muted transition-colors duration-200 hover:text-ink"
                    >
                      <Glyph className="h-[1.125rem] w-[1.125rem]" aria-hidden />
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>

          <nav aria-label={t('navLabel')}>
            <h2 className="type-eyebrow">{t('navLabel')}</h2>
            {/* `-my-2 py-2` grows the tap target to ~44px tall without
                changing the visual `gap-3` rhythm between links — the
                painted padding is cancelled out by the matching negative
                margin, only the hit area grows. */}
            <ul className="mt-5 flex flex-col gap-3">
              {footerNav.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="-my-2 block py-2 text-sm text-ink-muted transition-colors duration-200 hover:text-ink"
                  >
                    {tNav(item.key)}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/privacidad"
                  className="-my-2 block py-2 text-sm text-ink-muted transition-colors duration-200 hover:text-ink"
                >
                  {tPrivacy('linkLabel')}
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="type-eyebrow">{t('contactLabel')}</h2>
            <ul className="mt-5 flex flex-col gap-3 text-sm text-ink-muted">
              <li>
                <a
                  href={`${whatsappUrl}?text=${encodeURIComponent(tWhatsapp('prefill'))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="-my-2 inline-flex items-center gap-2 py-2 transition-colors duration-200 hover:text-ink"
                >
                  <MessageCircle className="h-4 w-4 text-ink-faint" aria-hidden />
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="-my-2 inline-flex items-center gap-2 py-2 transition-colors duration-200 hover:text-ink"
                >
                  <Mail className="h-4 w-4 text-ink-faint" aria-hidden />
                  {siteConfig.email}
                </a>
              </li>
              <li className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-ink-faint" aria-hidden />
                {t('location')}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-hairline pt-7">
          <p className="text-xs text-ink-faint">
            © {year} {t('rights')}
          </p>
        </div>
      </div>
    </footer>
  )
}
