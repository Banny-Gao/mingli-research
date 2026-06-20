// src/components/ModalReader/reader-mode/SmoothPages.tsx
import { useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import gsap from 'gsap'
import { markdownComponents } from './markdownComponents'
import { remarkPlugins, rehypePlugins } from './markdownPlugins'
import { usePageGesture } from './usePageGesture'
import type { PageRenderProps } from './types'

export function SmoothPages(
  props: PageRenderProps & { proseClass?: string; onCenterTap?: () => void }
) {
  const { pageMds, currentPage, goToPage, proseClass, onCenterTap } = props
  const viewportRef = useRef<HTMLDivElement>(null)
  const gestureRef = useRef<HTMLDivElement>(null)
  const pendingScrollRef = useRef(false)

  // 共享手势系统：Pan 滑动 + Tap 点击 → goToPage
  // 绑在独立手势层（.smooth-gesture-layer）上，避免 .smooth-page 的
  // touch-action: pan-y 覆盖 hammer 的 touch-action: none（iOS Safari /
  // Android WebView 决策 touch 行为时，touch path 上第一个非 auto 的
  // touch-action 祖先会被优先采用，gesture-layer 离手指更近因此胜出）。
  // onPanMove 仍写 viewportRef.current.scrollLeft（跟手目标仍是滚动容器）。
  usePageGesture({
    containerRef: gestureRef,
    currentPage,
    totalPages: pageMds.length,
    goToPage,
    onCenterTap,
    onPanMove: deltaX => {
      const vp = viewportRef.current
      if (!vp) return
      vp.scrollLeft = currentPage * vp.clientWidth - deltaX
    },
  })

  // goToPage 被调用时（手势/点击），GSAP 滚到目标页
  useEffect(() => {
    const vp = viewportRef.current
    if (!vp || pageMds.length === 0 || currentPage >= pageMds.length) return
    const expectedLeft = currentPage * vp.clientWidth
    if (Math.abs(vp.scrollLeft - expectedLeft) > 2) {
      pendingScrollRef.current = true
      gsap.to(vp, {
        scrollLeft: expectedLeft,
        duration: 0.35,
        ease: 'power2.out',
        onComplete: () => {
          pendingScrollRef.current = false
        },
      })
    }
  }, [currentPage, pageMds.length])

  // 初始化恢复位置
  useEffect(() => {
    if (currentPage > 0 && pageMds.length > currentPage) {
      const vp = viewportRef.current
      if (vp) vp.scrollLeft = currentPage * vp.clientWidth
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (pageMds.length === 0) return null

  return (
    <div ref={viewportRef} className="smooth-viewport">
      <div className="smooth-track">
        {pageMds.map((md, i) => (
          <div key={i} className={`smooth-page ${proseClass || ''}`} data-page={i}>
            <ReactMarkdown
              remarkPlugins={remarkPlugins}
              rehypePlugins={rehypePlugins}
              components={markdownComponents}
            >
              {md}
            </ReactMarkdown>
          </div>
        ))}
      </div>
      {/* 手势层：覆盖在 .smooth-track 之上（z-index 20 > 默认），
          确保 Hammer.js 能收到触摸事件。架构与 .flip-gesture-layer 对称。 */}
      <div ref={gestureRef} className="smooth-gesture-layer" />
    </div>
  )
}
