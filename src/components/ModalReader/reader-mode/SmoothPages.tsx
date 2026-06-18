// src/components/ModalReader/reader-mode/SmoothPages.tsx
import { useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import gsap from 'gsap'
import Hammer from 'hammerjs'
import { markdownComponents } from './markdownComponents'
import type { PageRenderProps } from './types'

export function SmoothPages(
  props: PageRenderProps & { proseClass?: string; onCenterTap?: () => void }
) {
  const { pageMds, currentPage, goToPage, proseClass, onCenterTap } = props
  const viewportRef = useRef<HTMLDivElement>(null)
  const pendingScrollRef = useRef(false)
  // 持有最新 currentPage / goToPage 引用，避免 hammerjs effect 因 currentPage 变化而 destroy+重建
  const currentPageRef = useRef(currentPage)
  const goToPageRef = useRef(goToPage)
  useEffect(() => {
    currentPageRef.current = currentPage
  }, [currentPage])
  useEffect(() => {
    goToPageRef.current = goToPage
  }, [goToPage])

  // goToPage 被调用时（点击/手势），GSAP 滚到目标页
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
    // 故意只跑一次（挂载时恢复位置），不依赖 currentPage / pageMds.length
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // hammerjs 手势：一次滑动严格一页。effect 不依赖 currentPage，
  // 避免每次翻页都 destroy+重建 hammer 实例导致快速连续滑动丢失事件。
  useEffect(() => {
    const vp = viewportRef.current
    if (!vp) return

    const hammer = new Hammer.Manager(vp, {
      touchAction: 'none',
    })

    const pan = new Hammer.Pan({ direction: Hammer.DIRECTION_HORIZONTAL, threshold: 10 })
    hammer.add(pan)

    let initialScroll = 0

    hammer.on('panstart', () => {
      gsap.killTweensOf(vp, 'scrollLeft')
      initialScroll = currentPageRef.current * vp.clientWidth
      vp.scrollLeft = initialScroll
    })

    hammer.on('panmove', e => {
      vp.scrollLeft = initialScroll - e.deltaX
    })

    hammer.on('panend', e => {
      const pageWidth = vp.clientWidth
      if (pageWidth <= 0) return

      // 速度够快：按方向翻一页
      if (Math.abs(e.velocityX) > 0.3) {
        const dir = e.velocityX < 0 ? 1 : -1
        const target = currentPageRef.current + dir
        if (target >= 0 && target < pageMds.length) goToPageRef.current(target)
        return
      }

      // 速度慢：吸附到最近页
      const nearestPage = Math.round(vp.scrollLeft / pageWidth)
      const clamped = Math.max(0, Math.min(nearestPage, pageMds.length - 1))
      if (clamped !== currentPageRef.current) {
        goToPageRef.current(clamped)
      } else {
        gsap.to(vp, { scrollLeft: currentPageRef.current * pageWidth, duration: 0.2, ease: 'power2.out' })
      }
    })

    return () => hammer.destroy()
    // 故意省略 currentPage / goToPage：通过 currentPageRef / goToPageRef 读最新值，
    // 避免每次翻页 destroy+重建 hammer 导致快速连续滑动丢失事件
  }, [pageMds.length])

  if (pageMds.length === 0) return null

  return (
    <div
      ref={viewportRef}
      className="smooth-viewport"
      onClick={e => {
        const vp = viewportRef.current
        if (!vp) return
        const rect = vp.getBoundingClientRect()
        const x = e.clientX - rect.left
        const zoneW = rect.width / 3
        if (x < zoneW) goToPage(Math.max(0, currentPage - 1))
        else if (x > rect.width - zoneW) goToPage(Math.min(currentPage + 1, pageMds.length - 1))
        else onCenterTap?.()
      }}
    >
      <div className="smooth-track">
        {pageMds.map((md, i) => (
          <div key={i} className={`smooth-page ${proseClass || ''}`} data-page={i}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[
                rehypeRaw,
                rehypeSlug,
                [rehypeHighlight, { ignoreMissing: true, plainText: ['mermaid'] }],
                rehypeAutolinkHeadings,
              ]}
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
