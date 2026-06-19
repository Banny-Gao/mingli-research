// src/components/ModalReader/reader-mode/usePaginatedBlocks.ts
import { useLayoutEffect, useEffect, useState, useCallback, useRef } from 'react'
import type { RefObject } from 'react'
import type { PaginatedPage, PageSize, UsePaginatedBlocksResult, MarkdownBlock } from './types'
import { RESIZE_DEBOUNCE_MS } from './constants'
import { findPageIndexByOffset } from './findPageIndexByOffset'
import { greedyPackPages } from './greedyPackPages'

const isClient = typeof window !== 'undefined'
const useIsoLayoutEffect = isClient ? useLayoutEffect : useEffect

/**
 * 给定 page，从 measure DOM 取其首 block 的 offsetTop。
 * 集中封装"root.children[p.startBlockIdx] as HTMLElement"模式，避免三处重复。
 */
function getPageFirstTop(
  page: PaginatedPage,
  children: HTMLCollection | HTMLElement[]
): number | undefined {
  const firstEl = children[page.startBlockIdx] as HTMLElement | undefined
  return firstEl?.offsetTop
}

/**
 * 从 measure DOM 的 children 测量高度，贪心装页。
 *
 * 职责：
 * - 监听 measure DOM 的尺寸/子元素变化，递归装页
 * - 提供 goToPage（按 index 滚动 measure DOM 到对应 block 的 offsetTop）
 * - 提供 getPageOf / getPageOfHeadingId / findText 供外部（搜索/TOC）反向查找
 */
export function usePaginatedBlocks(
  measureRef: RefObject<HTMLElement | null>,
  pageSize: PageSize,
  blocks: MarkdownBlock[]
): UsePaginatedBlocksResult {
  const [pages, setPages] = useState<PaginatedPage[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // 保持 blocks 引用最新，供 findText 闭包使用
  const blocksRef = useRef(blocks)
  useEffect(() => {
    blocksRef.current = blocks
  }, [blocks])

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
    setPages(greedyPackPages(children, pageHeight))
  }, [measureRef, pageSize])

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
      const root = measureRef.current
      if (!root) return 0
      return findPageIndexByOffset(pages, el.offsetTop, p => getPageFirstTop(p, root.children))
    },
    [pages, measureRef]
  )

  /**
   * 通过 heading id 找 page。
   * - 优先匹配 splitMarkdownByBlocks 提取的 headingId
   * - fallback：扫描 measure DOM 顶层元素，匹配 element.id
   * 找不到返回 -1
   */
  const getPageOfHeadingId = useCallback(
    (id: string): number => {
      const root = measureRef.current
      if (!root || pages.length === 0) return -1

      // 先按 split 阶段提取的 headingId 找 blockIdx
      const bs = blocksRef.current
      let blockIdx = -1
      for (let i = 0; i < bs.length; i++) {
        if (bs[i].headingId === id) {
          blockIdx = i
          break
        }
      }
      // fallback: 扫 DOM
      if (blockIdx < 0) {
        const children = Array.from(root.children) as HTMLElement[]
        for (let i = 0; i < children.length; i++) {
          if (children[i].id === id) {
            blockIdx = i
            break
          }
        }
      }
      if (blockIdx < 0) return -1

      // 二分查 page
      const target = root.children[blockIdx] as HTMLElement | undefined
      if (!target) return -1
      return findPageIndexByOffset(pages, target.offsetTop, p => getPageFirstTop(p, root.children))
    },
    [pages, measureRef]
  )

  /**
   * 在 measure DOM 的 textContent 中查找 text 首次出现位置，
   * 定位到 text 节点 + 偏移，并返回所属 page。
   * 找不到返回 null。
   */
  const findText = useCallback(
    (text: string): { pageIdx: number; searchText: string } | null => {
      const root = measureRef.current
      if (!root || pages.length === 0) return null
      const searchText = text.trim()
      if (!searchText) return null

      const plainText = root.textContent || ''
      const idx = plainText.indexOf(searchText)
      if (idx < 0) return null

      // walk DOM 找 idx 落在哪个 text node
      let charCount = 0
      let targetNode: Text | null = null
      const walk = (node: Node) => {
        if (targetNode) return
        if (node.nodeType === Node.TEXT_NODE) {
          const t = (node as Text).textContent || ''
          const nextCount = charCount + t.length
          if (idx < nextCount) {
            targetNode = node as Text
            return
          }
          charCount = nextCount
        } else {
          for (const child of Array.from(node.childNodes)) {
            walk(child)
            if (targetNode) return
          }
        }
      }
      walk(root)
      if (!targetNode) return null

      // 沿父链找顶层 block child，确定 pageIdx
      let el: HTMLElement | null = (targetNode as Text).parentElement
      let blockIdx = -1
      const children = Array.from(root.children) as HTMLElement[]
      while (el) {
        const found = children.indexOf(el)
        if (found >= 0) {
          blockIdx = found
          break
        }
        el = el.parentElement
      }
      if (blockIdx < 0) return null

      // 二分查 page
      const top = children[blockIdx].offsetTop
      const pageIdx = findPageIndexByOffset(pages, top, p => getPageFirstTop(p, children))

      return { pageIdx, searchText }
    },
    [pages, measureRef]
  )

  return {
    pages,
    totalPages: pages.length,
    goToPage,
    getPageOf,
    getPageOfHeadingId,
    findText,
  }
}
