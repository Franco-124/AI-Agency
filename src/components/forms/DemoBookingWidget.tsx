import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

type DemoBookingWidgetProps = {
  /** Label of the trigger button — reuses `hero.cta` so it matches the surrounding copy. */
  ctaLabel: string
  secondaryLabel: string
  secondaryHref: string
}

/**
 * Hero's live scheduling trigger. Navigates to the dedicated `/agendar` page
 * instead of expanding `BookingCalendarPanel` inline — the panel's day
 * navigator and slot grid needed more room than the hero's tuned
 * above-the-fold layout could spare without pushing the rest of the landing
 * down and competing with the headline.
 */
export function DemoBookingWidget({
  ctaLabel,
  secondaryLabel,
  secondaryHref,
}: DemoBookingWidgetProps) {
  return (
    <>
      <Button asChild size="lg" className="group">
        <Link href="/agendar#reserva">
          {ctaLabel}
          <ArrowRight
            aria-hidden
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </Link>
      </Button>
      <Button asChild size="lg" variant="outline">
        <a href={secondaryHref}>{secondaryLabel}</a>
      </Button>
    </>
  )
}
