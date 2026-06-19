// src/components/ModalReader/__tests__/useChapterLocalState.test.tsx
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useChapterLocalState } from '../useChapterLocalState'

describe('useChapterLocalState', () => {
  it('初始 modalKey → 默认值', () => {
    const { result } = renderHook(() => useChapterLocalState('k1'))
    expect(result.current.toolbarPos).toBeNull()
    expect(result.current.showPanel).toBe(false)
    expect(result.current.pendingSelection).toBeNull()
    expect(result.current.tocOpen).toBe(false)
    expect(result.current.headerVisible).toBe(true)
  })

  it('setter 独立工作', () => {
    const { result } = renderHook(() => useChapterLocalState('k1'))
    act(() => result.current.setToolbarPos({ x: 10, y: 20 }))
    act(() => result.current.setShowPanel(true))
    act(() => result.current.setTocOpen(true))
    act(() => result.current.setHeaderVisible(false))
    act(() => result.current.setPendingSelection({ text: 't', start: 0, end: 1, matchIndex: 0 }))
    expect(result.current.toolbarPos).toEqual({ x: 10, y: 20 })
    expect(result.current.showPanel).toBe(true)
    expect(result.current.tocOpen).toBe(true)
    expect(result.current.headerVisible).toBe(false)
    expect(result.current.pendingSelection?.text).toBe('t')
  })

  it('reset() → 全部回到默认值', () => {
    const { result } = renderHook(() => useChapterLocalState('k1'))
    act(() => result.current.setShowPanel(true))
    act(() => result.current.setToolbarPos({ x: 1, y: 2 }))
    act(() => result.current.setTocOpen(true))
    act(() => result.current.setHeaderVisible(false))
    act(() => result.current.reset())
    expect(result.current.toolbarPos).toBeNull()
    expect(result.current.showPanel).toBe(false)
    expect(result.current.tocOpen).toBe(false)
    expect(result.current.headerVisible).toBe(true)
    expect(result.current.pendingSelection).toBeNull()
  })

  it('modalKey 变化 → 自动 reset（章节身份切换）', () => {
    const { result, rerender } = renderHook(
      ({ key }: { key: string }) => useChapterLocalState(key),
      {
        initialProps: { key: 'k1' },
      }
    )
    act(() => result.current.setShowPanel(true))
    act(() => result.current.setToolbarPos({ x: 1, y: 2 }))
    rerender({ key: 'k2' })
    expect(result.current.toolbarPos).toBeNull()
    expect(result.current.showPanel).toBe(false)
  })

  it('相同 modalKey 重复渲染 → 不重置', () => {
    const { result, rerender } = renderHook(
      ({ key }: { key: string }) => useChapterLocalState(key),
      {
        initialProps: { key: 'k1' },
      }
    )
    act(() => result.current.setShowPanel(true))
    rerender({ key: 'k1' })
    expect(result.current.showPanel).toBe(true)
  })
})
