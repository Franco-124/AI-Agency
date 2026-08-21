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
        // Frosted-glass CTA: translucent accent fill + backdrop blur + a thin
        // light-catching border, for navigation/action CTAs (never form
        // controls — those use `solid`/`solid-outline` so a bare fill never
        // depends on backdrop-filter support to stay legible).
        primary: ['btn-glass btn-glass-primary', 'active:scale-[0.98]'].join(' '),
        outline: ['btn-glass btn-glass-outline', 'active:scale-[0.98]'].join(' '),
        // Pre-glass solid treatment, kept for form controls: a fill that
        // never relies on backdrop-filter, so it stays legible with nothing
        // behind it to blur.
        solid: [
          'btn-sweep btn-lit',
          'bg-[var(--color-acento)] text-[var(--color-neutro-oscuro)]',
          'hover:bg-[color-mix(in_srgb,var(--color-acento)_92%,white)]',
        ].join(' '),
        'solid-outline': [
          'btn-sweep border border-hairline-strong bg-transparent text-ink',
          'hover:border-[var(--accent-hairline)] hover:bg-[var(--accent-soft)] hover:text-[var(--color-acento)]',
        ].join(' '),
        subtle: [
          'btn-sweep border border-hairline bg-[var(--color-primario)] text-ink',
          'hover:border-hairline-strong',
        ].join(' '),
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
