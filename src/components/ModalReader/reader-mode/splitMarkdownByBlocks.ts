// src/components/ModalReader/reader-mode/splitMarkdownByBlocks.ts
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import { MD_FALLBACK_CHARS_PER_PAGE } from './constants'

/**
 * 把 markdown 字符串按顶级 block 切分成 N 份，每份独立可被 ReactMarkdown 渲染。
 *
 * - 顶级 block 定义: mdast root.children 的直接子节点（heading / paragraph / code / table / list / blockquote 等）
 * - 绝不断裂: code / table / 含 <mark> 的 paragraph 等节点完整的 block 不会被切碎
 * - 失败兜底: 抛错时按字符数硬切
 *
 * 验证结果（spike/verify-remark-roundtrip.mjs）:
 * - <mark> 标签 100% 保留（包括属性、闭合标签）
 * - mermaid / table / heading / list / blockquote 完整
 * - 唯一差异: remark-stringify 默认用 * 做列表标记符（原 -），ReactMarkdown 渲染等价
 */
export function splitMarkdownByBlocks(md: string): string[] {
  if (!md.trim()) return []

  try {
    const tree = unified().use(remarkParse).parse(md)
    const blocks: string[] = []
    const stringifier = unified().use(remarkStringify)

    for (const child of tree.children) {
      const subTree = { type: 'root' as const, children: [child] }
      const blockMd = stringifier.stringify(subTree).trimEnd()
      if (blockMd) blocks.push(blockMd)
    }

    return blocks
  } catch {
    // 失败兜底: 按字符数硬切
    return fallbackSplit(md)
  }
}

function fallbackSplit(md: string): string[] {
  const result: string[] = []
  for (let i = 0; i < md.length; i += MD_FALLBACK_CHARS_PER_PAGE) {
    result.push(md.slice(i, i + MD_FALLBACK_CHARS_PER_PAGE))
  }
  return result
}
