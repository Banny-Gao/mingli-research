import { useEffect, useLayoutEffect, useState, useCallback, useRef } from 'react'
import type { RefObject } from 'react'
import type { PaginatedPage, PageSize, UsePaginatedBlocksResult } from './types'
import { RESIZE_DEBOUNCE_MS } from './constants'

const isClient = typeof window !== 'undefined'
const useIsoLayoutEffect = isClient ? useLayoutEffect : useEffect

export function usePaginatedBlocks(
  measureRef: RefObject<HTMLElement | null>,
  pageSize: PageSize
): UsePaginatedBlocksResult {
  const [pages, setPages] = useState<PaginatedPage[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const observerRef = useRef<ResizeObserver | null>(null)
  const intersectionRef = useRef<IntersectionObserver | null>(null)

  const recompute = useCallback(() => {
    const root = measureRef.current
    if (!root) return
    const children = Array.from(root.children) as HTMLElement[]
    if (children.length === 0) {
      setPages([])
      setCurrentPage(0)
      return
    }
    const { height: pageHeight } = pageSize
    const result: PaginatedPage[] = []
    let pageStart = 0
    let pageFirstTop = children[0].offsetTop

    for (let i = 0; i < children.length; i++) {
      const el = children[i]
      const top = el.offsetTop
      const bottom = top + el.offsetHeight
      if (top - pageFirstTop + el.offsetHeight > pageHeight && i > pageStart) {
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
      // 防止 bottom 引用未用警告
      void bottom
    }
    setPages(result)
    setCurrentPage(prev => Math.min(prev, Math.max(0, result.length - 1)))
  }, [measureRef, pageSize.height, pageSize.width])

  // 初次 + ResizeObserver
  useIsoLayoutEffect(() => {
    recompute()
    const root = measureRef.current
    if (!root || typeof ResizeObserver === 'undefined') return
    const obs = new ResizeObserver(() => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(recompute, RESIZE_DEBOUNCE_MS)
    })
    obs.observe(root)
    observerRef.current = obs
    return () => {
      obs.disconnect()
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [recompute, measureRef])

  // IntersectionObserver 维护 currentPage
  useEffect(() => {
    const root = measureRef.current
    if (!root || pages.length === 0 || typeof IntersectionObserver === 'undefined') return
    // 监听每个 page 的"首页 block"
    const targets = pages
      .map(p => root.children[p.startBlockIdx] as HTMLElement | undefined)
      .filter((el): el is HTMLElement => !!el)
    if (targets.length === 0) return
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const idx = targets.indexOf(e.target as HTMLElement)
            if (idx >= 0) setCurrentPage(idx)
          }
        }
      },
      { root, threshold: 0.5 }
    )
    targets.forEach(t => io.observe(t))
    intersectionRef.current = io
    return () => io.disconnect()
  }, [pages, measureRef])

  const goToPage = useCallback(
    (idx: number, opts?: { behavior?: 'auto' | 'smooth' }) => {
      const root = measureRef.current
      if (!root || pages.length === 0) return
      const clamped = Math.max(0, Math.min(idx, pages.length - 1))
      const target = root.children[pages[clamped].startBlockIdx] as HTMLElement | undefined
      if (target) {
        root.scrollTo({ top: target.offsetTop, behavior: opts?.behavior ?? 'smooth' })
        setCurrentPage(clamped)
      }
    },
    [measureRef, pages]
  )

  const getPageOf = useCallback(
    (el: HTMLElement): number => {
      const top = el.offsetTop
      // 二分查 pages
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
    currentPage,
    goToPage,
    getPageOf,
  }
}
