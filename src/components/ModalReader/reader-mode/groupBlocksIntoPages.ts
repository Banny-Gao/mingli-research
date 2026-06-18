// src/components/ModalReader/reader-mode/groupBlocksIntoPages.ts
import type { PaginatedPage, MarkdownBlock } from './types'

/**
 * 将 splitMarkdownByBlocks 输出的 block 数组，
 * 根据 usePaginatedBlocks 的装页结果，拼装成每页的 markdown 字符串。
 *
 * blocks[i] 对应 measure DOM children[i]（顶级 block），
 * pages[j] 的 startBlockIdx/endBlockIdx 描述第 j 页包含哪些 block。
 */
export function groupBlocksIntoPages(
  blocks: MarkdownBlock[],
  pages: PaginatedPage[]
): string[] {
  return pages.map(page => {
    const pageBlocks = blocks.slice(page.startBlockIdx, page.endBlockIdx + 1)
    return pageBlocks.map(b => b.md).join('\n\n')
  })
}
