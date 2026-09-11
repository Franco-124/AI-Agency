'use client'

import {
  ArrowLeft,
  ArrowRight,
  Database,
  Globe,
  MessageSquare,
  MousePointerClick,
  Repeat,
  ScanSearch,
  type LucideIcon,
} from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

/**
 * Icons live on the client side of the boundary: a Lucide icon is a component
 * (a function), and functions cannot be serialised across a Server -> Client
 * Component prop. The server passes the key; this map resolves the glyph.
 */
const icons = {
  zero: ScanSearch,
  one: MessageSquare,
  two: MousePointerClick,
  three: Repeat,
  four: Globe,
  five: Database,
} satisfies Record<string, LucideIcon>

export type ServiceKey = keyof typeof icons

export type ServiceSlide = {
  key: ServiceKey
  visual: string
  title: string
  body: string
  /** Accessible name for the slide and its dot, already localised. */
  label: string
}

type ServicesCarouselProps = {
  slides: ReadonlyArray<ServiceSlide>
  labels: {
    previous: string
    next: string
    region: string
  }
}

/**
 * Scroll-snap carousel for the services deck.
 *
 * The track is a real horizontally scrollable list, so native touch/trackpad
 * momentum, keyboard scrolling and — crucially — a no-JavaScript render all
 * keep working. The arrows and dots only ever call `scrollTo`; the active
 * index is *derived* from the scroll position rather than owned as state, so
 * a swipe and a button press can never disagree about which slide is showing.
 */
export function ServicesCarousel({ slides, labels }: ServicesCarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null)
  const [active, setActive] = useState(0)
  const [edges, setEdges] = useState({ start: true, end: false })

  const total = slides.length

  /** Offsets of each slide relative to the track's own scroll origin. */
  const readOffsets = useCallback(() => {
    const track = trackRef.current
    if (!track) return [] as number[]

    return Array.from(track.children).map(
      (child) => (child as HTMLElement).offsetLeft - track.offsetLeft,
    )
  }, [])

  const syncFromScroll = useCallback(() => {
    const track = trackRef.current
    if (!track) return

    const offsets = readOffsets()
    if (offsets.length === 0) return

    const { scrollLeft, scrollWidth, clientWidth } = track

    // Nearest slide to the current scroll position — robust to the fractional
    // scrollLeft values that trackpads and snap animations produce.
    let nearest = 0
    let smallest = Number.POSITIVE_INFINITY
    offsets.forEach((offset, index) => {
      const distance = Math.abs(offset - scrollLeft)
      if (distance < smallest) {
        smallest = distance
        nearest = index
      }
    })

    setActive(nearest)
    setEdges({
      start: scrollLeft <= 2,
      end: scrollLeft >= scrollWidth - clientWidth - 2,
    })
  }, [readOffsets])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    syncFromScroll()

    track.addEventListener('scroll', syncFromScroll, { passive: true })

    // Breakpoint changes swap how many cards fit, which moves every offset.
    const observer = new ResizeObserver(syncFromScroll)
    observer.observe(track)

    return () => {
      track.removeEventListener('scroll', syncFromScroll)
      observer.disconnect()
    }
  }, [syncFromScroll])

  const scrollToIndex = useCallback(
    (index: number) => {
      const track = trackRef.current
      if (!track) return

      const offsets = readOffsets()
      const clamped = Math.max(0, Math.min(index, offsets.length - 1))
      const target = offsets[clamped]
      if (target === undefined) return

      track.scrollTo({ left: target, behavior: 'smooth' })
    },
    [readOffsets],
  )

  const dots = useMemo(() => Array.from({ length: total }, (_, i) => i), [total])

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label={labels.region}
      className="relative mt-12 sm:mt-14"
    >
      {/*
        Edge-to-edge on mobile: the track bleeds past the section gutter so a
        partially visible next card signals "there is more to swipe", while
        scroll-padding keeps the snapped card aligned to the original gutter.
      */}
      {/*
        The label lives on the `role="group"` wrapper above, not here too:
        carrying it on both made a screen reader announce the same string
        twice in a row on entry. This element keeps only what it needs to be
        a focusable scroll container.
      */}
      <ul
        ref={trackRef}
        tabIndex={0}
        className={cn(
          'swipe-row services-track -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 pb-2',
          'sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0',
        )}
      >
        {slides.map(({ key, visual, title, body, label }, index) => {
          const Icon = icons[key]

          return (
            <li
              key={key}
              aria-roledescription="slide"
              aria-label={label}
              className={cn(
                'shrink-0 snap-start',
                'w-[78%] sm:w-[calc((100%-1rem)/2)]',
                'md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3rem)/4)]',
              )}
            >
              <article
                /*
                  `h-full` fills the stretched track row, so all five cards
                  share a bottom edge — and now they do so without dead space,
                  because the copy itself was levelled to make that possible.

                  The five bodies used to run 176-374 characters. No layout can
                  reconcile that: a shared height meant the longest card set a
                  520px floor and left 110-131px of emptiness under the copy in
                  the others, while sizing each card to its own content left
                  their bottom edges up to 107px apart. Both were symptoms of
                  the copy, so the copy was rewritten to a 193-206 character
                  band (see `services.items.*` in the message files) and the
                  shared height became correct rather than merely tolerable.
                */
                className={cn(
                  'group relative flex h-full flex-col overflow-hidden rounded-[1.125rem]',
                  'bg-[var(--surface-panel)] ring-1 ring-inset ring-hairline',
                  'shadow-[var(--shadow-low)]',
                  'transition-[transform,box-shadow] duration-400 ease-[var(--ease-emphasis)]',
                  'motion-safe:hover:-translate-y-1.5 hover:shadow-[var(--shadow-high)]',
                )}
              >
                {/*
                  Hairline that lifts to the accent on hover, and stays lifted on
                  the slide the carousel is currently parked on. Drawn as an
                  overlay ring rather than a border so the card's geometry never
                  shifts by a pixel between states.
                */}
                <span
                  aria-hidden
                  className={cn(
                    'pointer-events-none absolute inset-0 z-20 rounded-[1.125rem]',
                    'ring-1 ring-inset ring-[var(--accent-hairline)]',
                    'transition-opacity duration-400',
                    index === active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                  )}
                />

                {/*
                  Visual panel. Each illustration is a wide, centred scene on a
                  near-black ground, so it is cropped from the centre and shown
                  at full opacity — no veil over it. Only the bottom edge melts
                  into the card body, and only far enough to seat the copy
                  against it without touching the subject.
                */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--surface-sunken)]">
                  <Image
                    src={visual}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 62vw, 86vw"
                    className="object-cover object-center transition-transform duration-700 ease-[var(--ease-entrance)] motion-safe:group-hover:scale-[1.05]"
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-[linear-gradient(to_top,var(--surface-panel)_0%,color-mix(in_srgb,var(--surface-panel)_55%,transparent)_55%,transparent_100%)]"
                  />
                </div>

                {/*
                  The copy sits directly under the artwork — no `mt-auto`, no
                  `flex-1`. With the bodies levelled there is no surplus height
                  left to place, so neither is needed: earlier attempts used
                  `flex-1` (which opened a gap under the last line) and then
                  `mt-auto` (which pushed that gap above the copy, separating
                  the text from the image it describes).
                */}
                <div className="relative flex flex-col px-5 pb-6 pt-4">
                  {/* Icon and index share one quiet meta line, so the card opens
                      on its title rather than on a badge competing with it. The
                      icon is seated in a tile, matching every other glyph on
                      the page. */}
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
            </li>
          )
        })}
      </ul>

      {/*
        Arrows sit on the cards' own line rather than under them, pinned to the
        vertical centre of the visual panel. `top-[28%]` is half of the 16/10
        image band, so they stay centred on the artwork as the cards reflow.
        They are hidden below `sm` — on a phone the swipe is the primary
        gesture and a floating control would only cover the artwork.
      */}
      <CarouselButton
        label={labels.previous}
        disabled={edges.start}
        onClick={() => scrollToIndex(active - 1)}
        className="left-0 -translate-x-1/2"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden />
      </CarouselButton>
      <CarouselButton
        label={labels.next}
        disabled={edges.end}
        onClick={() => scrollToIndex(active + 1)}
        className="right-0 translate-x-1/2"
      >
        <ArrowRight className="h-5 w-5" aria-hidden />
      </CarouselButton>

      {/*
        Dots stay below, centred, as the only remaining control row.

        `w-11` on the button, not `w-6`: these are the carousel's primary
        control on a phone, and a 24px-wide target is half the 44px minimum.
        The painted dot inside stays small — the hit area grows, the visual
        does not, so the row still reads as a row of dots. `-mx-2.5` pulls the
        widened targets back to the original visual spacing.
      */}
      <div className="mt-7 flex items-center justify-center">
        {dots.map((index) => (
          <button
            key={index}
            type="button"
            onClick={() => scrollToIndex(index)}
            /* Carries its position in the set, so it is distinguishable from
               the slide it targets — the two used to share one string, which
               a screen reader read out twice with nothing marking which was
               the control. */
            aria-label={`${slides[index]?.label} (${index + 1}/${total})`}
            aria-current={index === active ? 'true' : undefined}
            className="group -mx-1 inline-flex h-11 w-11 items-center justify-center"
          >
            <span
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                index === active
                  ? 'w-7 bg-[var(--color-acento)]'
                  : 'w-1.5 bg-hairline-strong group-hover:bg-[var(--accent-hairline)]',
              )}
            />
          </button>
        ))}
      </div>
    </div>
  )
}

