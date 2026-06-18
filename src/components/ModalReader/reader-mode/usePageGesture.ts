// src/components/ModalReader/reader-mode/usePageGesture.ts
import { useEffect, useRef } from 'react'
import Hammer from 'hammerjs'

interface UsePageGestureOptions {
  /** 手势绑定的容器元素 */
  containerRef: React.RefObject<HTMLElement | null>
  /** 当前页码 */
  currentPage: number
  /** 总页数 */
  totalPages: number
  /** 跳转到指定页 */
  goToPage: (page: number) => void
  /** 点击中间区域回调（切换 header） */
  onCenterTap?: () => void
  /** 滑动中的位移量（仅 SmoothPages 用于实时跟手滚动） */
  onPanMove?: (deltaX: number) => void
}

/**
 * 共享手势系统：Hammer.js Pan + Tap。
 * - Pan（滑动）：速度够快按方向翻一页，速度慢吸附到最近页
 * - Tap（点击）：左 1/3 上一页 / 中 1/3 toggle header / 右 1/3 下一页
 *
 * 通过 ref 持有最新回调，避免 hammer 实例因 effect 依赖变化而频繁重建。
 */
export function usePageGesture(opts: UsePageGestureOptions) {
  const { containerRef, totalPages, goToPage, onCenterTap, onPanMove } = opts

  const currentPageRef = useRef(opts.currentPage)
  const goToPageRef = useRef(goToPage)
  const onCenterTapRef = useRef(onCenterTap)
  const onPanMoveRef = useRef(onPanMove)

  useEffect(() => {
    currentPageRef.current = opts.currentPage
  }, [opts.currentPage])
  useEffect(() => {
    goToPageRef.current = goToPage
  }, [goToPage])
  useEffect(() => {
    onCenterTapRef.current = onCenterTap
  }, [onCenterTap])
  useEffect(() => {
    onPanMoveRef.current = onPanMove
  }, [onPanMove])

  useEffect(() => {
    const el = containerRef.current
    if (!el || totalPages <= 0) return

    const hammer = new Hammer.Manager(el, { touchAction: 'none' })

    const pan = new Hammer.Pan({ direction: Hammer.DIRECTION_HORIZONTAL, threshold: 10 })
    hammer.add(pan)

    const tap = new Hammer.Tap({ event: 'tap', taps: 1 })
    hammer.add(tap)

    // Pan 和 Tap 互斥：滑动中不触发 tap
    pan.recognizeWith(tap)

    let cumulativeDeltaX = 0

    hammer.on('panstart', () => {
      cumulativeDeltaX = 0
    })

    hammer.on('panmove', e => {
      cumulativeDeltaX = e.deltaX
      onPanMoveRef.current?.(e.deltaX)
    })

    hammer.on('panend', e => {
      const pageWidth = el.clientWidth
      if (pageWidth <= 0) return

      const absDelta = Math.abs(cumulativeDeltaX)
      // 快滑 或 滑过 25% 页面宽度 → 翻页。
      // 方向按累计位移判断（比 e.velocityX 符号更可靠，后者不同设备差异大）
      if (Math.abs(e.velocityX) > 0.3 || absDelta > pageWidth * 0.25) {
        const dir = cumulativeDeltaX > 0 ? -1 : 1
        const target = currentPageRef.current + dir
        if (target >= 0 && target < totalPages) {
          goToPageRef.current(target)
        }
      }
    })

    hammer.on('tap', e => {
      const rect = el.getBoundingClientRect()
      const x = e.center.x - rect.left
      const zoneW = rect.width / 3
      console.log(
        '[usePageGesture] tap x=',
        Math.round(x),
        'rectW=',
        Math.round(rect.width),
        'zoneW=',
        Math.round(zoneW),
        'curPage=',
        currentPageRef.current,
        'x<zoneW=',
        x < zoneW,
        'x>rect-zoneW=',
        x > rect.width - zoneW
      )
      if (x < zoneW) {
        const target = Math.max(0, currentPageRef.current - 1)
        console.log('[usePageGesture] tap LEFT → goToPage(', target, ')')
        goToPageRef.current(target)
      } else if (x > rect.width - zoneW) {
        const target = Math.min(currentPageRef.current + 1, totalPages - 1)
        console.log('[usePageGesture] tap RIGHT → goToPage(', target, ')')
        goToPageRef.current(target)
      } else {
        console.log('[usePageGesture] tap CENTER → onCenterTap')
        onCenterTapRef.current?.()
      }
    })

    return () => hammer.destroy()
  }, [containerRef, totalPages])
}
