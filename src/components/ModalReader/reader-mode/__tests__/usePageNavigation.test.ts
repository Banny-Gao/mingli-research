// src/components/ModalReader/reader-mode/__tests__/usePageNavigation.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePageNavigation } from '../usePageNavigation'
import { savePage, loadPage } from '../persistence'

describe('usePageNavigation', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('初始 currentPage 从 0 开始', () => {
    const { result } = renderHook(() =>
      usePageNavigation({
        bookSlug: 'b1',
        modalType: 'interp',
        modalKey: 'k1',
        totalPages: 10,
      })
    )
    expect(result.current.currentPage).toBe(0)
  })

  it('goToPage 修改 currentPage 并持久化', () => {
    const { result } = renderHook(() =>
      usePageNavigation({
        bookSlug: 'b1',
        modalType: 'interp',
        modalKey: 'k1',
        totalPages: 10,
      })
    )
    act(() => result.current.goToPage(3))
    expect(result.current.currentPage).toBe(3)
    expect(loadPage('b1', 'interp', 'k1')).toBe(3)
  })

  it('goToPage clamp 到 [0, totalPages-1]', () => {
    const { result } = renderHook(() =>
      usePageNavigation({
        bookSlug: 'b1',
        modalType: 'interp',
        modalKey: 'k1',
        totalPages: 5,
      })
    )
    act(() => result.current.goToPage(99))
    expect(result.current.currentPage).toBe(4)
    act(() => result.current.goToPage(-1))
    expect(result.current.currentPage).toBe(0)
  })

  it('切换章节（modalKey 变化）时重置 currentPage 为 0', () => {
    savePage('b1', 'interp', 'k1', 5)
    const { result, rerender } = renderHook(
      ({ key }: { key: string }) =>
        usePageNavigation({
          bookSlug: 'b1',
          modalType: 'interp',
          modalKey: key,
          totalPages: 10,
        }),
      { initialProps: { key: 'k1' } }
    )
    expect(result.current.currentPage).toBe(5)

    rerender({ key: 'k2' })
    expect(result.current.currentPage).toBe(0)
  })

  it('切换 bookSlug 时重置 currentPage', () => {
    savePage('b1', 'interp', 'k1', 7)
    const { result, rerender } = renderHook(
      ({ slug }: { slug: string }) =>
        usePageNavigation({
          bookSlug: slug,
          modalType: 'interp',
          modalKey: 'k1',
          totalPages: 10,
        }),
      { initialProps: { slug: 'b1' } }
    )
    expect(result.current.currentPage).toBe(7)

    rerender({ slug: 'b2' })
    expect(result.current.currentPage).toBe(0)
  })

  it('切换章节时优先采用 initialPage（如果提供）', () => {
    savePage('b1', 'interp', 'k1', 5)
    const { result, rerender } = renderHook(
      ({ key, initial }: { key: string; initial?: number }) =>
        usePageNavigation({
          bookSlug: 'b1',
          modalType: 'interp',
          modalKey: key,
          totalPages: 10,
          initialPage: initial,
        }),
      { initialProps: { key: 'k1', initial: 0 } }
    )
    rerender({ key: 'k2', initial: 2 })
    expect(result.current.currentPage).toBe(2)
  })

  it('totalPages 缩小时 clamp currentPage', () => {
    const { result, rerender } = renderHook(
      ({ total }: { total: number }) =>
        usePageNavigation({
          bookSlug: 'b1',
          modalType: 'interp',
          modalKey: 'k1',
          totalPages: total,
        }),
      { initialProps: { total: 10 } }
    )
    act(() => result.current.goToPage(8))
    expect(result.current.currentPage).toBe(8)

    rerender({ total: 3 })
    expect(result.current.currentPage).toBe(2)
  })

  it('checkBoundary 触发 onCrossChapter 并返回 true', () => {
    const onCross = vi.fn()
    const { result } = renderHook(() =>
      usePageNavigation({
        bookSlug: 'b1',
        modalType: 'interp',
        modalKey: 'k1',
        totalPages: 5,
        onCrossChapter: onCross,
      })
    )
    act(() => result.current.goToPage(4))
    const triggered = result.current.checkBoundary('next')
    expect(triggered).toBe(true)
    expect(onCross).toHaveBeenCalledWith('next')
  })

  it('checkBoundary 未到边界返回 false 不触发', () => {
    const onCross = vi.fn()
    const { result } = renderHook(() =>
      usePageNavigation({
        bookSlug: 'b1',
        modalType: 'interp',
        modalKey: 'k1',
        totalPages: 5,
        onCrossChapter: onCross,
      })
    )
    act(() => result.current.goToPage(2))
    const triggered = result.current.checkBoundary('next')
    expect(triggered).toBe(false)
    expect(onCross).not.toHaveBeenCalled()
  })
})
