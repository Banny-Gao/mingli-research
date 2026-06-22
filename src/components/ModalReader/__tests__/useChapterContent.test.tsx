// src/components/ModalReader/__tests__/useChapterContent.test.tsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useChapterContent } from '../useChapterContent'

const lo = (v: string) => vi.fn().mockResolvedValue(v)
const loErr = () => vi.fn().mockRejectedValue(new Error('boom'))

describe('useChapterContent', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('初始：loading=true, content=""', () => {
    const { result } = renderHook(() =>
      useChapterContent({ modalType: 'interp', modalKey: 'a', loaders: { a: lo('A') } })
    )
    expect(result.current.contentLoading).toBe(true)
    expect(result.current.loadedContent).toBe('')
  })

  it('modalType="interp"：调用对应 loader 拉取内容', async () => {
    const loaderA = vi.fn().mockResolvedValue('A 内容')
    const { result } = renderHook(() =>
      useChapterContent({
        modalType: 'interp',
        modalKey: 'a',
        loaders: { a: loaderA, b: vi.fn().mockResolvedValue('B 内容') },
      })
    )
    await waitFor(() => expect(result.current.loadedContent).toBe('A 内容'))
    expect(result.current.contentLoading).toBe(false)
    expect(loaderA).toHaveBeenCalled()
    expect(loaderA.mock.calls.length).toBeGreaterThanOrEqual(1)
  })

  it('modalKey 变化 → 重新拉取', async () => {
    const loaderA = lo('A')
    const loaderB = lo('B')
    const { result, rerender } = renderHook(
      ({ key }: { key: string }) =>
        useChapterContent({
          modalType: 'interp',
          modalKey: key,
          loaders: { a: loaderA, b: loaderB },
        }),
      { initialProps: { key: 'a' } }
    )
    await waitFor(() => expect(result.current.loadedContent).toBe('A'))
    rerender({ key: 'b' })
    await waitFor(() => expect(result.current.loadedContent).toBe('B'))
  })

  it('loader 抛错：contentLoading → false（不抛到外层）', async () => {
    const loader = loErr()
    const { result } = renderHook(() =>
      useChapterContent({ modalType: 'interp', modalKey: 'a', loaders: { a: loader } })
    )
    await waitFor(() => expect(result.current.contentLoading).toBe(false))
    expect(result.current.loadedContent).toBe('')
  })

  it('loader 不存在：立即 contentLoading=false', () => {
    const { result } = renderHook(() =>
      useChapterContent({ modalType: 'interp', modalKey: 'missing', loaders: {} })
    )
    expect(result.current.contentLoading).toBe(false)
  })
})
