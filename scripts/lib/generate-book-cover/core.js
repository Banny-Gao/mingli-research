/**
 * scripts/lib/generate-book-cover/core.js — 纯函数
 *
 * 无副作用，可被 vitest 直接 import。
 */

// ===== parseCatalogMd =====

/**
 * 从 catalog.md 内容中提取书名和作者。
 * @param {string} content - catalog.md 全文
 * @returns {{ title: string|null, author: string }}
 */
export function parseCatalogMd(content) {
  const titleMatch = content.match(/^#\s*《(.+?)》/m)
  const authorMatch = content.match(/^>\s*作者：(.+)/m)
  return {
    title: titleMatch ? titleMatch[1].trim() : null,
    author: authorMatch ? authorMatch[1].trim() : '',
  }
}

// ===== resolveTexts =====

/**
 * 将模板 texts 数组中的占位符替换为实际值。
 * - {{title}} / {{author}} / {{subtitle}} → 实际文本
 * - 替换后 content 为空字符串的 slot 被过滤掉
 * - 有 sizeMin/sizeMax 的 slot 根据字数线性缩放字号
 *
 * @param {Array<object>} templateTexts - 模板的 texts 数组
 * @param {{ title: string, author: string, subtitle?: string }} book
 * @returns {Array<object>} 替换后的 texts 数组（深拷贝，不修改原模板）
 */
export function resolveTexts(templateTexts, book) {
  const placeholders = {
    '{{title}}': book.title || '',
    '{{author}}': book.author || '',
    '{{subtitle}}': book.subtitle || '',
  }

  return templateTexts
    .map(t => {
      const resolved = { ...t }
      let content = t.content
      for (const [placeholder, value] of Object.entries(placeholders)) {
        content = content.replaceAll(placeholder, value)
      }
      resolved.content = content

      // 空 slot 跳过
      if (!content.trim()) return null

      // 字号自适应（仅当指定了 sizeMin/sizeMax 时生效）
      if (t.sizeMin != null && t.sizeMax != null) {
        const charCount = [...content].length
        // 线性插值：2字→sizeMax, 8字→sizeMin
        const ratio = Math.max(0, Math.min(1, (charCount - 2) / (8 - 2)))
        resolved.size = Math.round(t.sizeMax - ratio * (t.sizeMax - t.sizeMin))
        delete resolved.sizeMin
        delete resolved.sizeMax
      }

      return resolved
    })
    .filter(Boolean)
}

// ===== buildMetadata =====

/**
 * 构建与 t2i 兼容的 metadata JSON 对象。
 * @param {{ book: {title, author}, texts: Array, bgPath: string, filename: string, size: number }} params
 * @returns {object}
 */
export function buildMetadata({ book, texts, bgPath, filename, size }) {
  const timestamp = new Date().toISOString()
  return {
    timestamp,
    type: 't2i',
    prompt: `书籍名称：${book.title},作者信息：${book.author}`,
    apiPrompt: `书籍名称：${book.title},作者信息：${book.author}`,
    model: 'image-01',
    aspectRatio: '3:4',
    width: null,
    height: null,
    style: null,
    n: 1,
    seed: null,
    promptOptimizer: false,
    promptOptimizerEffective: false,
    aigcWatermark: false,
    responseFormat: 'url',
    name: book.title,
    results: [
      {
        filename,
        size,
        reusedFrom: bgPath,
      },
    ],
    textOverlay: {
      intent: null,
      cleanPrompt: null,
      reservedAreas: [],
      texts,
      bgInfo: null,
      llmCalls: [],
    },
    backgroundPath: bgPath,
  }
}
