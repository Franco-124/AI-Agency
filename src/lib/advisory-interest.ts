/**
 * Carries "which advisory offer did the visitor click" from the Advisory
 * section to the lead form, so the form can pre-fill both the "what are you
 * interested in" picker and the message field — the visitor already told us,
 * no need to type it again.
 *
 * The landing is a single page: the form is already mounted by the time the
 * visitor clicks a CTA further up, so session storage alone is not enough —
 * nothing re-reads it after mount. `rememberAdvisoryInterest` also dispatches
 * a same-tab custom event so the mounted form can react immediately, on any
 * device (this has nothing to do with hover/touch, just click timing).
 * Session storage stays as the fallback for the case where the form has not
 * mounted yet.
 */
const STORAGE_KEY = 'numi:advisory-interest'
export const ADVISORY_INTEREST_EVENT = 'numi:advisory-interest'

export const advisoryInterestKeys = ['diagnostic', 'training'] as const

export type AdvisoryInterestKey = (typeof advisoryInterestKeys)[number]

const isAdvisoryInterestKey = (value: string | null): value is AdvisoryInterestKey =>
  value !== null && advisoryInterestKeys.includes(value as AdvisoryInterestKey)

export function rememberAdvisoryInterest(key: AdvisoryInterestKey): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, key)
  } catch {
    // Private mode or a blocked storage API — the event below still carries it.
  }

  window.dispatchEvent(new CustomEvent<AdvisoryInterestKey>(ADVISORY_INTEREST_EVENT, { detail: key }))
}

export function readAdvisoryInterest(): AdvisoryInterestKey | undefined {
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY)

    return isAdvisoryInterestKey(stored) ? stored : undefined
  } catch {
    return undefined
  }
}

export function forgetAdvisoryInterest(): void {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to clean up if storage is unavailable.
  }
}
