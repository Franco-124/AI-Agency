import Image from 'next/image'

import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

import { Wordmark } from './Wordmark'

type LogoProps = {
  className?: string
  /** Suffix appended to the visible wordmark for the accessible name. */
  label: string
}

export function Logo({ className, label }: LogoProps) {
  return (
    /*
      `min-h-11` and a small negative inset. The logo is the site's "home"
      control and it measured 28px tall — the height of the mark alone. The
      inset keeps the mark optically flush with the header's left gutter while
      the hit area extends past it, so the target grows without the logo
      appearing to shift inward.
    */
    <Link
      href="/"
      className={cn(
        'group -mx-2 inline-flex min-h-11 items-center gap-2.5 rounded-lg px-2',
        className,
      )}
    >
      <span className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md">
        <span aria-hidden className="mark-halo" />
        <Image
          src="/images/numi-mark.png"
          alt=""
          aria-hidden
          width={256}
          height={256}
          priority
          /* Rendered at 28px. Without `sizes` the default ladder served a
             128w candidate for a 28px box — roughly 4.5x the pixels needed,
             on an image that loads with `priority` in the header. */
          sizes="28px"
          className="relative h-7 w-7 object-cover transition-transform duration-300 group-hover:rotate-[18deg]"
        />
      </span>
      <Wordmark />
      {/* Visible text stays the accessible name; this only adds the destination. */}
      <span className="sr-only">{label}</span>
    </Link>
  )
}
