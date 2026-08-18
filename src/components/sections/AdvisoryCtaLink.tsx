'use client'

import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { rememberAdvisoryInterest, type AdvisoryInterestKey } from '@/lib/advisory-interest'
import { sectionIds } from '@/lib/site'

type AdvisoryCtaLinkProps = {
  interestKey: AdvisoryInterestKey
  variant: 'primary' | 'outline'
  children: ReactNode
}

/**
 * Mirrors `PackageCtaLink`: a plain hash anchor that only records which
 * advisory offer the visitor came from, so the form below can pre-fill
 * itself with it.
 */
export function AdvisoryCtaLink({ interestKey, variant, children }: AdvisoryCtaLinkProps) {
  return (
    <Button asChild block size="lg" variant={variant} className="mt-8">
      <a
        href={`#${sectionIds.finalCta}`}
        onClick={() => rememberAdvisoryInterest(interestKey)}
      >
        {children}
      </a>
    </Button>
  )
}
