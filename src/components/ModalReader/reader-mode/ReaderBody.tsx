// src/components/ModalReader/reader-mode/ReaderBody.tsx
import { forwardRef } from 'react'
import { ScrollBody } from './ScrollBody'
import { SmoothBody } from './SmoothBody'
import { FlipBody } from './FlipBody'
import type { PaginatedReaderHandle } from './PaginatedReader'
import type { ReaderMode } from './types'
import type { ModalType } from '../modalType'
import { MOBILE_BREAKPOINT } from './constants'

interface ReaderBodyProps {
  bookSlug: string
  modalType: ModalType
  modalKey: string
  annotatedBody: string
  proseClass: string
  scrollRef: React.RefObject<HTMLDivElement | null>
  initialPage?: number
  onScrollProgress?: (scrollTop: number) => void
  onCrossChapterNavigate?: (dir: 'prev' | 'next') => void
  onCenterTap?: () => void
  /**
   * 翻页模式（由 ModalReader 持有的 useReaderMode 状态传入）。
   * 不在内部再调 useReaderMode，避免两个 hook 实例不同步导致切模式不生效。
   */
  mode: ReaderMode
}

/**
 * ReaderBody: 按 readerMode 分发到不同渲染模式。
 *
 * - scroll: 保持现状的纵向滚动容器（ScrollBody）
 * - smooth: CSS scroll-snap 横向平滑翻页（SmoothBody）
 * - flip:  page-flip 3D 卷页仿真翻页（FlipBody）
 *
 * scroll 模式强制使用滚动模式（桌面端），不适合分页。
 *
 * ref 暴露 PaginatedReaderHandle（getPageOfHeadingId / findText）给父组件做目录跳转和搜索闪黄。
 * 在 scroll 模式下 ref.current 为 null。
 */
export const ReaderBody = forwardRef<PaginatedReaderHandle | null, ReaderBodyProps>(
  function ReaderBody(props, ref) {
    const {
      bookSlug,
      modalType,
      modalKey,
      annotatedBody,
      proseClass,
      scrollRef,
      initialPage,
      onScrollProgress,
      onCrossChapterNavigate,
      onCenterTap,
      mode,
    } = props
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT

    // 桌面端强制滚动模式
    const effectiveMode: ReaderMode = !isMobile ? 'scroll' : mode

    const initialPageValue = initialPage

    switch (effectiveMode) {
      case 'smooth':
        return (
          <SmoothBody
            ref={ref as React.Ref<PaginatedReaderHandle>}
            bookSlug={bookSlug}
            modalType={modalType}
            modalKey={modalKey}
            annotatedBody={annotatedBody}
            proseClass={proseClass}
            initialPage={initialPageValue}
            onCrossChapter={onCrossChapterNavigate}
            onCenterTap={onCenterTap}
          />
        )
      case 'flip':
        return (
          <FlipBody
            ref={ref as React.Ref<PaginatedReaderHandle>}
            bookSlug={bookSlug}
            modalType={modalType}
            modalKey={modalKey}
            annotatedBody={annotatedBody}
            proseClass={proseClass}
            initialPage={initialPageValue}
            onCrossChapter={onCrossChapterNavigate}
            onCenterTap={onCenterTap}
          />
        )
      case 'scroll':
      default:
        return (
          <ScrollBody
            bookSlug={bookSlug}
            modalType={modalType}
            modalKey={modalKey}
            annotatedBody={annotatedBody}
            proseClass={proseClass}
            scrollRef={scrollRef}
            onScroll={onScrollProgress}
            className="modal-body"
            onCenterTap={onCenterTap}
          />
        )
    }
  }
)
