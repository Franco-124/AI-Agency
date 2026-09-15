/**
 * Reference-counted body scroll lock.
 *
 * The mobile menu is currently the only owner — the intro curtain, which was
 * the second, has been removed. The counting is kept deliberately: it is what
 * makes a second owner safe to add, and the bug it fixes is subtle enough to
 * be worth not re-introducing. Each owner saving and restoring
 * `document.body.style.overflow` for itself is only correct while exactly one
 * exists; with two, whichever locks second saves `'hidden'` as the "previous"
 * value and restores it on close, leaving the page permanently unscrollable.
 *
 * Counting fixes that regardless of ordering: the real style is captured once,
 * when the count goes 0 -> 1, and restored once, when it returns to 0.
 *
 * `scrollbar-gutter: stable` on `html` (see globals.css) is what keeps the
 * classic-scrollbar desktop case from shifting the page sideways when the
 * scrollbar is removed — the lock itself deliberately does not compensate with
 * padding, because the gutter is already reserved.
 */
let lockCount = 0
let restoreOverflow = ''

export function lockScroll(): void {
  if (typeof document === 'undefined') return

  if (lockCount === 0) {
    restoreOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }

  lockCount += 1
}

export function unlockScroll(): void {
  if (typeof document === 'undefined') return
  if (lockCount === 0) return

  lockCount -= 1

  if (lockCount === 0) {
    document.body.style.overflow = restoreOverflow
    restoreOverflow = ''
  }
}
