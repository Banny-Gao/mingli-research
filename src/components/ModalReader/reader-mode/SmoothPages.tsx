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
import Mermaid from '../../Mermaid'
import type { PageRenderProps } from './types'

export function SmoothPages(
  props: PageRenderProps & { proseClass?: string; onCenterTap?: () => void }
) {
  const { pageMds, currentPage, goToPage, proseClass, onCenterTap } = props
  const viewportRef = useRef<HTMLDivElement>(null)
  const pendingScrollRef = useRef(false)

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
  }, [])

  // hammerjs 手势：一次滑动严格一页
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
      initialScroll = currentPage * vp.clientWidth
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
        const target = currentPage + dir
        if (target >= 0 && target < pageMds.length) goToPage(target)
        return
      }

      // 速度慢：吸附到最近页
      const nearestPage = Math.round(vp.scrollLeft / pageWidth)
      const clamped = Math.max(0, Math.min(nearestPage, pageMds.length - 1))
      if (clamped !== currentPage) {
        goToPage(clamped)
      } else {
        gsap.to(vp, { scrollLeft: currentPage * pageWidth, duration: 0.2, ease: 'power2.out' })
      }
    })

    return () => hammer.destroy()
  }, [currentPage, goToPage, pageMds.length])

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
              components={{
                code({ className, children: codeChildren, ...codeProps }) {
                  const isMermaid = /\blanguage-mermaid\b/.test(className || '')
                  const codeText = String(codeChildren).replace(/\n$/, '')
                  if (isMermaid) return <Mermaid>{codeText}</Mermaid>
                  return (
                    <code className={className} {...codeProps}>
                      {codeChildren}
                    </code>
                  )
                },
              }}
            >
              {md}
            </ReactMarkdown>
          </div>
        ))}
      </div>
    </div>
  )
}
