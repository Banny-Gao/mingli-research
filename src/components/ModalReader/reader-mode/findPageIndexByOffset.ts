// src/components/ModalReader/reader-mode/findPageIndexByOffset.ts
import type { PaginatedPage } from './types'

/**
 * 在已装好的 pages 列表中按"块起始 offsetTop"二分查找目标 page。
 *
 * 用于 usePaginatedBlocks 的三处查找（getPageOf / getPageOfHeadingId / findText），
 * 消除重复的二分逻辑。
 *
 * 参数：
 * - pages: 已装好的页数组（pageStart ≤ pageEnd，按 offsetTop 升序）
 * - top: 目标 offsetTop
 * - getFirstBlockTop: 给定 page，返回其首 block 的 offsetTop（封装"从 measure DOM 取元素"细节）
 *
 * 返回：page index（0 ≤ result ≤ pages.length - 1）。
 * pages 为空时返回 0（与原实现一致）。
 */
export function findPageIndexByOffset(
  pages: PaginatedPage[],
  top: number,
  getFirstBlockTop: (page: PaginatedPage) => number | undefined
): number {
  if (pages.length === 0) return 0
  let lo = 0
  let hi = pages.length - 1
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    const p = pages[mid]
    const firstTop = getFirstBlockTop(p)
    if (firstTop !== undefined && firstTop <= top) lo = mid
    else hi = mid - 1
  }
  return lo
}
