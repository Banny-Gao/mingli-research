// src/components/ModalReader/reader-mode/splitMarkdownByBlocks.ts
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import { MD_FALLBACK_CHARS_PER_PAGE } from './constants'

export interface MarkdownBlock {
  /** 序列化后的 markdown 字符串（单 block） */
  md: string
  /** 若该 block 是 heading，且有显式 id（rehype-slug 自动生成），记录之 */
  headingId?: string
  /** heading 级别（2/3）；非 heading 留空 */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6
}

/**
 * 把 markdown 字符串按顶级 block 切分成 N 份，每份独立可被 ReactMarkdown 渲染。
 *
 * - 顶级 block 定义: mdast root.children 的直接子节点（heading / paragraph / code / table / list / blockquote 等）
 * - 绝不断裂: code / table / 含 <mark> 的 paragraph 等节点完整的 block 不会被切碎
 * - 失败兜底: 抛错时按字符数硬切
 * - heading 索引: 若顶级 block 是 heading，附带原始文字（与 rehype-slug 行为近似），
 *   用于后续在 paginated 模式下做目录跳转
 */
export function splitMarkdownByBlocks(md: string): MarkdownBlock[] {
  if (!md.trim()) return []

  try {
    const tree = unified().use(remarkParse).parse(md)
    const blocks: MarkdownBlock[] = []
    const stringifier = unified().use(remarkStringify)

    for (const child of tree.children) {
      const subTree = { type: 'root' as const, children: [child] }
      const blockMd = stringifier.stringify(subTree).trimEnd()
      if (!blockMd) continue

      if (child.type === 'heading') {
        const depth = (child.depth as 1 | 2 | 3 | 4 | 5 | 6) ?? 1
        // 提取纯文本（与 rehype-slug 默认 slug 规则近似，去除标点+空格→-）
        const text = extractHeadingText(child)
        const headingId = slugify(text)
        blocks.push({ md: blockMd, headingId, headingLevel: depth })
      } else {
        blocks.push({ md: blockMd })
      }
    }

    return blocks
  } catch {
    // 失败兜底: 按字符数硬切（无 heading 索引）
    const result: MarkdownBlock[] = []
    for (let i = 0; i < md.length; i += MD_FALLBACK_CHARS_PER_PAGE) {
      result.push({ md: md.slice(i, i + MD_FALLBACK_CHARS_PER_PAGE) })
    }
    return result
  }
}

function extractHeadingText(node: { children?: unknown[] }): string {
  let out = ''
  const walk = (n: unknown) => {
    if (!n || typeof n !== 'object') return
    const obj = n as { value?: string; children?: unknown[] }
    if (typeof obj.value === 'string') out += obj.value
    if (Array.isArray(obj.children)) obj.children.forEach(walk)
  }
  walk(node)
  return out
}

/**
 * 与 rehype-slug 默认行为近似的 slug 规则：
 * 移除所有非 word / 中日韩 / 空白 / 连字符字符，按空白折叠成 `-`。
 * rehype-slug 在浏览器端运行时可能因依赖版本差异略有不同；这里使用近似规则，
 * 真正跳转会再 fallback 到按 heading 文字匹配。
 */
function slugify(text: string): string {
  return text
    .replace(/[^\w一-鿿\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()
}
