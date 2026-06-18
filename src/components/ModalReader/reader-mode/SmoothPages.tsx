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
  const pendingScrollRef = useRef(false)

  // 共享手势系统：Pan 滑动 + Tap 点击 → goToPage
  usePageGesture({
    containerRef: viewportRef,
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
    </div>
  )
}
