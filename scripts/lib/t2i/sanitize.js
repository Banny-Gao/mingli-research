/**
 * scripts/lib/t2i/sanitize.js — cleanPrompt 安全后处理 + JSON/文本清洗
 *
 * 职责：
 * 1. FORBIDDEN_PATTERNS — 禁止词/模式列表（诱导 T2I 生成乱码的词）
 * 2. sanitizeCleanPrompt — 应用禁止模式 + 追加反文字后缀 + 长度保护
 * 3. cleanJSON / cleanText — 剥除 LLM 输出的 markdown 代码块
 */

/**
 * cleanPrompt 禁止词/模式列表 — 这些词会诱导 T2I 模型生成乱码文字。
 */
export const FORBIDDEN_PATTERNS = [
  /《[^》]*》/g, // 中文书名号
  /「[^」]*」/g, // 中文引号
  /『[^』]*』/g, // 中文双引号
  /"[^"]{2,}"/g, // 英文引号包裹的多字符内容
  /'[^']{2,}'/g, // 英文单引号包裹的多字符内容
  /文字/g,
  /字符/g,
  /标题/g,
  /书名/g, // 文字相关概念词
  /署名/g,
  /落款/g,
  /印章/g,
  /题字/g, // 签名/印章相关
  /排版/g,
  /字体/g,
  /字号/g,
  /竖排/g, // 排版相关
  /横排/g,
  /标签/g,
  /水印/g, // 更多排版相关
]

/**
 * 对 LLM 生成的 cleanPrompt 做安全后处理：
 * 1. 去除禁止模式
 * 2. 清理多余空白
 * 3. 追加多语言反文字后缀
 * 4. 长度截断保护
 */
export function sanitizeCleanPrompt(raw) {
  let result = raw

  // 1. 应用所有禁止模式替换
  for (const pattern of FORBIDDEN_PATTERNS) {
    result = result.replace(pattern, '')
  }

  // 2. 清理多余空白（连续空格 → 单空格，连续换行 → 最多两个换行）
  result = result.replace(/[ \t]+/g, ' ')
  result = result.replace(/\n{3,}/g, '\n\n')

  // 3. 去掉首尾空白
  result = result.trim()

  // 4. 追加反文字后缀（中英双语，确保 T2I 模型理解）
  const ANTI_TEXT_SUFFIX =
    ' No text, no letters, no characters, no symbols, no watermarks, no signatures, no seals — pure visual image only. 画面中不得出现任何文字、字母、符号、数字、水印或印章。'

  // 如果 prompt 已很长，用精简版后缀
  const suffix = result.length > 1300 ? ' NO TEXT, NO LETTERS, NO SYMBOLS.' : ANTI_TEXT_SUFFIX

  // 5. 长度保护：确保最终 prompt 不超过 1500 字符
  const MAX_LENGTH = 1500
  const suffixLen = suffix.length
  if (result.length + suffixLen > MAX_LENGTH) {
    // 截断主文本，为后缀留空间
    result = result.slice(0, MAX_LENGTH - suffixLen - 3) + '...'
  }
  result = result + suffix

  return result
}

/**
 * 清理 LLM 返回的 JSON 字符串（去掉可能的 markdown 代码块标记）。
 */
export function cleanJSON(text) {
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}

/**
 * 清理 LLM 返回的纯文本（去掉可能的 markdown 代码块标记）。
 */
export function cleanText(text) {
  return text
    .replace(/^```(?:text)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}
