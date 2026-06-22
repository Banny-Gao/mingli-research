// src/components/ModalReader/useScrollToText.ts
import { useEffect, useRef } from 'react'
import type { PaginatedReaderHandle } from './reader-mode/PaginatedReader'
import { isPaginatedMode } from './reader-mode/constants'
import { flashMarkHighlight } from '../../utils/flashMarkHighlight'
import { findTextNodeByCharIndex } from '../../utils/domWalk'
import type { ReaderMode } from './reader-mode/types'

const SCROLL_OFFSET = 100
const SCROLL_FLASH_DELAY_MS = 50

interface UseScrollToTextParams {
  modalKey: string
  scrollToText: string | null
  contentLoading: boolean
  loadedContent: string
  readerMode: ReaderMode
  modalBodyRef: React.RefObject<HTMLDivElement | null>
  paginatedReaderRef: React.RefObject<PaginatedReaderHandle | null>
  onConsumed: () => void
}

/**
 * 搜索结果 → 滚动到目标文本 + 闪黄高亮。
 *
 * - 翻页模式（smooth/flip）：通过 paginatedReaderRef 的 findText 找 page + 文本节点，
 *   goToPage 后等一帧（rAF）再在可见 page 容器内闪黄
 * - 滚动模式：直接用 findTextNodeByCharIndex 定位字符 offset + scrollTo 平滑滚动
 *
 * flashMarkHighlight 的 fade 完成后通过 onConsumed 通知父组件。
 * contentLoading 时不触发（避免"半加载"状态下闪黄错位）。
 */
export function useScrollToText(params: UseScrollToTextParams) {
  const {
    modalKey,
    scrollToText,
    contentLoading,
    loadedContent,
    readerMode,
    modalBodyRef,
    paginatedReaderRef,
    onConsumed,
  } = params

  // 持有 flashMarkHighlight 返回的 timerId，cleanup 时取消
  // 避免组件卸载 / 章节跳转后，延时回调操作已脱离的 DOM
  const flashTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!modalKey || !scrollToText || !modalBodyRef.current || contentLoading) return
    const container = modalBodyRef.current

    if (isPaginatedMode(readerMode)) {
      const handle = paginatedReaderRef.current
      if (!handle) {
        onConsumed()
        return
      }
      const found = handle.findText(scrollToText)
      if (!found) {
        onConsumed()
        return
      }
      handle.goToPage(found.pageIdx)
      requestAnimationFrame(() => {
        const visibleContainer = modalBodyRef.current?.querySelector(
          '.paginated-reader-container'
        ) as HTMLElement | null
        if (visibleContainer) {
          flashTimerRef.current =
            flashMarkHighlight(found.searchText, visibleContainer, onConsumed) ?? null
          setTimeout(() => {
            const marks = visibleContainer.querySelectorAll('mark.search-flash')
            if (marks.length > 0) {
              marks[0].scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
          }, SCROLL_FLASH_DELAY_MS)
        } else {
          onConsumed()
        }
      })
      return
    }

    const plainText = container.textContent || ''
    if (!plainText) return
    const searchText = scrollToText.trim()
    const idx = plainText.indexOf(searchText)
    if (idx < 0) return
    const located = findTextNodeByCharIndex(container, idx)
    if (!located) return
    const nodeText = located.node.textContent || ''
    try {
      const range = document.createRange()
      range.setStart(located.node, located.offset)
      range.setEnd(located.node, Math.min(located.offset + searchText.length, nodeText.length))
      const rect = range.getBoundingClientRect()
      container.scrollTo({
        top: container.scrollTop + rect.top - SCROLL_OFFSET,
        behavior: 'smooth',
      })
    } catch {
      container.scrollTo({ top: 0, behavior: 'smooth' })
    }
    flashTimerRef.current = flashMarkHighlight(searchText, container, onConsumed) ?? null
  }, [
    modalKey,
    scrollToText,
    onConsumed,
    loadedContent,
    contentLoading,
    readerMode,
    modalBodyRef,
    paginatedReaderRef,
  ])

  // cleanup：取消悬而未决的定时器，避免组件卸载后操作已脱离的 DOM
  useEffect(
    () => () => {
      if (flashTimerRef.current !== null) {
        clearTimeout(flashTimerRef.current)
        flashTimerRef.current = null
      }
    },
    []
  )
}
