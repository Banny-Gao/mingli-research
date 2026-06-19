// src/components/ModalReader/reader-mode/SmoothBody.tsx
import { forwardRef } from 'react'
import { PaginatedReader, type PaginatedReaderHandle } from './PaginatedReader'
import { SmoothPages } from './SmoothPages'
import type { ModalType } from '../modalType'

interface SmoothBodyProps {
  bookSlug: string
  modalType: ModalType
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
export const SmoothBody = forwardRef<PaginatedReaderHandle, SmoothBodyProps>(
  function SmoothBody(props, ref) {
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
          <SmoothPages {...renderProps} proseClass={proseClass} onCenterTap={onCenterTap} />
        )}
      </PaginatedReader>
    )
  }
)
