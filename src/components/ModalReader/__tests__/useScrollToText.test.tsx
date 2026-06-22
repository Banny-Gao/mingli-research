// src/components/ModalReader/__tests__/useScrollToText.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useRef } from 'react'
import { useScrollToText } from '../useScrollToText'
import type { PaginatedReaderHandle } from '../reader-mode/PaginatedReader'

const originalRAF = globalThis.requestAnimationFrame
const originalST = globalThis.setTimeout

function setupRAFImmediate() {
  // rAF → 同步执行 flush
  globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
    cb(0)
    return 0
  }) as typeof globalThis.requestAnimationFrame
  // setTimeout → 同步执行（让 walkScroll 也跑完）
  globalThis.setTimeout = ((cb: () => void, _ms?: number) => {
    cb()
    return 0
  }) as unknown as typeof globalThis.setTimeout
}

describe('useScrollToText', () => {
  beforeEach(() => {
    setupRAFImmediate()
  })

  afterEach(() => {
    globalThis.requestAnimationFrame = originalRAF
    globalThis.setTimeout = originalST
    vi.restoreAllMocks()
  })

  it('scrollToText 为 null → 不调 onConsumed', () => {
    const onConsumed = vi.fn()
    renderHook(() => {
      const modalBodyRef = useRef<HTMLDivElement>(null)
      useScrollToText({
        modalKey: 'k1',
        scrollToText: null,
        contentLoading: false,
        loadedContent: '',
        readerMode: 'scroll',
        modalBodyRef,
        paginatedReaderRef: { current: null },
        onConsumed,
      })
    })
    expect(onConsumed).not.toHaveBeenCalled()
  })

  it('contentLoading=true → 不调 onConsumed', () => {
    const onConsumed = vi.fn()
    renderHook(() => {
      const modalBodyRef = useRef<HTMLDivElement>(null)
      useScrollToText({
        modalKey: 'k1',
        scrollToText: 'abc',
        contentLoading: true,
        loadedContent: '',
        readerMode: 'scroll',
        modalBodyRef,
        paginatedReaderRef: { current: null },
        onConsumed,
      })
    })
    expect(onConsumed).not.toHaveBeenCalled()
  })

  it('modalBodyRef 未挂载 → 不调 onConsumed', () => {
    const onConsumed = vi.fn()
    renderHook(() => {
      const modalBodyRef = useRef<HTMLDivElement>(null)
      useScrollToText({
        modalKey: 'k1',
        scrollToText: 'abc',
        contentLoading: false,
        loadedContent: 'abc',
        readerMode: 'scroll',
        modalBodyRef,
        paginatedReaderRef: { current: null },
        onConsumed,
      })
    })
    expect(onConsumed).not.toHaveBeenCalled()
  })

  it('scroll 模式：content 含 target → scrollIntoView 触发（通过 mark）', () => {
    const onConsumed = vi.fn()
    const scrollTo = vi.fn()
    const { result } = renderHook(() => {
      const div = document.createElement('div')
      div.textContent = '前文abc后文'
      div.scrollTo = scrollTo
      document.body.appendChild(div)
      const modalBodyRef = useRef<HTMLDivElement>(div)
      useScrollToText({
        modalKey: 'k1',
        scrollToText: 'abc',
        contentLoading: false,
        loadedContent: '前文abc后文',
        readerMode: 'scroll',
        modalBodyRef,
        paginatedReaderRef: { current: null },
        onConsumed,
      })
      return modalBodyRef
    })
    expect(scrollTo).toHaveBeenCalled()
    expect(result.current).toBeTruthy()
  })

  it('翻页模式：paginated handle 返回 null → 调 onConsumed', () => {
    const onConsumed = vi.fn()
    renderHook(() => {
      const div = document.createElement('div')
      document.body.appendChild(div)
      const modalBodyRef = useRef<HTMLDivElement>(div)
      const handle: Partial<PaginatedReaderHandle> = {
        findText: () => null,
        goToPage: vi.fn(),
        getPageOfHeadingId: vi.fn(),
      }
      useScrollToText({
        modalKey: 'k1',
        scrollToText: 'abc',
        contentLoading: false,
        loadedContent: 'abc',
        readerMode: 'smooth',
        modalBodyRef,
        paginatedReaderRef: { current: handle as PaginatedReaderHandle },
        onConsumed,
      })
    })
    expect(onConsumed).toHaveBeenCalledTimes(1)
  })

  it('翻页模式：findText 找到 → 调 handle.goToPage', () => {
    const onConsumed = vi.fn()
    const goToPage = vi.fn()
    renderHook(() => {
      const div = document.createElement('div')
      div.innerHTML = '<div class="paginated-reader-container">abc</div>'
      document.body.appendChild(div)
      const modalBodyRef = useRef<HTMLDivElement>(div)
      const handle: Partial<PaginatedReaderHandle> = {
        findText: () => ({ pageIdx: 2, searchText: 'abc' }),
        goToPage,
        getPageOfHeadingId: vi.fn(),
      }
      useScrollToText({
        modalKey: 'k1',
        scrollToText: 'abc',
        contentLoading: false,
        loadedContent: 'abc',
        readerMode: 'flip',
        modalBodyRef,
        paginatedReaderRef: { current: handle as PaginatedReaderHandle },
        onConsumed,
      })
    })
    expect(goToPage).toHaveBeenCalledWith(2)
  })
})
