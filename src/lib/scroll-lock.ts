/**
 * Reference-counted body scroll lock.
 *
 * The page has two independent things that lock scrolling — the intro curtain
 * and the mobile menu — and they can overlap. Each used to save
 * `document.body.style.overflow` on lock and restore that saved value on
 * unlock, which is only correct while exactly one owner exists: if the menu
 * opened while the curtain still held the lock, the menu saved `'hidden'` as
 * the "previous" value and restored it on close, leaving the page permanently
 * unscrollable.
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
