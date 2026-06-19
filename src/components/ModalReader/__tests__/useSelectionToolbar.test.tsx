// src/components/ModalReader/__tests__/useSelectionToolbar.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useRef } from 'react'
import { useSelectionToolbar } from '../useSelectionToolbar'

function makeContainer(text: string): HTMLDivElement {
  const div = document.createElement('div')
  div.textContent = text
  document.body.appendChild(div)
  return div
}

function setSelection(div: HTMLDivElement, start: number, end: number) {
  const sel = window.getSelection()!
  sel.removeAllRanges()
  const r = document.createRange()
  const text = div.firstChild as Text
  r.setStart(text, start)
  r.setEnd(text, end)
  sel.addRange(r)
}

describe('useSelectionToolbar', () => {
  beforeEach(() => {
    window.getSelection()?.removeAllRanges()
  })

  it('collapsed 选区 → 不调 onSelect', () => {
    const onSelect = vi.fn()
    const div = makeContainer('hello world')
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(div)
      return useSelectionToolbar({ containerRef: ref, onSelect })
    })
    // 不设置选区 → isCollapsed = true
    result.current.handleSelection({ clientX: 0, clientY: 0 } as React.MouseEvent)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('空文本选区（trim 后为空）→ 不调 onSelect', () => {
    const onSelect = vi.fn()
    const div = makeContainer('   ')
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(div)
      return useSelectionToolbar({ containerRef: ref, onSelect })
    })
    setSelection(div, 0, 3)
    result.current.handleSelection({ clientX: 0, clientY: 0 } as React.MouseEvent)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('有效选区：调 onSelect，position 含 clientX/Y 减 8', () => {
    const onSelect = vi.fn()
    const div = makeContainer('foo bar foo baz foo')
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(div)
      return useSelectionToolbar({ containerRef: ref, onSelect })
    })
    setSelection(div, 8, 11) // 第二次 "foo"
    result.current.handleSelection({ clientX: 100, clientY: 200 } as React.MouseEvent)
    expect(onSelect).toHaveBeenCalledTimes(1)
    const [pos, sel] = onSelect.mock.calls[0]
    expect(pos).toEqual({ x: 100, y: 192 })
    expect(sel).toMatchObject({ text: 'foo', start: 8, end: 11, matchIndex: 1 })
  })

  it('第一次 occurrence → matchIndex=0', () => {
    const onSelect = vi.fn()
    const div = makeContainer('foo bar foo')
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(div)
      return useSelectionToolbar({ containerRef: ref, onSelect })
    })
    setSelection(div, 0, 3) // 第一次 "foo"
    result.current.handleSelection({ clientX: 0, clientY: 0 } as React.MouseEvent)
    expect(onSelect).toHaveBeenCalledWith(
      { x: 0, y: -8 },
      expect.objectContaining({ text: 'foo', matchIndex: 0 })
    )
  })

  it('TouchEvent：touches[0].clientX/Y 优先', () => {
    const onSelect = vi.fn()
    const div = makeContainer('abc def')
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(div)
      return useSelectionToolbar({ containerRef: ref, onSelect })
    })
    setSelection(div, 0, 3)
    result.current.handleSelection({
      changedTouches: [{ clientX: 10, clientY: 20 }],
    } as unknown as React.TouchEvent)
    expect(onSelect).toHaveBeenCalledWith(
      { x: 10, y: 12 },
      expect.objectContaining({ text: 'abc' })
    )
  })
})
