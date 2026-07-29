// src/components/ModalReader/reader-mode/__tests__/usePageGesture.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { createRef } from 'react'
import { usePageGesture } from '../usePageGesture'

/**
 * Hammer.js 依赖真实 touch 事件，jsdom 下无法完整模拟。
 * 这里 mock Hammer.Manager，捕获注册的事件回调后手动触发，
 * 验证轴锁定逻辑（横向翻页 vs 纵向滚动分流）。
 */
type Handler = (e: { deltaX: number; deltaY: number; velocityX: number }) => void
const handlers = new Map<string, Handler>()

vi.mock('hammerjs', () => {
  class Pan {
    constructor(public opts: unknown) {}
    recognizeWith() {}
  }
  class Tap {
    constructor(public opts: unknown) {}
    recognizeWith() {}
  }
  class Manager {
    constructor(
      public el: unknown,
      public opts: unknown
    ) {}
    add() {}
    on(name: string, fn: Handler) {
      handlers.set(name, fn)
    }
    destroy() {
      handlers.clear()
    }
  }
  return {
    default: { Manager, Pan, Tap, DIRECTION_ALL: 30, DIRECTION_HORIZONTAL: 6 },
  }
})

function setup(overrides: Partial<Parameters<typeof usePageGesture>[0]> = {}) {
  const el = document.createElement('div')
  Object.defineProperty(el, 'clientWidth', { value: 400, configurable: true })
  document.body.appendChild(el)
  const ref = createRef<HTMLElement>() as React.RefObject<HTMLElement | null>
  ref.current = el

  const goToPage = vi.fn()
  const onPanMove = vi.fn()
  const onVerticalPan = vi.fn()

  renderHook(() =>
    usePageGesture({
      containerRef: ref,
      currentPage: 1,
      totalPages: 5,
      goToPage,
      onPanMove,
      onVerticalPan,
      ...overrides,
    })
  )
  return { goToPage, onPanMove, onVerticalPan }
}

const evt = (deltaX: number, deltaY: number, velocityX = 0) => ({
  deltaX,
  deltaY,
  velocityX,
})

beforeEach(() => {
  handlers.clear()
  document.body.innerHTML = ''
})

describe('usePageGesture 轴锁定', () => {
  it('横向为主 → 触发翻页，不转发纵向滚动', () => {
    const { goToPage, onPanMove, onVerticalPan } = setup()
    handlers.get('panstart')!(evt(0, 0))
    handlers.get('panmove')!(evt(-60, 5))
    handlers.get('panend')!(evt(-60, 5, 0.5))

    expect(onPanMove).toHaveBeenCalledWith(-60)
    expect(onVerticalPan).not.toHaveBeenCalled()
    expect(goToPage).toHaveBeenCalledWith(2) // currentPage 1 + 1
  })

  it('纵向为主 → 转发滚动增量，且不翻页', () => {
    const { goToPage, onPanMove, onVerticalPan } = setup()
    handlers.get('panstart')!(evt(0, 0))
    handlers.get('panmove')!(evt(5, -60))
    handlers.get('panend')!(evt(5, -60, 0.5)) // 速度够快，但纵向不应翻页

    expect(onVerticalPan).toHaveBeenCalled()
    expect(onPanMove).not.toHaveBeenCalled()
    expect(goToPage).not.toHaveBeenCalled()
  })

  it('纵向滚动转发的是增量而非累计值', () => {
    const { onVerticalPan } = setup()
    handlers.get('panstart')!(evt(0, 0))
    handlers.get('panmove')!(evt(0, -20)) // 锁定 y 轴，首帧行程 -20
    handlers.get('panmove')!(evt(0, -50)) // 增量 -30
    handlers.get('panmove')!(evt(0, -60)) // 增量 -10

    // 累计值应为 -60（与最终 deltaY 一致），证明无丢失也无重复计算
    const deltas = onVerticalPan.mock.calls.map(c => c[0])
    expect(deltas).toEqual([-20, -30, -10])
    expect(deltas.reduce((a, b) => a + b, 0)).toBe(-60)
  })

  it('轴一旦锁定不再中途切换', () => {
    const { onPanMove, onVerticalPan } = setup()
    handlers.get('panstart')!(evt(0, 0))
    handlers.get('panmove')!(evt(-40, 2)) // 锁 x
    handlers.get('panmove')!(evt(-45, 90)) // 纵向反超，但轴已锁 x

    expect(onVerticalPan).not.toHaveBeenCalled()
    expect(onPanMove).toHaveBeenCalledTimes(2)
  })

  it('未超过阈值时不锁定轴，也不产生回调', () => {
    const { onPanMove, onVerticalPan } = setup()
    handlers.get('panstart')!(evt(0, 0))
    handlers.get('panmove')!(evt(3, 4)) // 均 < PAN_THRESHOLD_PX(10)

    expect(onPanMove).not.toHaveBeenCalled()
    expect(onVerticalPan).not.toHaveBeenCalled()
  })

  it('每次 panstart 重置轴状态', () => {
    const { onPanMove, onVerticalPan } = setup()
    handlers.get('panstart')!(evt(0, 0))
    handlers.get('panmove')!(evt(0, -40)) // 锁 y
    expect(onVerticalPan).toHaveBeenCalled()

    handlers.get('panstart')!(evt(0, 0)) // 新手势
    handlers.get('panmove')!(evt(-40, 0)) // 应能锁 x
    expect(onPanMove).toHaveBeenCalledWith(-40)
  })
})
