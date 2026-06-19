// src/components/ModalReader/reader-mode/constants.ts
import type { ReaderMode } from '@/hooks/useReaderMode'

export const READER_MODE_KEY = 'reader:mode'

// 分页
export const RESIZE_DEBOUNCE_MS = 100
export const MD_FALLBACK_CHARS_PER_PAGE = 4000

// 持久化
export const SCROLL_KEY_PREFIX = 'scroll:'
export const PAGE_KEY_PREFIX = 'page:'

// 移动端断点（与 ModalReader.less 内 @mobile-breakpoint 同源）
export const MOBILE_BREAKPOINT = 640

// 翻页模式（smooth / flip）需要 PaginatedReader 暴露 handle，scroll 模式不需要。
export const PAGINATED_MODES: readonly ReaderMode[] = ['smooth', 'flip']

export const isPaginatedMode = (mode: ReaderMode): boolean => PAGINATED_MODES.includes(mode)

// measure DOM 离屏定位（PaginatedReader 用绝对负值推到视口外）
export const MEASURE_OFFSCREEN_LEFT = '-99999px'

// ReaderBody JSX className 命名空间
export const CLASS = {
  paginatedContainer: 'paginated-reader-container',
  tocSidebar: 'toc-sidebar',
  searchFlashMark: 'search-flash',
  relatedTag: (key: string) => `related-tag-${key}`,
} as const
