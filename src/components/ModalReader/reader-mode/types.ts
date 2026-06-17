// src/components/ModalReader/reader-mode/types.ts
import type { ReaderMode } from '@/hooks/useReaderMode'

export type { ReaderMode }

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
}

export interface MarkdownBlockBoundary {
  blockIdx: number
  charStart: number
  charEnd: number
}

export interface TextLocation {
  blockIdx: number
  offsetInBlock: number
  node: Text
  nodeOffset: number
}

export interface CrossChapterDecision {
  hasPrev: boolean
  hasNext: boolean
  prevTargetPage: number
  isPrevRead: boolean
}

export type NavigateWithPage = (
  type: 'interp' | 'skill' | 'source',
  key: string,
  initialPage?: number
) => void

/** PaginatedReader → renderPages 插槽的 props */
export interface PageRenderProps {
  pageMds: string[]
  currentPage: number
  goToPage: (idx: number) => void
  containerRef: React.RefObject<HTMLDivElement | null>
  pageSize: PageSize
}
