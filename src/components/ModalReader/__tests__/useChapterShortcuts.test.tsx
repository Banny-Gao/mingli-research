// src/components/ModalReader/__tests__/useChapterShortcuts.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useChapterShortcuts } from '../useChapterShortcuts'

const originalAdd = window.addEventListener.bind(window)
const originalRemove = window.removeEventListener.bind(window)

let listeners: Array<(e: KeyboardEvent) => void>

const fireKey = (key: string) => {
  const event = new KeyboardEvent('keydown', { key, bubbles: true })
  listeners.forEach(l => l(event))
}

const setActiveElement = (el: Element | null) => {
  Object.defineProperty(document, 'activeElement', { value: el, configurable: true })
}

interface HookParams {
  chapters: Array<{ name: string }>
  modalKey: string
  modalType: 'interp' | 'source' | 'skill'
  onNavigate: (type: 'interp' | 'source' | 'skill', key: string) => void
  toggleBookmark: (key: string, type: 'interp' | 'source' | 'skill') => void
  onCancelSelection: () => void
}

const renderShortcuts = (params: HookParams) => renderHook(() => useChapterShortcuts(params))

describe('useChapterShortcuts', () => {
  beforeEach(() => {
    listeners = []
    window.addEventListener = ((type: string, listener: EventListener) => {
      if (type === 'keydown') {
        listeners.push(listener as (e: KeyboardEvent) => void)
      } else {
        originalAdd(type, listener)
      }
    }) as typeof window.addEventListener
    setActiveElement(document.body)
  })

  afterEach(() => {
    window.addEventListener = originalAdd
    window.removeEventListener = originalRemove
  })

  it('j 在末章 → 不调 onNavigate', () => {
    const onNavigate = vi.fn()
    renderShortcuts({
      chapters: [{ name: 'a' }, { name: 'b' }],
      modalKey: 'b',
      modalType: 'interp',
      onNavigate,
      toggleBookmark: vi.fn(),
      onCancelSelection: vi.fn(),
    })
    fireKey('j')
    expect(onNavigate).not.toHaveBeenCalled()
  })

  it('j 在第一章 → 调 onNavigate 到下一章', () => {
    const onNavigate = vi.fn()
    renderShortcuts({
      chapters: [{ name: 'a' }, { name: 'b' }],
      modalKey: 'a',
      modalType: 'interp',
      onNavigate,
      toggleBookmark: vi.fn(),
      onCancelSelection: vi.fn(),
    })
    fireKey('j')
    expect(onNavigate).toHaveBeenCalledWith('interp', 'b')
  })

  it('J（大写）也触发', () => {
    const onNavigate = vi.fn()
    renderShortcuts({
      chapters: [{ name: 'a' }, { name: 'b' }],
      modalKey: 'a',
      modalType: 'source',
      onNavigate,
      toggleBookmark: vi.fn(),
      onCancelSelection: vi.fn(),
    })
    fireKey('J')
    expect(onNavigate).toHaveBeenCalledWith('source', 'b')
  })

  it('k 在第一章 → 不调 onNavigate', () => {
    const onNavigate = vi.fn()
    renderShortcuts({
      chapters: [{ name: 'a' }, { name: 'b' }],
      modalKey: 'a',
      modalType: 'interp',
      onNavigate,
      toggleBookmark: vi.fn(),
      onCancelSelection: vi.fn(),
    })
    fireKey('k')
    expect(onNavigate).not.toHaveBeenCalled()
  })

  it('b → toggleBookmark(modalKey, modalType)', () => {
    const toggleBookmark = vi.fn()
    renderShortcuts({
      chapters: [{ name: 'a' }],
      modalKey: 'a',
      modalType: 'source',
      onNavigate: vi.fn(),
      toggleBookmark,
      onCancelSelection: vi.fn(),
    })
    fireKey('b')
    expect(toggleBookmark).toHaveBeenCalledWith('a', 'source')
  })

  it('Escape → 调 onCancelSelection', () => {
    const onCancelSelection = vi.fn()
    renderShortcuts({
      chapters: [{ name: 'a' }],
      modalKey: 'a',
      modalType: 'interp',
      onNavigate: vi.fn(),
      toggleBookmark: vi.fn(),
      onCancelSelection,
    })
    fireKey('Escape')
    expect(onCancelSelection).toHaveBeenCalledTimes(1)
  })

  it('INPUT focus 时忽略全部快捷键', () => {
    const input = document.createElement('input')
    document.body.appendChild(input)
    setActiveElement(input)
    try {
      const onNavigate = vi.fn()
      const toggleBookmark = vi.fn()
      const onCancelSelection = vi.fn()
      renderShortcuts({
        chapters: [{ name: 'a' }, { name: 'b' }],
        modalKey: 'a',
        modalType: 'interp',
        onNavigate,
        toggleBookmark,
        onCancelSelection,
      })
      fireKey('j')
      fireKey('k')
      fireKey('b')
      fireKey('Escape')
      expect(onNavigate).not.toHaveBeenCalled()
      expect(toggleBookmark).not.toHaveBeenCalled()
      expect(onCancelSelection).not.toHaveBeenCalled()
    } finally {
      setActiveElement(document.body)
      document.body.removeChild(input)
    }
  })

  it('unmount 移除 keydown 监听（不抛错）', () => {
    const { unmount } = renderShortcuts({
      chapters: [{ name: 'a' }],
      modalKey: 'a',
      modalType: 'interp',
      onNavigate: vi.fn(),
      toggleBookmark: vi.fn(),
      onCancelSelection: vi.fn(),
    })
    expect(() => unmount()).not.toThrow()
  })
})
