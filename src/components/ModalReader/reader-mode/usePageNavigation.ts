// src/components/ModalReader/reader-mode/usePageNavigation.ts
import { useState, useCallback, useEffect, useRef } from 'react'
import { savePage, loadPage } from './persistence'

interface UsePageNavigationOptions {
  bookSlug: string
  modalType: string
  modalKey: string
  totalPages: number
  initialPage?: number
  onCrossChapter?: (dir: 'prev' | 'next') => void
}

export function usePageNavigation(opts: UsePageNavigationOptions) {
  const { bookSlug, modalType, modalKey, totalPages, initialPage, onCrossChapter } = opts

  const [currentPage, setCurrentPage] = useState(() => {
    if (initialPage !== undefined && initialPage >= 0) return initialPage
    return loadPage(bookSlug, modalType, modalKey)
  })

  // 切换章节（bookSlug/modalType/modalKey 任一变化）时重置 currentPage
  const identityKey = `${bookSlug}:${modalType}:${modalKey}`
  const prevIdentityRef = useRef(identityKey)
  useEffect(() => {
    if (prevIdentityRef.current === identityKey) return
    prevIdentityRef.current = identityKey
    const next = initialPage !== undefined && initialPage >= 0
      ? initialPage
      : loadPage(bookSlug, modalType, modalKey)
    setCurrentPage(Math.max(0, next))
  }, [identityKey, bookSlug, modalType, modalKey, initialPage])

  // 持久化 currentPage 变化
  useEffect(() => {
    if (totalPages > 0) {
      savePage(bookSlug, modalType, modalKey, currentPage)
    }
  }, [currentPage, bookSlug, modalType, modalKey, totalPages])

  // clamp currentPage 当 totalPages 变化时（derived from props，必须用 effect 同步到 state）
  useEffect(() => {
    if (totalPages > 0 && currentPage >= totalPages) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentPage(Math.max(0, totalPages - 1))
    }
  }, [totalPages, currentPage])

  const goToPage = useCallback(
    (idx: number) => {
      if (totalPages <= 0) return
      setCurrentPage(Math.max(0, Math.min(idx, totalPages - 1)))
    },
    [totalPages]
  )

  // 检测是否触发跨篇导航（边界滑动）
  const checkBoundary = useCallback(
    (dir: 'prev' | 'next') => {
      if (dir === 'next' && currentPage >= totalPages - 1) {
        onCrossChapter?.('next')
        return true
      }
      if (dir === 'prev' && currentPage <= 0) {
        onCrossChapter?.('prev')
        return true
      }
      return false
    },
    [currentPage, totalPages, onCrossChapter]
  )

  return { currentPage, setCurrentPage, goToPage, checkBoundary }
}
