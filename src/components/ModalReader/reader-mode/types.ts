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

export interface UsePaginatedBlocksResult {
  pages: PaginatedPage[]
  totalPages: number
  currentPage: number
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

export interface CrossChapterInput {
  currentPage: number
  totalPages: number
  direction: 'prev' | 'next'
  hasNext: boolean
  hasPrev: boolean
  isPrevRead: boolean
  prevLastPage?: number
}

export interface CrossChapterDecision {
  action: 'navigate' | 'stay'
  targetPage?: number
}

export type NavigateWithPage = (
  type: 'interp' | 'skill' | 'source',
  key: string,
  initialPage?: number
) => void
