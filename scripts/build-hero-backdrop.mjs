/*
  Re-exports the hero backdrop from its source artwork.

  Run with: node scripts/build-hero-backdrop.mjs

  This exists because the shipped backdrop used to be a 1671px export that the
  Hero then graded in the browser with a CSS `filter`. Both halves of that were
  wrong:

    - 1671px is narrower than the viewport it covers. The hero is full-bleed,
      so on a 1920px desktop the browser was scaling the image *up*, and on a
      2x display it was scaling it up by nearly four. That is the softness.

    - The CSS filter ran `brightness(0.82)`, dimming the artwork by 18% on top
      of `saturate(0.45)`, which removed more than half its colour. That is the
      dullness. Its own comment called it a stopgap pending a re-export.

  This script is that re-export. The grade is baked into the file, so the Hero
  paints the artwork as-is and the `filter` is gone.

  The source is 1671x941, so the 2x target is a genuine upscale rather than a
  downsample from a larger master. Lanczos plus a light unsharp pass is the
  right tool for that: this is a soft gradient field with one bright sweep, not
  detailed photography, so there is no fine texture for the resample to
  invent — it just keeps the gradient smooth instead of letting the browser's
  cheaper bilinear scaler band it.
*/

import { statSync } from 'node:fs'

import sharp from 'sharp'

const SOURCE = 'assets/hero_new.png'
const OUTPUT = 'public/images/hero-backdrop.webp'

/** 2x the source, so the full-bleed hero has real pixels on HiDPI desktops. */
const TARGET_WIDTH = 3342

/*
  The grade, replacing the CSS filter that used to do this per-paint.

  `saturation` stays well under 1 for the same reason the CSS did: the raw
  artwork is brand violet at high chroma across the whole frame, and the
  surfaces below it on the page are neutral — at full chroma the hero reads as
  a purple-lit cover on a neutral document. But 0.45 took the light sweep grey
  along with it, which loses the one thing the image is for. 0.62 holds the
  hue in check while leaving the sweep legibly violet.

  `brightness` goes *up* rather than down. The old 0.82 was the main cause of
  the opacity, and it was never load-bearing for legibility: the scrim painted
  over this image in the Hero is what guarantees text contrast, so the artwork
  itself does not have to be dimmed to earn it.

  The `linear` pass is a small contrast lift (slope 1.05, -4 offset) to keep
  the midtones off the mud now that the field is brighter.
*/
const GRADE = {
  saturation: 0.62,
  brightness: 1.06,
}
const CONTRAST = { slope: 1.05, offset: -4 }

/*
  q90 rather than the default 80. At 3342px this is the LCP element on every
  viewport, and Next re-encodes per device anyway — so this file is the master
  the derivatives come from, and compression artifacts in it would be baked
  into every one of them.
*/
const WEBP = { quality: 90, effort: 6, smartSubsample: true }

async function main() {
  await sharp(SOURCE)
    .resize({ width: TARGET_WIDTH, kernel: sharp.kernel.lanczos3 })
    .modulate(GRADE)
    .linear(CONTRAST.slope, CONTRAST.offset)
    .sharpen({ sigma: 0.7 })
    .webp(WEBP)
    .toFile(OUTPUT)

  const { width, height } = await sharp(OUTPUT).metadata()
  const kb = (statSync(OUTPUT).size / 1024).toFixed(0)
  console.log(`${OUTPUT}: ${width}x${height}, ${kb}KB`)
}

main().catch((error) => {
  console.error('Failed to build the hero backdrop:', error)
  process.exit(1)
})
