// src/components/ModalReader/reader-mode/usePaginatedBlocks.ts
import { useLayoutEffect, useEffect, useState, useCallback, useRef } from 'react'
import type { RefObject } from 'react'
import type { PaginatedPage, PageSize, UsePaginatedBlocksResult } from './types'
import { RESIZE_DEBOUNCE_MS } from './constants'

const isClient = typeof window !== 'undefined'
const useIsoLayoutEffect = isClient ? useLayoutEffect : useEffect

/**
 * 从 measure DOM 的 children 测量高度，贪心装页。
 *
 * 与原始计划差异：
 * - 移除了 IntersectionObserver（不应挂在 hidden DOM 上）
 * - 不再维护 currentPage（上移到 usePageNavigation）
 * - 保留 goToPage（scroll 模式用）和 getPageOf（TocSidebar/搜索用）
 */
export function usePaginatedBlocks(
  measureRef: RefObject<HTMLElement | null>,
  pageSize: PageSize
): UsePaginatedBlocksResult {
  const [pages, setPages] = useState<PaginatedPage[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const recompute = useCallback(() => {
    const root = measureRef.current
    if (!root) return
    const children = Array.from(root.children) as HTMLElement[]
    if (children.length === 0) {
      setPages([])
      return
    }
    const { height: pageHeight } = pageSize
    if (pageHeight <= 0) return

    const result: PaginatedPage[] = []
    let pageStart = 0
    let pageFirstTop = children[0].offsetTop

    for (let i = 0; i < children.length; i++) {
      const el = children[i]
      const top = el.offsetTop
      const elHeight = el.offsetHeight

      if (top - pageFirstTop + elHeight > pageHeight && i > pageStart) {
        result.push({
          index: result.length,
          startBlockIdx: pageStart,
          endBlockIdx: i - 1,
          blockCount: i - pageStart,
        })
        pageStart = i
        pageFirstTop = top
      }

      if (i === children.length - 1) {
        result.push({
          index: result.length,
          startBlockIdx: pageStart,
          endBlockIdx: i,
          blockCount: i - pageStart + 1,
        })
      }
    }
    setPages(result)
  }, [measureRef, pageSize.height, pageSize.width])

  // 保持最新 recompute 引用，避免 RO 重建
  const recomputeRef = useRef(recompute)
  useEffect(() => {
    recomputeRef.current = recompute
  }, [recompute])

  // 初次装页 + ResizeObserver（仅监听子元素变化如 mermaid 异步渲染完成）
  useIsoLayoutEffect(() => {
    // 延迟执行确保 measure DOM 已渲染
    const timer = setTimeout(() => recomputeRef.current(), 0)

    const root = measureRef.current
    if (!root || typeof ResizeObserver === 'undefined') return () => clearTimeout(timer)

    const obs = new ResizeObserver(() => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => recomputeRef.current(), RESIZE_DEBOUNCE_MS)
    })
    obs.observe(root)
    return () => {
      clearTimeout(timer)
      obs.disconnect()
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [measureRef]) // 不依赖 recompute，避免 RO 反复重建

  const goToPage = useCallback(
    (idx: number, opts?: { behavior?: 'auto' | 'smooth' }) => {
      const root = measureRef.current
      if (!root || pages.length === 0) return
      const clamped = Math.max(0, Math.min(idx, pages.length - 1))
      const target = root.children[pages[clamped].startBlockIdx] as HTMLElement | undefined
      if (target) {
        root.scrollTo({ top: target.offsetTop, behavior: opts?.behavior ?? 'smooth' })
      }
    },
    [measureRef, pages]
  )

  const getPageOf = useCallback(
    (el: HTMLElement): number => {
      const top = el.offsetTop
      let lo = 0
      let hi = pages.length - 1
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1
        const p = pages[mid]
        const root = measureRef.current
        if (!root) return 0
        const firstEl = root.children[p.startBlockIdx] as HTMLElement | undefined
        if (firstEl && firstEl.offsetTop <= top) lo = mid
        else hi = mid - 1
      }
      return lo
    },
    [pages, measureRef]
  )

  return {
    pages,
    totalPages: pages.length,
    goToPage,
    getPageOf,
  }
}
