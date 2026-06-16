// Vitest setup: Node 22+ ships its own localStorage/sessionStorage global with
// incomplete prototype (no clear/setItem). We replace it with a fresh jsdom
// localStorage so storage-using tests work as expected.
import { JSDOM } from 'jsdom'

const dom = new JSDOM('', { url: 'http://localhost:3000' })
;(globalThis as unknown as { localStorage: Storage }).localStorage = dom.window.localStorage
;(globalThis as unknown as { sessionStorage: Storage }).sessionStorage = dom.window.sessionStorage
