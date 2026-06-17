// src/components/ModalReader/reader-mode/FlipBody.tsx
import { PaginatedReader } from './PaginatedReader'
import { FlipPages } from './FlipPages'

interface FlipBodyProps {
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
 * FlipBody: 仿真翻页模式入口。
 * 组合 PaginatedReader（分页 + 导航）+ FlipPages（hammerjs + CSS 3D 渲染）。
 */
export function FlipBody(props: FlipBodyProps) {
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
        <FlipPages
          {...renderProps}
          proseClass={proseClass}
          chapterKey={modalKey}
          onCenterTap={onCenterTap}
        />
      )}
    </PaginatedReader>
  )
}
