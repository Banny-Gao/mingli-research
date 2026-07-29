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
  /** 纵向滑动增量：用于滚动超出页高的 block（手势层 touch-action: none 吞掉了原生滚动） */
  onVerticalPan?: (deltaY: number) => void
}

interface GestureCallbacks {
  currentPage: number
  goToPage: (page: number) => void
  onCenterTap?: () => void
  onPanMove?: (deltaX: number) => void
  onVerticalPan?: (deltaY: number) => void
}

/** 触发翻页的速度阈值（velocityX 绝对值）。不同设备 velocityX 数值差异大，
 *  方向判定改用累计位移 cumulativeDeltaX（更可靠） */
const PAN_VELOCITY_THRESHOLD = 0.3
/** 触发翻页的位移比例（累计 deltaX / 页面宽度） */
const PAN_DISTANCE_RATIO = 0.25
/** Tap 点击区域：将容器宽三等分（左/中/右） */
const TAP_ZONE_DIVISOR = 3
/** Pan gesture 触发阈值（px） */
const PAN_THRESHOLD_PX = 10
/** "向右滑"对应的 page 方向（-1 = 上一页） */
const PANNED_RIGHT = -1
/** "向左滑"对应的 page 方向（+1 = 下一页） */
const PANNED_LEFT = 1

/**
 * 共享手势系统：Hammer.js Pan + Tap。
 * - Pan（滑动）：速度够快按方向翻一页，速度慢吸附到最近页
 * - Tap（点击）：左 1/3 上一页 / 中 1/3 toggle header / 右 1/3 下一页
 *
 * 通过 ref 持有最新回调，避免 hammer 实例因 effect 依赖变化而频繁重建。
 * 4 个回调合并为单个 object ref + 单 effect 同步。
 */
export function usePageGesture(opts: UsePageGestureOptions) {
  const { containerRef, totalPages } = opts

  // 合并 4 个回调为单个 object ref + 单 effect 同步（避免重复 effect 调度）。
  const callbacksRef = useRef<GestureCallbacks>({
    currentPage: opts.currentPage,
    goToPage: opts.goToPage,
    onCenterTap: opts.onCenterTap,
    onPanMove: opts.onPanMove,
    onVerticalPan: opts.onVerticalPan,
  })

  useEffect(() => {
    callbacksRef.current = {
      currentPage: opts.currentPage,
      goToPage: opts.goToPage,
      onCenterTap: opts.onCenterTap,
      onPanMove: opts.onPanMove,
      onVerticalPan: opts.onVerticalPan,
    }
  }, [
    opts.currentPage,
    opts.goToPage,
    opts.onCenterTap,
    opts.onPanMove,
    opts.onVerticalPan,
  ])

  useEffect(() => {
    const el = containerRef.current
    if (!el || totalPages <= 0) return

    const hammer = new Hammer.Manager(el, { touchAction: 'none' })

    const pan = new Hammer.Pan({
      direction: Hammer.DIRECTION_ALL,
      threshold: PAN_THRESHOLD_PX,
    })
    hammer.add(pan)

    const tap = new Hammer.Tap({ event: 'tap', taps: 1 })
    hammer.add(tap)

    // Pan 和 Tap 互斥：滑动中不触发 tap
    pan.recognizeWith(tap)

    let cumulativeDeltaX = 0
    // 每次 pan 的主导轴。手势层 touch-action: none 吞掉了原生纵向滚动，
    // 故纵向必须由此处手动转发给页面容器，否则超出页高的 block 无法阅读。
    let axis: 'none' | 'x' | 'y' = 'none'
    let lastDeltaY = 0

    hammer.on('panstart', () => {
      cumulativeDeltaX = 0
      axis = 'none'
      lastDeltaY = 0
    })

    hammer.on('panmove', e => {
      // 首次超过阈值时锁定主导轴，避免斜向滑动时翻页与滚动互相抢夺
      if (axis === 'none') {
        const absX = Math.abs(e.deltaX)
        const absY = Math.abs(e.deltaY)
        if (absX < PAN_THRESHOLD_PX && absY < PAN_THRESHOLD_PX) return
        axis = absX > absY ? 'x' : 'y'
        // 不在此设 lastDeltaY：锁轴帧的位移是真实手指行程，
        // 保持基线 0 让它随下方逻辑一起发出，避免丢掉首帧滚动量
      }

      if (axis === 'x') {
        cumulativeDeltaX = e.deltaX
        callbacksRef.current.onPanMove?.(e.deltaX)
      } else {
        // 转发增量（非累计值），由消费者叠加到 scrollTop
        callbacksRef.current.onVerticalPan?.(e.deltaY - lastDeltaY)
        lastDeltaY = e.deltaY
      }
    })

    hammer.on('panend', e => {
      // 纵向滑动不触发翻页
      if (axis === 'y') return

      const pageWidth = el.clientWidth
      if (pageWidth <= 0) return

      const absDelta = Math.abs(cumulativeDeltaX)
      // 快滑 或 滑过 25% 页面宽度 → 翻页。
      // 方向按累计位移判断（比 e.velocityX 符号更可靠，后者不同设备差异大）
      if (
        Math.abs(e.velocityX) > PAN_VELOCITY_THRESHOLD ||
        absDelta > pageWidth * PAN_DISTANCE_RATIO
      ) {
        const dir = cumulativeDeltaX > 0 ? PANNED_RIGHT : PANNED_LEFT
        const target = callbacksRef.current.currentPage + dir
        if (target >= 0 && target < totalPages) {
          callbacksRef.current.goToPage(target)
        }
      }
    })

    hammer.on('tap', e => {
      const rect = el.getBoundingClientRect()
      const x = e.center.x - rect.left
      const zoneW = rect.width / TAP_ZONE_DIVISOR
      if (x < zoneW) {
        const target = Math.max(0, callbacksRef.current.currentPage - 1)
        callbacksRef.current.goToPage(target)
      } else if (x > rect.width - zoneW) {
        const target = Math.min(callbacksRef.current.currentPage + 1, totalPages - 1)
        callbacksRef.current.goToPage(target)
      } else {
        callbacksRef.current.onCenterTap?.()
      }
    })

    return () => hammer.destroy()
  }, [containerRef, totalPages])
}
