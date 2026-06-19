// src/components/ModalReader/reader-mode/__tests__/greedyPackPages.test.ts
import { describe, it, expect } from 'vitest'
import { greedyPackPages } from '../greedyPackPages'

function makeChild(top: number, height: number): HTMLElement {
  const el = document.createElement('div')
  Object.defineProperty(el, 'offsetTop', { value: top, configurable: true })
  Object.defineProperty(el, 'offsetHeight', { value: height, configurable: true })
  return el
}

describe('greedyPackPages', () => {
  it('空数组 → 返回空', () => {
    expect(greedyPackPages([], 100)).toEqual([])
  })

  it('pageHeight <= 0 → 返回空', () => {
    expect(greedyPackPages([makeChild(0, 10)], 0)).toEqual([])
    expect(greedyPackPages([makeChild(0, 10)], -1)).toEqual([])
  })

  it('单元素 → 单 page', () => {
    const pages = greedyPackPages([makeChild(0, 50)], 100)
    expect(pages).toEqual([{ index: 0, startBlockIdx: 0, endBlockIdx: 0, blockCount: 1 }])
  })

  it('多元素全在一页 → 单 page', () => {
    const children = [makeChild(0, 20), makeChild(20, 20), makeChild(40, 20)]
    const pages = greedyPackPages(children, 100)
    expect(pages).toEqual([{ index: 0, startBlockIdx: 0, endBlockIdx: 2, blockCount: 3 }])
  })

  it('多元素跨页 → 多个 page', () => {
    const children = [makeChild(0, 30), makeChild(30, 30), makeChild(60, 30), makeChild(90, 30)]
    const pages = greedyPackPages(children, 60)
    // page 0: top=0, endBlockIdx=1 (累计 0~60 <= 60), children[2] 60+30=90 > 60 → close
    // page 1: top=60, children[3] 90+30=120 > 60 → close at last i=3
    expect(pages).toEqual([
      { index: 0, startBlockIdx: 0, endBlockIdx: 1, blockCount: 2 },
      { index: 1, startBlockIdx: 2, endBlockIdx: 3, blockCount: 2 },
    ])
  })

  it('blockCount 与切片一致', () => {
    const children = [makeChild(0, 50), makeChild(50, 50), makeChild(100, 50)]
    const pages = greedyPackPages(children, 60)
    expect(pages[0].blockCount).toBe(1)
    expect(pages[0].endBlockIdx - pages[0].startBlockIdx + 1).toBe(pages[0].blockCount)
  })

  it('边界：恰好填满一页', () => {
    const children = [makeChild(0, 50), makeChild(50, 50)]
    const pages = greedyPackPages(children, 100)
    expect(pages.length).toBe(1)
    expect(pages[0].endBlockIdx).toBe(1)
  })
})
