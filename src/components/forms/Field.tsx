'use client'

import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type FieldProps = {
  id: string
  label: string
  error?: string
  className?: string
  children: (props: {
    id: string
    'aria-invalid': boolean
    'aria-describedby': string | undefined
    className: string
  }) => ReactNode
}

/**
 * Control surface.
 *
 * Recessed rather than flat: the field sits on the sunken surface with an
 * inner top shadow, so an input reads as a well cut into the panel — which is
 * what makes a form look built rather than drawn. Focus then lifts it, adding
 * an accent ring on top of the existing border instead of replacing it, so the
 * control never changes size between states.
 *
 * The focus ring is deliberately a `box-shadow` and not the global
 * `:focus-visible` outline: these controls are focused by pointer as well as
 * by keyboard, and the outline only paints for the latter.
 */
const controlClasses = [
  'w-full rounded-[0.5rem] border border-hairline bg-[var(--surface-sunken)] px-3.5 py-3',
  'text-[0.9375rem] text-ink placeholder:text-ink-faint',
  'shadow-[inset_0_1px_2px_rgba(4,2,8,0.5)]',
  'transition-[border-color,box-shadow,background-color] duration-200',
  'hover:border-hairline-strong',
  'focus:border-[var(--color-acento)] focus:bg-[var(--surface-base)] focus:outline-none',
  'focus:shadow-[inset_0_1px_2px_rgba(4,2,8,0.4),0_0_0_3px_var(--accent-soft)]',
  'aria-[invalid=true]:border-[var(--color-acento-lift)]',
].join(' ')

export function Field({ id, label, error, className, children }: FieldProps) {
  const errorId = `${id}-error`

  return (
    <div className={cn('flex min-w-0 flex-col gap-2', className)}>
      <label
        htmlFor={id}
        className="text-[0.8125rem] font-medium leading-none text-ink-muted"
      >
        {label}
      </label>

      {children({
        id,
        'aria-invalid': Boolean(error),
        'aria-describedby': error ? errorId : undefined,
        className: cn(controlClasses, 'min-h-11'),
      })}

      {/*
        Always mounted, and never hidden, so assistive tech announces the text
        changing rather than a node appearing. `display:none` on an empty live
        region is the trap here: a hidden region is removed from the
        accessibility tree, so the first error would announce nothing at all.
        The element stays in flow and simply has no height while empty.
      */}
      <p
        id={errorId}
        aria-live="polite"
        className="text-[0.75rem] leading-snug text-[var(--accent-text)]"
      >
        {error}
      </p>
    </div>
  )
}
