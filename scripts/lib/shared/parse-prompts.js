/**
 * scripts/lib/shared/parse-prompts.js — 逗号分隔列表解析
 *
 * 支持 \, 转义逗号，供 t2i/i2i 的 CLI 解析共用。
 */

/**
 * 解析逗号分隔的 prompt 列表，支持 \, 转义。
 * @param {string} raw
 * @returns {string[]}
 */
export function parsePrompts(raw) {
  const result = []
  let current = ''
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === '\\' && raw[i + 1] === ',') {
      current += ','
      i++
    } else if (raw[i] === ',') {
      if (current.trim()) result.push(current.trim())
      current = ''
    } else {
      current += raw[i]
    }
  }
  if (current.trim()) result.push(current.trim())
  return result
}

/**
 * 解析逗号分隔的 input-images 列表（与 parsePrompts 同算法）。
 * @param {string} raw
 * @returns {string[]}
 */
export function parseInputImages(raw) {
  return parsePrompts(raw)
}
