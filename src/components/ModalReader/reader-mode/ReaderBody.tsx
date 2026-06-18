// src/components/ModalReader/reader-mode/ReaderBody.tsx
import { forwardRef } from 'react'
import { useReaderMode } from '@/hooks/useReaderMode'
import { ScrollBody } from './ScrollBody'
import { SmoothBody } from './SmoothBody'
import { FlipBody } from './FlipBody'
import type { PaginatedReaderHandle } from './PaginatedReader'
import type { ReaderMode } from './types'

interface ReaderBodyProps {
  bookSlug: string
  modalType: 'interp' | 'skill' | 'source'
  modalKey: string
  annotatedBody: string
  proseClass: string
  scrollRef: React.RefObject<HTMLDivElement | null>
  initialPage?: number
  onScrollProgress?: (scrollTop: number) => void
  onCrossChapterNavigate?: (dir: 'prev' | 'next') => void
  onCenterTap?: () => void
}

/**
 * ReaderBody: 按 readerMode 分发到不同渲染模式。
 *
 * - scroll: 保持现状的纵向滚动容器（ScrollBody）
 * - smooth: CSS scroll-snap 横向平滑翻页（SmoothBody）
 * - flip:  page-flip 3D 卷页仿真翻页（FlipBody）
 *
 * skill 模式强制使用滚动（skill 内容为纯文本，不适合分页）。
 *
 * ref 暴露 PaginatedReaderHandle（getPageOfHeadingId / findText）给父组件做目录跳转和搜索闪黄。
 * 在 scroll / skill 模式下 ref.current 为 null。
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
    } = props
    const [mode] = useReaderMode()
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 640

    // 桌面端强制滚动模式
    const effectiveMode: ReaderMode = !isMobile ? 'scroll' : mode

    // skill 模式（纯文本）强制滚动
    if (modalType === 'skill') {
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
        />
      )
    }

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
          />
        )
    }
  }
)
