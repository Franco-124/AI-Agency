'use client'

import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { Plus } from 'lucide-react'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

function Accordion({ ...props }: ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

function AccordionItem({
  className,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn('border-b border-hairline last:border-b-0', className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'group flex flex-1 items-start justify-between gap-6 py-6 text-left',
          'text-base font-medium leading-snug text-ink transition-colors duration-200',
          'hover:text-[var(--color-acento)] sm:text-lg',
          className,
        )}
        {...props}
      >
        {children}
        <Plus
          aria-hidden
          className="mt-0.5 h-5 w-5 shrink-0 text-ink-faint transition-transform duration-300 group-data-[state=open]:rotate-45 group-data-[state=open]:text-[var(--color-acento)]"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden data-[state=closed]:animate-[accordion-up_240ms_ease-out] data-[state=open]:animate-[accordion-down_240ms_ease-out]"
      {...props}
    >
      <div className={cn('pb-7 pr-11 text-[0.9375rem] leading-relaxed text-ink-muted', className)}>
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
