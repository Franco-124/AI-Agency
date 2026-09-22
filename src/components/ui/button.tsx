import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    // `rounded-full`: every button in the Stitch comp is a full pill,
    // regardless of size — not just "rounder corners".
    'group/btn relative inline-flex items-center justify-center gap-2 rounded-full',
    'font-semibold tracking-normal whitespace-nowrap select-none',
    'transition-[background-color,border-color,color,box-shadow] duration-200 ease-out',
    'disabled:pointer-events-none disabled:opacity-55',
  ].join(' '),
  {
    variants: {
      variant: {
        // Primary CTA — solid violet fill.
        primary: 'btn-volume',
        // Secondary action — outline only, same geometry as primary.
        outline: 'btn-surface',
        // Form submit — same flat treatment as primary.
        solid: 'btn-volume',
        // Tertiary action — border-only with hover fill.
        'solid-outline': [
          'border border-hairline-strong bg-transparent text-ink',
          'hover:border-[var(--accent-hairline)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent-text)]',
        ].join(' '),
        // Low-emphasis — minimal treatment, used in dense UI.
        subtle: [
          'border border-hairline bg-[var(--color-primario)] text-ink',
          'hover:border-hairline-strong',
        ].join(' '),
        // No chrome — text-only, for inline actions.
        ghost: 'text-ink-muted hover:text-ink',
        // Hero-only pair. Now identical in treatment to the site buttons and
        // kept separate only so the hero can diverge without touching them.
        // See .btn-hero-primary/-secondary.
        heroPrimary: 'btn-hero-primary',
        heroSecondary: 'btn-hero-secondary',
      },
      size: {
        // 44px minimum touch target on every interactive size.
        sm: 'h-11 px-4 text-sm',
        md: 'h-12 px-5 text-[0.9375rem]',
        lg: 'h-[3.125rem] px-6 text-[0.9375rem]',
      },
      block: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      block: false,
    },
  },
)

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

export function Button({
  className,
  variant,
  size,
  block,
  asChild = false,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : 'button'

  return (
    <Component
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...props}
    />
  )
}

export { buttonVariants }
