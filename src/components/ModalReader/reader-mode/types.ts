// src/components/ModalReader/reader-mode/types.ts
import type { ReaderMode } from '@/hooks/useReaderMode'
import type { MarkdownBlock } from './splitMarkdownByBlocks'

export type { ReaderMode, MarkdownBlock }

export interface PaginatedPage {
  index: number
  startBlockIdx: number
  endBlockIdx: number
  blockCount: number
}

export interface PageSize {
  width: number
  height: number
}

/** usePaginatedBlocks 返回值 — 不含 currentPage（上移到 usePageNavigation） */
export interface UsePaginatedBlocksResult {
  pages: PaginatedPage[]
  totalPages: number
  goToPage: (idx: number, opts?: { behavior?: 'auto' | 'smooth' }) => void
  getPageOf: (el: HTMLElement) => number
  /** 通过 heading id 找 page（用于目录跳转）。找不到返回 -1 */
  getPageOfHeadingId: (id: string) => number
  /** 通过文本前缀在 measure DOM 中找 page + 文本节点 + 偏移（用于搜索闪黄）。找不到返回 null */
  findText: (
    text: string
  ) => { pageIdx: number; searchText: string } | null
}

/** PaginatedReader → renderPages 插槽的 props */
export interface PageRenderProps {
  pageMds: string[]
  currentPage: number
  goToPage: (idx: number) => void
  containerRef: React.RefObject<HTMLDivElement | null>
  pageSize: PageSize
}
