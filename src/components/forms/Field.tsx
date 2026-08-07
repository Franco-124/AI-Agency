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

const controlClasses = [
  'w-full rounded-lg border bg-[var(--color-neutro-oscuro)] px-4 py-3',
  'text-[0.9375rem] text-ink placeholder:text-ink-faint',
  'transition-colors duration-200',
  'hover:border-hairline-strong',
  'focus:border-[var(--accent-hairline)] focus:outline-none',
  'aria-[invalid=true]:border-[var(--color-acento)]',
].join(' ')

export function Field({ id, label, error, className, children }: FieldProps) {
  const errorId = `${id}-error`

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink-muted">
        {label}
      </label>

      {children({
        id,
        'aria-invalid': Boolean(error),
        'aria-describedby': error ? errorId : undefined,
        className: cn(controlClasses, 'min-h-11 border-hairline'),
      })}

      {/* Always mounted so assistive tech announces the change, not the node. */}
      <p id={errorId} aria-live="polite" className="text-xs text-[var(--color-acento)]">
        {error}
      </p>
    </div>
  )
}
