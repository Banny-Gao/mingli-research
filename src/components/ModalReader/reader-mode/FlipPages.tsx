// src/components/ModalReader/reader-mode/FlipPages.tsx
import { useRef, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { PageFlip, type FlipEventData } from 'page-flip'
import { markdownComponents } from './markdownComponents'
import type { PageRenderProps } from './types'

function PageContent({ md, proseClass }: { md: string; proseClass: string }) {
  return (
    <div className={`flip-book-page ${proseClass}`} data-density="soft">
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
  )
}

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
  const { pageMds, currentPage, goToPage, proseClass = '', chapterKey = '', onCenterTap, pageSize } = props
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
        const flip = flipRef.current
        if (!flip) return
        const items = container.querySelectorAll('.flip-book-page')
        if (items.length > 0) flip.updateFromHTML(items)
      })
      return
    }

    // 用 measure 阶段 ResizeObserver 测量过的 pageSize（避免初次挂载时容器为 0 退化到 window 宽度）
    const width = pageSize.width || container.clientWidth || 1
    const height = pageSize.height || container.clientHeight || 1

    // 新建实例
    const flip = new PageFlip(container, {
      width,
      height,
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

    flip.on('flip', (e: FlipEventData) => {
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
    // 故意省略 ready：ready 变化触发 setReady 会循环重建 PageFlip
    // setReady 来自 useState（应豁免但 line 64 的 if 分支被 ESLint 当作引用）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPages, chapterKey, pageSize.width, pageSize.height, goToPage])

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
