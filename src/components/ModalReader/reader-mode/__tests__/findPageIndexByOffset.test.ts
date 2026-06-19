// src/components/ModalReader/reader-mode/__tests__/findPageIndexByOffset.test.ts
import { describe, it, expect } from 'vitest'
import { findPageIndexByOffset } from '../findPageIndexByOffset'
import type { PaginatedPage } from '../types'

describe('findPageIndexByOffset', () => {
  const pages: PaginatedPage[] = [
    { index: 0, startBlockIdx: 0, endBlockIdx: 2, blockCount: 3 },
    { index: 1, startBlockIdx: 3, endBlockIdx: 5, blockCount: 3 },
    { index: 2, startBlockIdx: 6, endBlockIdx: 8, blockCount: 3 },
    { index: 3, startBlockIdx: 9, endBlockIdx: 10, blockCount: 2 },
  ]
  // 模拟 first block 高度递增
  const tops = [0, 100, 250, 500, 1000, 1500, 2100, 2700, 3300, 4000, 4500]

  const getTop = (page: PaginatedPage) => tops[page.startBlockIdx]

  it('top 落在第一个 page → 返回 0', () => {
    expect(findPageIndexByOffset(pages, 50, getTop)).toBe(0)
    expect(findPageIndexByOffset(pages, 99, getTop)).toBe(0)
  })

  it('top 落在两个 page 之间 → 返回较低的 page', () => {
    // pages[0] 首 block top=0；pages[1] 首 block top=500。top=100 在 page 0。
    expect(findPageIndexByOffset(pages, 100, getTop)).toBe(0)
    expect(findPageIndexByOffset(pages, 499, getTop)).toBe(0)
  })

  it('top 恰好等于某 page 起始 → 返回该 page', () => {
    expect(findPageIndexByOffset(pages, 500, getTop)).toBe(1)
    expect(findPageIndexByOffset(pages, 2100, getTop)).toBe(2)
  })

  it('top 落在中间 page → 返回中间 page', () => {
    expect(findPageIndexByOffset(pages, 1500, getTop)).toBe(1)
    expect(findPageIndexByOffset(pages, 4500, getTop)).toBe(3)
  })

  it('top 超出最后 page → 返回最后一个 page', () => {
    expect(findPageIndexByOffset(pages, 99999, getTop)).toBe(3)
  })

  it('空 pages 数组 → 返回 0（默认 fallback）', () => {
    expect(findPageIndexByOffset([], 100, getTop)).toBe(0)
  })

  it('单 page：top 任何位置 → 返回 0', () => {
    const single: PaginatedPage[] = [{ index: 0, startBlockIdx: 0, endBlockIdx: 0, blockCount: 1 }]
    expect(findPageIndexByOffset(single, 0, () => 0)).toBe(0)
    expect(findPageIndexByOffset(single, 99999, () => 0)).toBe(0)
  })
})
