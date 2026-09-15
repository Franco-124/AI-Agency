type HeroMarqueeProps = {
  /** Accessible name for the strip, e.g. "Lo que automatizamos". */
  label: string
  /** Phrases in reading order. Rendered twice — see below. */
  items: ReadonlyArray<string>
}

/*
  The phrase strip that closes the hero.

  It replaces the "trusted by" logo row of the reference frame: that row's job
  is to say "this is real" before the visitor scrolls, and with no client logos
  to show yet, naming the concrete outcomes does the same job honestly rather
  than with placeholder marks.

  Animated in CSS rather than with the motion library already in the tree. A
  marquee is a single infinite transform with no state, no scroll coupling and
  no interaction — running it on the compositor costs nothing per frame, while
  a JS-driven one re-renders for the entire time the section is on screen.
*/
export function HeroMarquee({ label, items }: HeroMarqueeProps) {
  return (
    <div
      className="hero-marquee relative w-full overflow-hidden py-6"
      role="group"
      aria-label={label}
    >
      {/*
        The track holds the phrase list twice. The animation translates it by
        exactly -50%, which lands the second copy's first phrase where the
        first copy's started — so the loop closes on itself with no visible
        jump and no measuring in JS.

        The duplicate is `aria-hidden`: it is the same sentence list a second
        time, and a screen reader announcing all nine phrases twice is noise,
        not content.
      */}
      <div className="hero-marquee-track flex w-max shrink-0 items-center">
        <MarqueeRun items={items} />
        <MarqueeRun items={items} aria-hidden />
      </div>
    </div>
  )
}

/** One full pass of the phrase list, each phrase followed by its separator. */
function MarqueeRun({
  items,
  ...rest
}: { items: ReadonlyArray<string> } & { 'aria-hidden'?: boolean }) {
  return (
    <ul className="flex items-center gap-10 pr-10" {...rest}>
      {items.map((item) => (
        <li
          key={item}
          className="flex shrink-0 items-center gap-10 whitespace-nowrap text-[0.875rem] leading-none text-[var(--text-muted)]"
        >
          {item}
          {/*
            Decorative: the middot separates phrases visually, but read aloud
            between every pair it adds nothing.
          */}
          <span aria-hidden className="text-[var(--color-acento)]">
            ·
          </span>
        </li>
      ))}
    </ul>
  )
}
