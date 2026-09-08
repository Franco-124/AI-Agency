/**
 * How a price string should be typeset.
 *
 * The offer copy is fixed and mixes two very different shapes under one
 * "price" key:
 *
 *   "Desde COP $3.000.000"                                    — a figure
 *   "Desde COP $700.000 · 1–2 sesiones"                        — a figure plus terms
 *   "Desde COP $800.000 hasta COP $1.500.000, según la …"      — a sentence
 *
 * Setting all three at the same display-face figure scale put a 71-character
 * sentence at 26px, where it outweighed the section title above it and wrapped
 * to two lines that no longer read as a number at all.
 *
 * So the treatment adapts to the string rather than to the tier: short strings
 * keep the figure scale, long ones drop to emphasised body copy. Keyed on
 * length, not on which offer it is, so it keeps holding if any tier's copy
 * changes or a locale phrases one differently — the English and Spanish
 * strings already differ in length by up to six characters.
 */

/** Longest string that still scans as a figure rather than as a phrase. */
const FIGURE_MAX_LENGTH = 34

export type PriceScale = 'figure' | 'phrase'

export const priceScale = (price: string): PriceScale =>
  price.length <= FIGURE_MAX_LENGTH ? 'figure' : 'phrase'

/**
 * Tailwind classes for each scale. Shared by `Packages` and `Advisory` so the
 * two offer blocks cannot drift apart — they are read side by side.
 */
export const priceClasses: Record<PriceScale, string> = {
  figure: 'type-figure text-[1.5rem] sm:text-[1.625rem]',
  phrase: 'text-[0.9375rem] font-semibold leading-[1.5] tracking-[-0.01em]',
}
