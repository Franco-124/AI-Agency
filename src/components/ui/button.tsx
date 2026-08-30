import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'group/btn relative inline-flex items-center justify-center gap-2 rounded-lg',
    'font-medium tracking-[-0.01em] whitespace-nowrap select-none',
    'transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-out',
    'disabled:pointer-events-none disabled:opacity-55',
    'motion-safe:hover:-translate-y-px active:translate-y-0',
  ].join(' '),
  {
    variants: {
      variant: {
        // Primary CTA — volume gradient with top-down lighting, no glass blur.
        // Reads as a physical, manufactured control rather than a flat panel.
        primary: 'btn-volume',
        // Secondary action — surface gradient with subtle depth.
        outline: 'btn-surface',
        // Form submit — same volume treatment as primary but standalone
        // (no backdrop-filter dependency, stays legible anywhere).
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
      },
      size: {
        // 44px minimum touch target on every interactive size.
        sm: 'h-11 px-4 text-sm',
        md: 'h-12 px-5 text-[0.9375rem]',
        lg: 'h-14 px-7 text-base',
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
