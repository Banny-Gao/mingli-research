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
 * - 有 charCount 的 slot 根据字数比例缩放字号：actualSize = size × (charCount / actualCharCount)
 * - 无 charCount 的 slot 保持固定 size
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

      // 字号自适应（仅当指定了 charCount 时生效）
      if (t.charCount != null) {
        const charCount = [...content].length
        resolved.size = Math.round(t.size * (t.charCount / charCount))
        delete resolved.charCount
      }

      return resolved
    })
    .filter(Boolean)
}

// ===== scaleTextsToCanvas =====

/**
 * 把基准画布下的字号归一化到实际画布宽度。
 *
 * 模板里的 size 是"在 refCanvas 基准画布下的像素值"，不同分辨率模板复用同一套
 * 字号时，实际渲染需按 实际画布宽 / refCanvas 缩放，否则高分辨率底图上字会偏小。
 *
 * @param {Array<object>} texts - resolveTexts 的输出（size 为基准画布像素值）
 * @param {number} refCanvas - 模板基准画布宽（像素）
 * @param {number} canvasWidth - 实际背景图宽（像素）
 * @returns {Array<object>} 缩放后的新数组（不修改入参）
 */
export function scaleTextsToCanvas(texts, refCanvas, canvasWidth) {
  if (!refCanvas || !canvasWidth || refCanvas === canvasWidth) return texts
  const scale = canvasWidth / refCanvas
  if (scale === 1) return texts
  return texts.map(t => (t.size != null ? { ...t, size: Math.round(t.size * scale) } : t))
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
