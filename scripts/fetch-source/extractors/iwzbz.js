/**
 * iwzbz.com 提取器
 * 对应旧 fetch-sources.js:154-165 的 EXTRACTORS[0]
 */

import { stripHtml } from '../../lib/utils.js'

function extractParagraphs(innerHtml, chapterName, opts = {}) {
  const pMatches = innerHtml.match(/<p[^>]*>(.*?)<\/p>/gi)
  if (!pMatches) return null

  const skipExact = new Set([chapterName])
  const { skipHtml } = opts
  const lines = []
  let prevEmpty = false

  for (const p of pMatches) {
    const inner = p.replace(/<\/?p[^>]*>/gi, '').trim()
    if (skipHtml && skipHtml.test(inner)) continue
    const text = stripHtml(p).trim()
    if (skipExact.has(text) && text.length < 20) continue
    if (text) {
      lines.push(text)
      prevEmpty = false
    } else if (!prevEmpty) {
      lines.push('')
      prevEmpty = true
    }
  }

  return lines.join('\n')
}

export function match(url) {
  return /iwzbz\.com/.test(url)
}

export function extract(html, chapterName /* , bookTitle */) {
  const div = html.match(/<div\s+class="book-detail-content">([\s\S]*?)<\/div>/i)
  if (!div) return null
  return extractParagraphs(div[1], chapterName, {
    skipHtml: /^<font\s+class=['"]gold['"]>\s*.+?\s*<\/font>\s*$/i,
  })
}