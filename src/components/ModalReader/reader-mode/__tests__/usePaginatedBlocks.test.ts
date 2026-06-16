import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { RefObject } from 'react'
import { usePaginatedBlocks } from '../usePaginatedBlocks'

// TODO(Task 22): cover pagination in real browser e2e
// jsdom does not compute layout: offsetTop / offsetHeight both return 0
// even with position:absolute + explicit top/height inline styles.
// The hook is intentionally spec-verbatim (real-browser only); unit
// coverage of the greedy-fit algorithm + getPageOf goes through e2e.
function makeContainer(blockHeights: number[]): HTMLElement {
  const div = document.createElement('div')
  div.style.width = '100px'
  div.style.position = 'relative'
  let acc = 0
  blockHeights.forEach((h, i) => {
    const b = document.createElement('div')
    b.textContent = `block-${i}`
    b.style.position = 'absolute'
    b.style.left = '0'
    b.style.right = '0'
    b.style.top = `${acc}px`
    b.style.height = `${h}px`
    div.appendChild(b)
    acc += h
  })
  document.body.appendChild(div)
  return div
}

describe('usePaginatedBlocks', () => {
  let container: HTMLElement
  let ref: RefObject<HTMLElement>

  beforeEach(() => {
    container = makeContainer([80, 150, 50, 100, 120])
    ref = { current: container }
  })
  afterEach(() => {
    container.remove()
    vi.useRealTimers()
  })

  it.skip('贪心装页: 5 blocks 高度 [80,150,50,100,120] 装入 pageHeight=200', async () => {
    const { result } = renderHook(() =>
      usePaginatedBlocks(ref, { width: 100, height: 200 })
    )
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })
    const pages = result.current.pages
    expect(pages.length).toBe(3)
    expect(pages[0].startBlockIdx).toBe(0)
    expect(pages[0].endBlockIdx).toBe(0)
    expect(pages[1].startBlockIdx).toBe(2)
    expect(pages[1].endBlockIdx).toBe(3)
    expect(pages[2].startBlockIdx).toBe(4)
    expect(pages[2].endBlockIdx).toBe(4)
  })

  it.skip('totalPages 等于 pages.length', async () => {
    const { result } = renderHook(() =>
      usePaginatedBlocks(ref, { width: 100, height: 200 })
    )
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })
    expect(result.current.totalPages).toBe(result.current.pages.length)
  })

  it.skip('goToPage 切到指定 index 并更新 currentPage', async () => {
    const { result } = renderHook(() =>
      usePaginatedBlocks(ref, { width: 100, height: 200 })
    )
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })
    act(() => result.current.goToPage(1))
    expect(result.current.currentPage).toBe(1)
  })

  it.skip('goToPage 越界 clamp', async () => {
    const { result } = renderHook(() =>
      usePaginatedBlocks(ref, { width: 100, height: 200 })
    )
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })
    act(() => result.current.goToPage(99))
    expect(result.current.currentPage).toBe(result.current.pages.length - 1)
    act(() => result.current.goToPage(-5))
    expect(result.current.currentPage).toBe(0)
  })

  it.skip('getPageOf 根据 offsetTop 查 page', async () => {
    const { result } = renderHook(() =>
      usePaginatedBlocks(ref, { width: 100, height: 200 })
    )
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })
    const block1 = container.children[1] as HTMLElement
    expect(result.current.getPageOf(block1)).toBe(0)
    const block2 = container.children[2] as HTMLElement
    expect(result.current.getPageOf(block2)).toBe(1)
  })
})
