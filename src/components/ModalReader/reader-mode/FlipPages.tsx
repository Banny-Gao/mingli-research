// src/components/ModalReader/reader-mode/FlipPages.tsx
import { useRef, useEffect, forwardRef, useState } from 'react'
import { PageFlip } from 'page-flip'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import Mermaid from '../../Mermaid'
import type { PageRenderProps } from './types'

const PageContent = forwardRef<HTMLDivElement, { md: string; proseClass: string }>((props, ref) => {
  const { md, proseClass } = props
  return (
    <div ref={ref} className={`flip-book-page ${proseClass}`} data-density="soft">
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
  )
})
PageContent.displayName = 'PageContent'

/**
 * FlipPages: 直接使用 StPageFlip 原生库。
 *
 * - useEffect 中 new PageFlip(container, config)
 * - loadFromHtml / updateFromHtml 管理页面内容
 * - flip 事件同步 goToPage
 */
export function FlipPages(
  props: PageRenderProps & { proseClass?: string; chapterKey?: string; onCenterTap?: () => void }
) {
  const { pageMds, currentPage, goToPage, proseClass = '', chapterKey = '', onCenterTap } = props
  const containerRef = useRef<HTMLDivElement>(null)
  const flipRef = useRef<PageFlip | null>(null)
  const currentPageRef = useRef(currentPage)
  useEffect(() => {
    currentPageRef.current = currentPage
  }, [currentPage])
  const [ready, setReady] = useState(false)
  const hasPages = pageMds.length > 0

  // 创建 / 重建 PageFlip 实例
  useEffect(() => {
    const container = containerRef.current
    if (!container || !hasPages) return

    // 如果已有实例且章节没变，仅 update 内容
    if (flipRef.current && ready) {
      requestAnimationFrame(() => {
        const items = container.querySelectorAll('.flip-book-page')
        if (items.length > 0) flipRef.current!.updateFromHTML(items)
      })
      return
    }

    // 新建实例
    const flip = new PageFlip(container, {
      width: container.clientWidth || window.innerWidth,
      height: container.clientHeight || window.innerHeight - 120,
      size: 'fixed',
      showCover: false,
      mobileScrollSupport: false,
      flippingTime: 500,
      startPage: currentPageRef.current,
      drawShadow: true,
      usePortrait: true,
      maxShadowOpacity: 0.5,
      useMouseEvents: true,
      disableFlipByClick: false,
      swipeDistance: 15,
    })

    flipRef.current = flip

    flip.on('flip', (e: any) => {
      goToPage(e.data)
    })

    requestAnimationFrame(() => {
      const items = container.querySelectorAll('.flip-book-page')
      if (items.length > 0) {
        flip.loadFromHTML(items)
        setReady(true)
      }
    })

    return () => {
      flip.destroy()
      flipRef.current = null
      setReady(false)
    }
  }, [hasPages, chapterKey])

  if (pageMds.length === 0) return null

  return (
    <div ref={containerRef} className="flip-stage">
      {pageMds.map((md, i) => (
        <PageContent key={i} md={md} proseClass={proseClass} />
      ))}
      {/* 中区透明层：点击切换 header */}
      <div className="flip-center-zone" onClick={() => onCenterTap?.()} />
    </div>
  )
}
