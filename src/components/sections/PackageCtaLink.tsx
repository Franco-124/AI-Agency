'use client'

import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { rememberPackageInterest, type PackageKey } from '@/lib/package-interest'
import { sectionIds } from '@/lib/site'

type PackageCtaLinkProps = {
  packageKey: PackageKey
  variant: 'primary' | 'outline'
  children: ReactNode
}

/**
 * The package cards' CTA. It stays a plain hash anchor — native scrolling, no
 * navigation — and only records which package the visitor came from so the
 * lead notification can say it.
 */
export function PackageCtaLink({ packageKey, variant, children }: PackageCtaLinkProps) {
  return (
    <Button asChild block size="lg" variant={variant} className="mt-8">
      <a
        href={`#${sectionIds.finalCta}`}
        onClick={() => rememberPackageInterest(packageKey)}
      >
        {children}
      </a>
    </Button>
  )
}
