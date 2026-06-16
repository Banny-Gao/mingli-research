import { SCROLL_KEY_PREFIX, PAGE_KEY_PREFIX } from './constants'

export const scrollKey = (book: string, type: string, key: string) =>
  `${SCROLL_KEY_PREFIX}${book}:${type}:${key}`

export const pageKey = (book: string, type: string, key: string) =>
  `${PAGE_KEY_PREFIX}${book}:${type}:${key}`

function safeGet(k: string): string | null {
  try { return sessionStorage.getItem(k) } catch { return null }
}
function safeSet(k: string, v: string) {
  try { sessionStorage.setItem(k, v) } catch { /* ignore */ }
}

export function saveScroll(book: string, type: string, key: string, top: number) {
  safeSet(scrollKey(book, type, key), String(top))
}

export function loadScroll(book: string, type: string, key: string): number {
  const v = safeGet(scrollKey(book, type, key))
  return v ? Number(v) : 0
}

export function savePage(book: string, type: string, key: string, idx: number) {
  safeSet(pageKey(book, type, key), String(idx))
}

export function loadPage(book: string, type: string, key: string): number {
  const v = safeGet(pageKey(book, type, key))
  return v ? Number(v) : 0
}
