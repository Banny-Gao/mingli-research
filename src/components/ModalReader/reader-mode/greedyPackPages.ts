// src/components/ModalReader/reader-mode/greedyPackPages.ts
import type { PaginatedPage } from './types'

/**
 * 贪心装页：按 measure DOM 元素的 offsetTop/offsetHeight 高度切分 pages。
 *
 * 算法：
 * - 从 children[0] 开始累积到当前 page
 * - 若下一个元素超出 pageHeight → 关闭当前 page，开启新 page
 * - 最后一个元素固定关闭一个 page
 *
 * 纯函数（除入参外无副作用），可单测；返回的 pages 数组不含 children 引用。
 *
 * @param children - measure DOM 的顶级子元素（按 DOM 顺序）
 * @param pageHeight - 单页可用高度（px）
 * @returns 装好的 page 列表
 */
export function greedyPackPages(children: HTMLElement[], pageHeight: number): PaginatedPage[] {
  if (children.length === 0 || pageHeight <= 0) return []

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
  return result
}
