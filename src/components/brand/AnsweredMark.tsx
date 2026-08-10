import type { SVGProps } from 'react'

/**
 * The site's signature mark: a chat bubble with its tail, checked off — the
 * literal shape of "a message that got answered." Used sparingly (see the
 * hero, the results testimonial and the Contrast "after" list) so it stays
 * recognizable instead of decorative.
 */
export function AnsweredMark({ title, ...props }: SVGProps<SVGSVGElement> & { title?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M4 6.5C4 5.12 5.12 4 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.2 3.2a.6.6 0 0 1-.96-.48V17H6.5A2.5 2.5 0 0 1 4 14.5v-8Z"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M8.25 10.75 10.5 13l5.25-5.25"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
