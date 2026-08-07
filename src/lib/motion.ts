/**
 * Motion primitives shared by every scroll-driven effect on the page.
 *
 * The landing has ~30 independently revealed blocks. Giving each one its own
 * IntersectionObserver means ~30 observers competing for the same scroll
 * callbacks, so observers are pooled per configuration instead: every element
 * that reveals with the same rootMargin/threshold rides one observer.
 */

type ObserveOptions = {
  rootMargin?: string
  threshold?: number
}

type Registry = {
  observer: IntersectionObserver
  handlers: Map<Element, () => void>
}

const registries = new Map<string, Registry>()

const noop = () => {}

const getRegistry = (rootMargin: string, threshold: number): Registry => {
  const key = `${rootMargin}|${threshold}`
  const existing = registries.get(key)

  if (existing) return existing

  const handlers = new Map<Element, () => void>()
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue

        const handler = handlers.get(entry.target)
        // One-shot: stop watching before running the handler so a handler that
        // mutates layout can never re-enter through a synchronous callback.
        handlers.delete(entry.target)
        observer.unobserve(entry.target)
        handler?.()
      }
    },
    { rootMargin, threshold },
  )

  const registry: Registry = { observer, handlers }
  registries.set(key, registry)

  return registry
}

/**
 * Calls `onEnter` the first time `node` scrolls into view, then stops watching.
 *
 * Returns a teardown function. When IntersectionObserver is unavailable the
 * callback fires immediately, so content is never left in its hidden state.
 */
export function observeOnce(
  node: Element,
  onEnter: () => void,
  { rootMargin = '0px', threshold = 0 }: ObserveOptions = {},
): () => void {
  if (typeof IntersectionObserver === 'undefined') {
    onEnter()
    return noop
  }

  const registry = getRegistry(rootMargin, threshold)

  registry.handlers.set(node, onEnter)
  registry.observer.observe(node)

  return () => {
    registry.handlers.delete(node)
    registry.observer.unobserve(node)
  }
}

/** Read at effect time rather than render time, so SSR output never depends on it. */
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
