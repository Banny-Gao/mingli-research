// src/components/ModalReader/reader-mode/SmoothBody.tsx
import { PaginatedReader } from './PaginatedReader'
import { SmoothPages } from './SmoothPages'

interface SmoothBodyProps {
  bookSlug: string
  modalType: 'interp' | 'skill' | 'source'
  modalKey: string
  annotatedBody: string
  proseClass: string
  initialPage?: number
  onCrossChapter?: (dir: 'prev' | 'next') => void
  onCenterTap?: () => void
}

/**
 * SmoothBody: 平滑翻页模式入口。
 * 组合 PaginatedReader（分页 + 导航）+ SmoothPages（CSS scroll-snap 渲染）。
 */
export function SmoothBody(props: SmoothBodyProps) {
  const {
    annotatedBody,
    proseClass,
    bookSlug,
    modalType,
    modalKey,
    initialPage,
    onCrossChapter,
    onCenterTap,
  } = props

  return (
    <PaginatedReader
      annotatedBody={annotatedBody}
      proseClass={proseClass}
      bookSlug={bookSlug}
      modalType={modalType}
      modalKey={modalKey}
      initialPage={initialPage}
      onCrossChapter={onCrossChapter}
    >
      {renderProps => (
        <SmoothPages {...renderProps} proseClass={proseClass} onCenterTap={onCenterTap} />
      )}
    </PaginatedReader>
  )
}
