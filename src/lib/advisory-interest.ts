/**
 * Carries "which advisory offer did the visitor click" from the Advisory
 * section to the lead form, so the form can pre-fill both the "what are you
 * interested in" picker and the message field — the visitor already told us,
 * no need to type it again.
 *
 * Session storage, same mechanism as `package-interest.ts`: the CTAs stay
 * plain `#agenda` anchors, no navigation or extra render path.
 */
const STORAGE_KEY = 'numi:advisory-interest'

export const advisoryInterestKeys = ['diagnostic', 'training'] as const

export type AdvisoryInterestKey = (typeof advisoryInterestKeys)[number]

const isAdvisoryInterestKey = (value: string | null): value is AdvisoryInterestKey =>
  value !== null && advisoryInterestKeys.includes(value as AdvisoryInterestKey)

export function rememberAdvisoryInterest(key: AdvisoryInterestKey): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, key)
  } catch {
    // Private mode or a blocked storage API — the pre-fill is optional UX.
  }
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
