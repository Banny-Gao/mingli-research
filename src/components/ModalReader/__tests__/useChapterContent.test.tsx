// src/components/ModalReader/__tests__/useChapterContent.test.tsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
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

  it('skill 模式：同步返回空字符串 + 不调 loader', () => {
    const loader = vi.fn()
    const { result } = renderHook(() =>
      useChapterContent({ modalType: 'skill', modalKey: 'any', loaders: { x: loader } })
    )
    expect(result.current.contentLoading).toBe(false)
    expect(result.current.loadedContent).toBe('')
    expect(loader).not.toHaveBeenCalled()
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

  it('skill 模式 + skillLoaders + chapterKey：调用对应 loader 拉取 skillRawText', async () => {
    const loaderX = vi.fn().mockResolvedValue('raw skill content')
    const { result } = renderHook(() =>
      useChapterContent({
        modalType: 'skill',
        modalKey: '技能A',
        chapterKey: '篇章X',
        loaders: {},
        skillLoaders: { 篇章X: loaderX },
      })
    )
    await waitFor(() => expect(result.current.skillRawText).toBe('raw skill content'))
    expect(loaderX).toHaveBeenCalled()
  })

  it('skill 模式 + 无 chapterKey：跳过 skill loader', () => {
    const loader = vi.fn()
    renderHook(() =>
      useChapterContent({
        modalType: 'skill',
        modalKey: 'k1',
        loaders: {},
        skillLoaders: { k1: loader },
      })
    )
    expect(loader).not.toHaveBeenCalled()
  })

  it('skill 模式 + skillLoaders[chapterKey] 不存在：skillRawText 保持空', async () => {
    const { result } = renderHook(() =>
      useChapterContent({
        modalType: 'skill',
        modalKey: 'k1',
        chapterKey: 'missing',
        loaders: {},
        skillLoaders: {},
      })
    )
    // 等一帧 promise 链
    await waitFor(() => expect(result.current.skillRawText).toBe(''))
  })

  it('skill 模式 + skillLoader 抛错：静默（不抛外层）', async () => {
    const loader = vi.fn().mockRejectedValue(new Error('boom'))
    const { result } = renderHook(() =>
      useChapterContent({
        modalType: 'skill',
        modalKey: 'k1',
        chapterKey: '篇章1',
        loaders: {},
        skillLoaders: { 篇章1: loader },
      })
    )
    // 静默——不抛，skillRawText 仍空
    await waitFor(() => expect(result.current.skillRawText).toBe(''))
  })

  it('返回 skillRawText + setSkillRawText', () => {
    const { result } = renderHook(() =>
      useChapterContent({ modalType: 'skill', modalKey: 'k1', loaders: {} })
    )
    act(() => result.current.setSkillRawText('raw text'))
    expect(result.current.skillRawText).toBe('raw text')
  })
})
