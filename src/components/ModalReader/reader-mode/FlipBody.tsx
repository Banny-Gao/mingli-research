// src/components/ModalReader/reader-mode/FlipBody.tsx
import { forwardRef } from 'react'
import { PaginatedReader, type PaginatedReaderHandle } from './PaginatedReader'
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
 * 组合 PaginatedReader（分页 + 导航）+ FlipPages（page-flip 3D 卷页渲染）。
 */
export const FlipBody = forwardRef<PaginatedReaderHandle, FlipBodyProps>(function FlipBody(
  props,
  ref
) {
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
      ref={ref}
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
})
