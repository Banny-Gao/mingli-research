// src/components/ModalReader/__tests__/useChapterNavigation.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useChapterNavigation } from '../useChapterNavigation'
import type { BookData } from '../modalType'

function makeBookData(overrides: Partial<BookData> = {}): BookData {
  return {
    interpContent: {},
    sourceContent: {},
    skillRawContent: {},
    skillDisplayNames: {},
    chapterToSkills: {},
    skillToChapters: {},
    ...overrides,
  }
}

describe('useChapterNavigation', () => {
  it('返回基础派生（单章无前后）', () => {
    const chapters = [{ name: 'a' }]
    const { result } = renderHook(() =>
      useChapterNavigation({
        chapters,
        modalType: 'interp',
        modalKey: 'a',
        bookData: makeBookData(),
      })
    )
    expect(result.current.chapterName).toBe('a')
    expect(result.current.chapterIndex).toBe(0)
    expect(result.current.hasPrev).toBe(false)
    expect(result.current.hasNext).toBe(false)
    expect(result.current.prevChapter).toBeNull()
    expect(result.current.nextChapter).toBeNull()
  })

  it('多章：正确返回 prev/next', () => {
    const chapters = [{ name: 'a' }, { name: 'b' }, { name: 'c' }]
    const { result } = renderHook(() =>
      useChapterNavigation({
        chapters,
        modalType: 'interp',
        modalKey: 'b',
        bookData: makeBookData(),
      })
    )
    expect(result.current.chapterIndex).toBe(1)
    expect(result.current.hasPrev).toBe(true)
    expect(result.current.prevChapter).toBe('a')
    expect(result.current.hasNext).toBe(true)
    expect(result.current.nextChapter).toBe('c')
  })

  it('第一章：hasPrev=false', () => {
    const chapters = [{ name: 'a' }, { name: 'b' }]
    const { result } = renderHook(() =>
      useChapterNavigation({
        chapters,
        modalType: 'interp',
        modalKey: 'a',
        bookData: makeBookData(),
      })
    )
    expect(result.current.hasPrev).toBe(false)
    expect(result.current.hasNext).toBe(true)
  })

  it('末章：hasNext=false', () => {
    const chapters = [{ name: 'a' }, { name: 'b' }]
    const { result } = renderHook(() =>
      useChapterNavigation({
        chapters,
        modalType: 'interp',
        modalKey: 'b',
        bookData: makeBookData(),
      })
    )
    expect(result.current.hasPrev).toBe(true)
    expect(result.current.hasNext).toBe(false)
  })

  it('未匹配的 modalKey → chapterIndex=-1，prev/next 都为 null', () => {
    const chapters = [{ name: 'a' }, { name: 'b' }]
    const { result } = renderHook(() =>
      useChapterNavigation({
        chapters,
        modalType: 'interp',
        modalKey: 'not-exist',
        bookData: makeBookData(),
      })
    )
    expect(result.current.chapterIndex).toBe(-1)
    expect(result.current.hasPrev).toBe(false)
    expect(result.current.hasNext).toBe(false)
    expect(result.current.prevChapter).toBeNull()
    expect(result.current.nextChapter).toBeNull()
  })

  it('skill 模式：chapterName 通过 skillToChapters 映射', () => {
    const bookData = makeBookData({ skillToChapters: { 技能A: ['篇章X'] } })
    const chapters = [{ name: '篇章X' }]
    const { result } = renderHook(() =>
      useChapterNavigation({ chapters, modalType: 'skill', modalKey: '技能A', bookData })
    )
    expect(result.current.chapterName).toBe('篇章X')
  })

  it('skill 模式：skillToChapters 缺失 → fallback 到 modalKey', () => {
    const bookData = makeBookData({ skillToChapters: {} })
    const chapters = [{ name: '技能A' }]
    const { result } = renderHook(() =>
      useChapterNavigation({ chapters, modalType: 'skill', modalKey: '技能A', bookData })
    )
    expect(result.current.chapterName).toBe('技能A')
  })

  describe('contentNavItems', () => {
    it('interp 模式：源 + 解读都存在 → 只展示 source（当前类型过滤）', () => {
      const bookData = makeBookData({
        sourceContent: { a: vi.fn() },
        interpContent: { a: vi.fn() },
      })
      const { result } = renderHook(() =>
        useChapterNavigation({
          chapters: [{ name: 'a' }],
          modalType: 'interp',
          modalKey: 'a',
          bookData,
        })
      )
      expect(result.current.contentNavItems).toEqual([
        { type: 'source', label: '原文', navKey: 'a' },
      ])
    })

    it('skill 模式 + chapterSkillName 缺失 → contentNavItems 为空', () => {
      const bookData = makeBookData({
        skillRawContent: { a: vi.fn() },
        chapterToSkills: {},
      })
      const { result } = renderHook(() =>
        useChapterNavigation({
          chapters: [{ name: 'a' }],
          modalType: 'skill',
          modalKey: 'a',
          bookData,
        })
      )
      expect(result.current.contentNavItems).toEqual([])
    })

    it('skill 模式 + chapterSkillName 存在 → 展示 interp 项（同篇章其他模式）', () => {
      // skill 模式本身已展示 skill 内容；contentNavItems 仅展示**其他**模式项
      const bookData = makeBookData({
        sourceContent: { a: vi.fn() },
        interpContent: { a: vi.fn() },
        skillRawContent: { a: vi.fn() },
        chapterToSkills: { a: ['skill-1'] },
      })
      const { result } = renderHook(() =>
        useChapterNavigation({
          chapters: [{ name: 'a' }],
          modalType: 'skill',
          modalKey: 'a',
          bookData,
        })
      )
      expect(result.current.contentNavItems).toEqual([
        { type: 'source', label: '原文', navKey: 'a' },
        { type: 'interp', label: '解读', navKey: 'a' },
      ])
    })

    it('所有内容类型都不存在 → contentNavItems 为空', () => {
      const { result } = renderHook(() =>
        useChapterNavigation({
          chapters: [{ name: 'a' }],
          modalType: 'interp',
          modalKey: 'a',
          bookData: makeBookData(),
        })
      )
      expect(result.current.contentNavItems).toEqual([])
    })
  })

  it('空 chapters 数组 → 安全处理（不抛错）', () => {
    const { result } = renderHook(() =>
      useChapterNavigation({
        chapters: [],
        modalType: 'interp',
        modalKey: 'a',
        bookData: makeBookData(),
      })
    )
    expect(result.current.chapterIndex).toBe(-1)
    expect(result.current.hasPrev).toBe(false)
    expect(result.current.hasNext).toBe(false)
  })
})
