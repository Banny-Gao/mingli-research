// src/components/ModalReader/reader-mode/__tests__/useAnimatedCollapse.test.tsx
import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { type RefObject } from 'react'
import { useAnimatedCollapse } from '../useAnimatedCollapse'

// jsdom 不支持 layout（offsetHeight = 0），GSAP 会跑通但实际不可视化。

function makeHeader(): HTMLDivElement {
  const el = document.createElement('div')
  document.body.appendChild(el)
  return el
}

describe('useAnimatedCollapse', () => {
  it('首挂不动画（visible 默认 true 也不写 will-change）', () => {
    const header = makeHeader()
    renderHook(() => {
      const ref: RefObject<HTMLDivElement | null> = { current: header }
      useAnimatedCollapse({ refs: [ref], visible: true })
    })
    expect(header.style.willChange).toBe('')
  })

  it('visible 变化触发 effect 重新执行但不抛错', () => {
    const header = makeHeader()
    const { rerender, unmount } = renderHook(
      ({ vis }: { vis: boolean }) => {
        const ref: RefObject<HTMLDivElement | null> = { current: header }
        useAnimatedCollapse({ refs: [ref], visible: vis })
      },
      { initialProps: { vis: true } }
    )
    expect(() => rerender({ vis: false })).not.toThrow()
    expect(() => rerender({ vis: true })).not.toThrow()
    unmount()
  })

  it('unmount 不抛错', () => {
    const header = makeHeader()
    const { unmount } = renderHook(() => {
      const ref: RefObject<HTMLDivElement | null> = { current: header }
      useAnimatedCollapse({ refs: [ref], visible: false })
    })
    expect(() => unmount()).not.toThrow()
  })

  it('空 refs（全部 null）→ effect 安全跳过', () => {
    const { rerender } = renderHook(
      ({ vis }: { vis: boolean }) => {
        const ref: RefObject<HTMLDivElement | null> = { current: null }
        useAnimatedCollapse({ refs: [ref], visible: vis })
      },
      { initialProps: { vis: true } }
    )
    expect(() => rerender({ vis: false })).not.toThrow()
  })
})
