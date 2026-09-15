import {
  Bot,
  Globe,
  MessageSquare,
  ScanSearch,
  Workflow,
  type LucideIcon,
} from 'lucide-react'
import Image from 'next/image'

/**
 * One glyph per service, keyed the same way the copy is.
 *
 * This map used to live on the client side of a Server -> Client boundary,
 * because the carousel that owned these cards was an interactive island and a
 * Lucide icon is a function, which cannot be serialised as a prop. The grid is
 * a server component, so the icon is simply resolved here.
 */
const icons = {
  diagnostic: ScanSearch,
  chatbots: MessageSquare,
  automation: Workflow,
  agents: Bot,
  websites: Globe,
} satisfies Record<string, LucideIcon>

export type ServiceKey = keyof typeof icons

type ServiceCardProps = {
  serviceKey: ServiceKey
  /** Position in the deck, for the card's own index badge. */
  index: number
  visual: string
  title: string
  body: string
}

/**
 * A single service.
 *
 * The card keeps the treatment it had inside the carousel — 16/10 artwork
 * melting into the copy, a quiet meta line of icon plus ordinal, then title
 * and body. What is gone is everything that made it a *slide*: the scroll
 * snapping, the derived active index, the opacity ramp that dimmed every card
 * but one, and the ring that marked the active one. In a grid every card is
 * equally present, so there is no active state left to express.
 */
export function ServiceCard({
  serviceKey,
  index,
  visual,
  title,
  body,
}: ServiceCardProps) {
  const Icon = icons[serviceKey]

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-hairline bg-[var(--surface-panel)] transition-colors duration-300 hover:border-[var(--accent-hairline)]">
      {/*
        Visual panel. Each illustration is a wide, centred scene on a
        near-black ground, so it is cropped from the centre and shown at full
        opacity — no veil over it. Only the bottom edge melts into the card
        body, and only far enough to seat the copy against it without touching
        the subject.
      */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--surface-sunken)]">
        <Image
          src={visual}
          alt=""
          fill
          sizes="(min-width: 1024px) 31vw, (min-width: 640px) 46vw, 90vw"
          className="object-cover object-center transition-transform duration-700 ease-[var(--ease-entrance)] motion-safe:group-hover:scale-[1.05]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-[linear-gradient(to_top,var(--surface-panel)_0%,color-mix(in_srgb,var(--surface-panel)_55%,transparent)_55%,transparent_100%)]"
        />
      </div>

      <div className="relative flex flex-1 flex-col px-5 pb-6 pt-4">
        {/* Icon and index share one quiet meta line, so the card opens on its
            title rather than on a badge competing with it. */}
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[0.375rem] border border-[var(--accent-hairline)] bg-[var(--accent-soft)] transition-transform duration-300 ease-[var(--ease-emphasis)] motion-safe:group-hover:-translate-y-0.5"
          >
            <Icon
              className="h-[0.8125rem] w-[0.8125rem] text-[var(--accent-text)]"
              strokeWidth={1.9}
            />
          </span>
          <span aria-hidden className="h-px w-4 bg-hairline-strong" />
          <span className="type-eyebrow">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        <h3 className="mt-3.5 text-[0.9375rem] font-semibold leading-[1.4] tracking-[-0.015em] text-ink">
          {title}
        </h3>
        <p className="mt-2 text-[0.8125rem] leading-[1.65] text-ink-faint">
          {body}
        </p>
      </div>
    </article>
  )
}
