/**
 * Generates `messages/en.json` from `messages/es.json`, keeping the exact same key
 * structure but marking every value as awaiting a validated English translation.
 *
 * The English copy is not an approved deliverable yet, so we never invent it here.
 * Run with: `npm run i18n:en`
 */
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const PENDING_PREFIX = '[PENDING EN TRANSLATION] '

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourcePath = path.join(rootDir, 'messages', 'es.json')
const targetPath = path.join(rootDir, 'messages', 'en.json')

/**
 * @param {unknown} value
 * @returns {unknown}
 */
const markPending = (value) => {
  if (typeof value === 'string') {
    return `${PENDING_PREFIX}${value}`
  }

  if (Array.isArray(value)) {
    return value.map(markPending)
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, markPending(nested)]),
    )
  }

  return value
}

try {
  const source = JSON.parse(await readFile(sourcePath, 'utf8'))
  await writeFile(targetPath, `${JSON.stringify(markPending(source), null, 2)}\n`, 'utf8')
  console.log(`Generated ${path.relative(rootDir, targetPath)} from es.json`)
} catch (error) {
  console.error('Failed to generate en.json:', error)
  process.exitCode = 1
}
