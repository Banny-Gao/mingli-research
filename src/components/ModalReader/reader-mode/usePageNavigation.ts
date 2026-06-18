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

const resolveInitialPage = (
  bookSlug: string,
  modalType: string,
  modalKey: string,
  initialPage?: number
): number => {
  if (initialPage !== undefined && initialPage >= 0) return initialPage
  return loadPage(bookSlug, modalType, modalKey)
}

const clampPage = (idx: number, totalPages: number): number =>
  Math.max(0, totalPages > 0 ? Math.min(idx, totalPages - 1) : 0)

export function usePageNavigation(opts: UsePageNavigationOptions) {
  const { bookSlug, modalType, modalKey, totalPages, initialPage, onCrossChapter } = opts

  const [currentPage, setCurrentPage] = useState(() =>
    resolveInitialPage(bookSlug, modalType, modalKey, initialPage)
  )

  // 切换章节（bookSlug/modalType/modalKey 任一变化）时重置 currentPage
  const identityKey = `${bookSlug}:${modalType}:${modalKey}`
  const prevIdentityRef = useRef(identityKey)
  useEffect(() => {
    if (prevIdentityRef.current === identityKey) return
    prevIdentityRef.current = identityKey
    setCurrentPage(resolveInitialPage(bookSlug, modalType, modalKey, initialPage))
  }, [identityKey, bookSlug, modalType, modalKey, initialPage])

  // 持久化 currentPage 变化
  useEffect(() => {
    if (totalPages > 0) {
      savePage(bookSlug, modalType, modalKey, currentPage)
    }
  }, [currentPage, bookSlug, modalType, modalKey, totalPages])

  // clamp currentPage 当 totalPages 变化时（totalPages 来自 props，
  // 是 props → state 的合法同步路径；需在 effect 内 set-state）
  useEffect(() => {
    if (totalPages > 0 && currentPage >= totalPages) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentPage(clampPage(currentPage, totalPages))
    }
  }, [totalPages, currentPage])

  const goToPage = useCallback(
    (idx: number) => {
      if (totalPages <= 0) return
      setCurrentPage(clampPage(idx, totalPages))
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
