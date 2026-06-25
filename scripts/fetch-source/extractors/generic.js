/**
 * generic 通用文本提取器
 * 对应旧 fetch-sources.js:166-172 的 EXTRACTORS[1]
 */

import { stripHtml } from '../../lib/utils.js'

function extractFromText(text, chapterName, bookTitle) {
  const escapedName = chapterName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const startPatterns = [
    new RegExp(`《${bookTitle || '[^》]+'}》[^第]*第\\d+章\\s*${escapedName}`),
    /《[^》]+》[^第]*第\d+章\s*\S+/,
  ]

  const startIdx = startPatterns.reduce((idx, pat) => (idx === -1 ? text.search(pat) : idx), -1)
  if (startIdx === -1) return null

  const afterHeader = text.slice(startIdx).split('\n').slice(1).join('\n').trim()
  if (bookTitle) {
    const footerRe = new RegExp(
      `\\n${bookTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\n\\s*\\[`
    )
    const endIdx = afterHeader.search(footerRe)
    if (endIdx !== -1) return afterHeader.slice(0, endIdx)
  }
  return afterHeader
}

export function match(/* url */) {
  return true // fallback
}

export function extract(html, chapterName, bookTitle) {
  return extractFromText(stripHtml(html), chapterName, bookTitle)
}