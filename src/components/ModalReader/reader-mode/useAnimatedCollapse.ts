// src/components/ModalReader/reader-mode/useAnimatedCollapse.ts
import { useEffect, useRef, type RefObject } from 'react'
import gsap from 'gsap'

interface UseAnimatedCollapseOptions {
  /** refs to elements that animate height + opacity together */
  refs: RefObject<HTMLElement | null>[]
  /** whether the elements should be visible (expanded) or collapsed (height 0) */
  visible: boolean
  /** expanded duration in seconds */
  expandDuration?: number
  /** collapsed duration in seconds */
  collapseDuration?: number
}

/** GSAP 动画期间临时设置 will-change（动画结束后清除，避免常驻 GPU 合成层）。 */
const setWillChange = (targets: HTMLElement[], value: string) =>
  targets.forEach(t => {
    t.style.willChange = value
  })

const clearWillChange = (targets: HTMLElement[]) =>
  targets.forEach(t => {
    t.style.willChange = ''
  })

/**
 * Header / related-section 缓动显隐动画。
 *
 * - 首次挂载不动画（默认已可见）
 * - visible 变化时：killTweensOf → 设置 will-change（动画结束后清除）→ fromTo/to
 * - 空 refs（全部 null）安全跳过
 * - 卸载时 GSAP 自动 kill active tweens（killTweensOf 也会清理）
 */
let catchedVisible: boolean
export function useAnimatedCollapse({
  refs,
  visible,
  expandDuration = 0.3,
  collapseDuration = 0.25,
}: UseAnimatedCollapseOptions) {
  const firstMountRef = useRef(true)

  useEffect(() => {
    if (firstMountRef.current) {
      firstMountRef.current = false
      return
    }
    const targets = refs.map(r => r.current).filter((t): t is HTMLElement => t !== null)
    if (targets.length === 0) return

    setWillChange(targets, 'height, opacity')
    gsap.killTweensOf(targets)
    if (catchedVisible === visible) return
    
    if (visible) {
      gsap.fromTo(
        targets,
        { height: 0, opacity: 0 },
        {
          height: 'auto',
          opacity: 1,
          duration: expandDuration,
          ease: 'power2.out',
          clearProps: 'height',
          onComplete: () => clearWillChange(targets),
        }
      )
    } else {
      gsap.to(targets, {
        height: 0,
        opacity: 0,
        duration: collapseDuration,
        ease: 'power2.in',
        onComplete: () => clearWillChange(targets),
      })
    }

    catchedVisible = visible
  }, [visible, refs, expandDuration, collapseDuration])
}
