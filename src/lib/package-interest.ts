/**
 * Carries "which package card did the visitor come from" between the packages
 * section and the form at the bottom of the same page.
 *
 * Session storage rather than a query string on purpose: the CTAs stay plain
 * `#agenda` anchors, so there is no navigation, no reload and no extra render
 * path just to label a lead.
 */
const STORAGE_KEY = 'numi:package-interest'

export const packageKeys = ['one', 'two', 'three'] as const

export type PackageKey = (typeof packageKeys)[number]

const isPackageKey = (value: string | null): value is PackageKey =>
  value !== null && packageKeys.includes(value as PackageKey)

export function rememberPackageInterest(key: PackageKey): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, key)
  } catch {
    // Private mode or a blocked storage API — the label is optional metadata.
  }
}

export function readPackageInterest(): PackageKey | undefined {
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY)

    return isPackageKey(stored) ? stored : undefined
  } catch {
    return undefined
  }
}

export function forgetPackageInterest(): void {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to clean up if storage is unavailable.
  }
}