type CarouselButtonProps = {
  label: string
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
  /** Edge placement — the shared absolute positioning lives in the base class. */
  className?: string
}

/**
 * Overlay control, floated on the cards' own line.
 *
 * It now has a real surface — a frosted dark disc with a hairline — rather
 * than being a bare glyph on a drop shadow. A shadowed glyph over artwork is
 * legible on a dark card and invisible on a light one, so the control's
 * contrast depended on whichever image happened to be under it; the disc is
 * the same object over every slide. It is also the one place on the page where
 * a backdrop blur is unambiguously right: the control sits *over* content and
 * has to stay readable without hiding it.
 */
function CarouselButton({
  label,
  disabled,
  onClick,
  children,
  className,
}: CarouselButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        'absolute top-[28%] z-30 hidden h-11 w-11 -translate-y-1/2 sm:inline-flex',
        'items-center justify-center rounded-full text-ink',
        'border border-[color-mix(in_srgb,white_16%,transparent)]',
        'bg-[color-mix(in_srgb,var(--surface-sunken)_70%,transparent)]',
        'shadow-[inset_0_1px_0_color-mix(in_srgb,white_12%,transparent),var(--shadow-mid)]',
        'backdrop-blur-md backdrop-saturate-150',
        'transition-[color,background-color,border-color,opacity] duration-200',
        'hover:border-[var(--accent-hairline)] hover:bg-[color-mix(in_srgb,var(--color-acento)_22%,var(--surface-sunken))] hover:text-[var(--accent-text)]',
        'disabled:pointer-events-none disabled:opacity-0',
        className,
      )}
    >
      {children}
    </button>
  )
}
