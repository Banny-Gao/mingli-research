/**
 * scripts/lib/utils.js — 共享工具函数
 */

/**
 * 剥离 HTML 标签和实体，还原为纯文本
 * @param {string} html
 * @param {{ collapseWhitespace?: boolean }} [opts]
 * @returns {string}
 */
export function stripHtml(html, opts = {}) {
  let text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&#?\w+;/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')

  if (opts.collapseWhitespace) {
    text = text.replace(/\s+/g, ' ').trim()
  }

  return text
}

/** 进度条: ████░░░░░░ 40% */
export function progressBar(current, total, width = 20) {
  const pct = Math.round((current / total) * 100)
  const filled = Math.round((current / total) * width)
  return `${'█'.repeat(filled)}${'░'.repeat(width - filled)} ${pct}%`
}

/** 毫秒 → 可读时长: "1m30s" */
export function formatDuration(ms) {
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m${s % 60}s`
}
