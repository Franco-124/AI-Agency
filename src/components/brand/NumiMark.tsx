import type { SVGProps } from 'react'

/**
 * Numi AI brand mark: the four-point spark, redrawn as a vector so it can be
 * tinted, animated and rendered crisply at any size (the PNG in
 * `public/images/09-favicon-marca.png` stays the source of truth for favicons).
 */
export function NumiMark({ title, ...props }: SVGProps<SVGSVGElement> & { title?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <polygon points="55.6,20.2 56.5,45.2 71,50.2 30.6,50.2 41.5,44.8" />
      <polygon points="44.4,79.8 43.5,54.8 29,49.8 69.4,49.8 58.5,55.2" />
    </svg>
  )
}
