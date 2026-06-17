// src/components/ModalReader/reader-mode/persistence.ts
import { SCROLL_KEY_PREFIX, PAGE_KEY_PREFIX } from './constants'

const scrollKey = (bookSlug: string, modalType: string, modalKey: string) =>
  `${SCROLL_KEY_PREFIX}${bookSlug}:${modalType}:${modalKey}`

const pageKey = (bookSlug: string, modalType: string, modalKey: string) =>
  `${PAGE_KEY_PREFIX}${bookSlug}:${modalType}:${modalKey}`

function safeGet(key: string): string | null {
  try { return sessionStorage.getItem(key) } catch { return null }
}

function safeSet(key: string, value: string) {
  try { sessionStorage.setItem(key, value) } catch { /* 静默 */ }
}

export function saveScroll(bookSlug: string, modalType: string, modalKey: string, top: number) {
  safeSet(scrollKey(bookSlug, modalType, modalKey), String(top))
}

export function loadScroll(bookSlug: string, modalType: string, modalKey: string): number {
  const v = safeGet(scrollKey(bookSlug, modalType, modalKey))
  return v ? Number(v) || 0 : 0
}

export function savePage(bookSlug: string, modalType: string, modalKey: string, idx: number) {
  safeSet(pageKey(bookSlug, modalType, modalKey), String(idx))
}

export function loadPage(bookSlug: string, modalType: string, modalKey: string): number {
  const v = safeGet(pageKey(bookSlug, modalType, modalKey))
  return v ? Number(v) || 0 : 0
}
