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
  { key: 'process', href: `/#${sectionIds.process}` },
  // A real page rather than a fragment, so this one is already root-relative
  // for its own sake — `<Link>` adds the locale prefix either way.
  { key: 'roi', href: '/calculadora-roi' },
  { key: 'faq', href: `/#${sectionIds.faq}` },
] as const

export function Footer() {
  const t = useTranslations('footer')
  const tNav = useTranslations('nav')
  const tPrivacy = useTranslations('privacy')
  const tWhatsapp = useTranslations('whatsapp')
  const year = new Date().getFullYear()

  return (
    // Sunken, not raised. The footer is where the page ends, and a *lighter*
    // slab at the bottom reads as one more section rather than as a floor —
    // dropping it below the page surface is what closes the document.
    <footer className="relative bg-[var(--surface-sunken)]">
      <span
        aria-hidden
        className="edge-rule pointer-events-none absolute inset-x-0 top-0"
      />
      <div className="mx-auto w-full max-w-[var(--measure-page)] px-5 py-14 sm:px-8 lg:py-20">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr] md:gap-12">
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
                  sizes="24px"
                  className="relative h-6 w-6 object-cover"
                />
              </span>
              <Wordmark />
            </div>
            <p className="mt-5 text-sm leading-relaxed text-ink-muted">{t('tagline')}</p>

            {/* Seated in tiles rather than left as bare glyphs, matching the
                integration grid and the hero's capability row — the tile is
                also what gives the 44px tap target a visible boundary. */}
            <ul aria-label={t('socialLabel')} className="mt-6 flex items-center gap-2.5">
              {socialLinks.map(({ key, label, href }) => {
                const Glyph = socialGlyphs[key]

                return (
                  <li key={key}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-lg)] border border-hairline bg-[var(--surface-raised)] text-ink-muted transition-colors duration-200 hover:border-[var(--accent-hairline)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent-text)]"
                    >
                      <Glyph className="h-[1.0625rem] w-[1.0625rem]" aria-hidden />
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>

          <nav aria-label={t('navLabel')}>
            <h2 className="type-eyebrow">{t('navLabel')}</h2>
            {/*
              `min-h-11` on a flex link, rather than the previous `-my-2 py-2`
              trick. That trick was arithmetic on the line box — 20px of text
              plus 16px of padding — and it landed at 36px, eight short of the
              44px minimum, silently. `min-h-11` states the requirement
              instead of computing it, so it cannot drift when the type size
              changes. The list drops to `gap-0` because the targets now
              provide their own separation.
            */}
            <ul className="mt-4 flex flex-col">
              {footerNav.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="flex min-h-11 items-center text-sm text-ink-muted transition-colors duration-200 hover:text-ink"
                  >
                    {tNav(item.key)}
                  </Link>
                </li>
              ))}
              {/* Separate from `footerNav`: its label lives in the `privacy`
                  namespace, not `nav`, so it cannot share the loop's lookup. */}
              <li>
                <Link
                  href="/privacidad"
                  className="flex min-h-11 items-center text-sm text-ink-muted transition-colors duration-200 hover:text-ink"
                >
                  {tPrivacy('linkLabel')}
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="type-eyebrow">{t('contactLabel')}</h2>
            <ul className="mt-4 flex flex-col text-sm text-ink-muted">
              <li>
                <a
                  href={`${whatsappUrl}?text=${encodeURIComponent(tWhatsapp('prefill'))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-11 items-center gap-2 transition-colors duration-200 hover:text-ink"
                >
                  <MessageCircle className="h-4 w-4 text-ink-faint" aria-hidden />
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="flex min-h-11 items-center gap-2 transition-colors duration-200 hover:text-ink"
                >
                  <Mail className="h-4 w-4 text-ink-faint" aria-hidden />
                  {siteConfig.email}
                </a>
              </li>
              <li className="flex min-h-11 items-center gap-2">
                <MapPin className="h-4 w-4 text-ink-faint" aria-hidden />
                {t('location')}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-hairline-subtle pt-7 sm:mt-14">
          <p className="text-[0.75rem] text-ink-faint">
            © {year} {t('rights')}
          </p>
        </div>
      </div>
    </footer>
  )
}
