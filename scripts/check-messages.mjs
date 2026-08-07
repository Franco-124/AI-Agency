/**
 * Verifies every locale file in `messages/` against `messages/es.json`, which is
 * the source of truth for the key structure.
 *
 * This replaces the previous generator, which rebuilt `en.json` from `es.json` on
 * every `predev`/`prebuild`. Now that the English copy is a real translation
 * rather than a placeholder, regenerating it would silently overwrite it — so the
 * build-time step validates instead of writing.
 *
 * Fails the build on a missing key, an extra key, an empty string, or a leftover
 * `[PENDING …]` placeholder. Run with: `npm run i18n:check`
 */
import { readFile, readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const SOURCE_LOCALE = 'es'
const PLACEHOLDER = /^\[PENDING/

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const messagesDir = path.join(rootDir, 'messages')

/**
 * Flattens a message tree into dot-separated paths so two locales can be
 * compared as plain sets of leaves.
 *
 * @param {unknown} value
 * @param {string} prefix
 * @returns {Map<string, string>}
 */
const flatten = (value, prefix = '') => {
  const leaves = new Map()

  if (value !== null && typeof value === 'object') {
    for (const [key, nested] of Object.entries(value)) {
      const nestedPath = prefix ? `${prefix}.${key}` : key

      for (const [leafPath, leafValue] of flatten(nested, nestedPath)) {
        leaves.set(leafPath, leafValue)
      }
    }

    return leaves
  }

  leaves.set(prefix, String(value))

  return leaves
}

const readMessages = async (locale) =>
  flatten(JSON.parse(await readFile(path.join(messagesDir, `${locale}.json`), 'utf8')))

try {
  const files = await readdir(messagesDir)
  const locales = files
    .filter((file) => file.endsWith('.json'))
    .map((file) => path.basename(file, '.json'))

  if (!locales.includes(SOURCE_LOCALE)) {
    throw new Error(`missing source locale messages/${SOURCE_LOCALE}.json`)
  }

  const source = await readMessages(SOURCE_LOCALE)
  const problems = []

  for (const locale of locales) {
    if (locale === SOURCE_LOCALE) continue

    const target = await readMessages(locale)

    for (const key of source.keys()) {
      if (!target.has(key)) problems.push(`${locale}: missing key "${key}"`)
    }

    for (const [key, value] of target) {
      if (!source.has(key)) {
        problems.push(`${locale}: key "${key}" does not exist in ${SOURCE_LOCALE}.json`)
        continue
      }

      if (value.trim().length === 0) problems.push(`${locale}: empty value for "${key}"`)
      if (PLACEHOLDER.test(value)) {
        problems.push(`${locale}: untranslated placeholder at "${key}"`)
      }
    }
  }

  if (problems.length > 0) {
    console.error(`Message check failed (${problems.length} problem(s)):`)
    for (const problem of problems) console.error(`  - ${problem}`)
    process.exitCode = 1
  } else {
    const others = locales.filter((locale) => locale !== SOURCE_LOCALE)
    console.log(
      `Messages OK — ${source.size} keys, ${others.length} locale(s) in parity with ${SOURCE_LOCALE}: ${others.join(', ')}`,
    )
  }
} catch (error) {
  console.error('Failed to check messages:', error)
  process.exitCode = 1
}
