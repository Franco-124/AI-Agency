import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'group/btn relative inline-flex items-center justify-center gap-2 rounded-[0.5rem]',
    'font-semibold tracking-[-0.01em] whitespace-nowrap select-none',
    'transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-out',
    'disabled:pointer-events-none disabled:opacity-55',
    'motion-safe:hover:-translate-y-px active:translate-y-0',
  ].join(' '),
  {
    variants: {
      variant: {
        // Primary CTA — flat violet fill, restrained hairline border.
        primary: 'btn-volume',
        // Secondary action — quiet dark surface, same geometry as primary.
        outline: 'btn-surface',
        // Form submit — same flat treatment as primary.
        solid: 'btn-volume',
        // Tertiary action — border-only with hover fill.
        'solid-outline': [
          'border border-hairline-strong bg-transparent text-ink',
          'hover:border-[var(--accent-hairline)] hover:bg-[var(--accent-soft)] hover:text-[var(--color-acento)]',
        ].join(' '),
        // Low-emphasis — minimal treatment, used in dense UI.
        subtle: [
          'border border-hairline bg-[var(--color-primario)] text-ink',
          'hover:border-hairline-strong',
        ].join(' '),
        // No chrome — text-only, for inline actions.
        ghost: 'text-ink-muted hover:text-ink',
        // Hero-only smoked-glass pair — scoped so no other CTA on the
        // site inherits this treatment. See .btn-hero-primary/-secondary.
        heroPrimary: 'btn-hero-primary rounded-[0.5625rem]',
        heroSecondary: 'btn-hero-secondary rounded-[0.5625rem]',
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
