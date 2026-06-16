import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import { MD_FALLBACK_CHARS_PER_PAGE } from './constants'

export function splitMarkdownByBlocks(md: string): string[] {
  if (!md.trim()) return []
  try {
    const tree = unified().use(remarkParse).parse(md)
    return tree.children.map(child => {
      const subTree = { ...tree, children: [child] }
      // append trailing blank line so block joins preserve md paragraph separation
      return unified().use(remarkStringify).stringify(subTree) + '\n'
    })
  } catch {
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
