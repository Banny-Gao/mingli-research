// src/components/ModalReader/reader-mode/ReaderBody.tsx
import { useReaderMode } from '@/hooks/useReaderMode'
import { ScrollBody } from './ScrollBody'
import { SmoothBody } from './SmoothBody'
import { FlipBody } from './FlipBody'
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
 * - flip:  CSS 3D rotateY 仿真翻页（FlipBody）
 *
 * skill 模式强制使用滚动（skill 内容为纯文本，不适合分页）。
 */
export function ReaderBody({
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
}: ReaderBodyProps) {
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
