// src/components/ModalReader/reader-mode/FlipPages.tsx
import { useRef, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { PageFlip } from 'page-flip'
import { markdownComponents } from './markdownComponents'
import { remarkPlugins, rehypePlugins } from './markdownPlugins'
import { usePageGesture } from './usePageGesture'
import type { PageRenderProps } from './types'

function PageContent({ md, proseClass }: { md: string; proseClass: string }) {
  return (
    <div className={`flip-book-page ${proseClass}`} data-density="soft">
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={markdownComponents}
      >
        {md}
      </ReactMarkdown>
    </div>
  )
}

/**
 * FlipPages: page-flip 3D 卷页渲染。
 *
 * 架构：usePageGesture（共享手势）→ goToPage → currentPage 变化
 * → effect 调 flip.flipNext / flipPrev / turnToPage 驱动动画。
 * 不监听 flip.on('flip')——page-flip 是被动执行者，React state 是唯一真相源。
 */
export function FlipPages(
  props: PageRenderProps & { proseClass?: string; chapterKey?: string; onCenterTap?: () => void }
) {
  const {
    pageMds,
    currentPage,
    goToPage,
    proseClass = '',
    chapterKey = '',
    onCenterTap,
    pageSize,
  } = props
  const containerRef = useRef<HTMLDivElement>(null)
  const gestureRef = useRef<HTMLDivElement>(null)
  const flipRef = useRef<PageFlip | null>(null)
  const [ready, setReady] = useState(false)
  const hasPages = pageMds.length > 0

  // 共享手势系统：Pan 滑动 + Tap 点击 → goToPage
  // 绑定在独立手势层上，避免 page-flip 内部元素拦截触摸事件
  usePageGesture({
    containerRef: gestureRef,
    currentPage,
    totalPages: pageMds.length,
    goToPage,
    onCenterTap,
  })

  // 跟踪上一页，判断翻页方向
  const prevPageRef = useRef(currentPage)
  // 防止 StrictMode 双次 effect 导致 flipNext/Prev 重复调用（page-flip 非幂等）
  const handledPageRef = useRef(currentPage)

  // currentPage 变化 → 驱动 page-flip 动画
  useEffect(() => {
    const flip = flipRef.current
    if (!flip || !ready) {
      prevPageRef.current = currentPage
      handledPageRef.current = currentPage
      return
    }
    // 已处理过该 currentPage 变化（StrictMode 防御）
    if (handledPageRef.current === currentPage) {
      console.log('[FlipPages] StrictMode skip — already handled currentPage=', currentPage)
      return
    }
    handledPageRef.current = currentPage

    const prev = prevPageRef.current
    prevPageRef.current = currentPage

    if (currentPage === prev + 1) {
      console.log('[FlipPages] currentPage', prev, '→', currentPage, '→ flipNext()')
      flip.flipNext()
    } else if (currentPage === prev - 1) {
      console.log('[FlipPages] currentPage', prev, '→', currentPage, '→ flipPrev()')
      flip.flipPrev()
    } else if (currentPage !== prev) {
      console.log('[FlipPages] currentPage', prev, '→', currentPage, '→ turnToPage()')
      flip.turnToPage(currentPage)
    }
  }, [currentPage, ready])

  // 创建 / 重建 PageFlip 实例。
  // 只在章节切换或首次有页面时重建。不依赖 pageSize（fixed 模式无需随 resize 重建）。
  useEffect(() => {
    const container = containerRef.current
    if (!container || !hasPages) return

    // 已有实例且章节没变 → update 内容
    if (flipRef.current && ready) {
      requestAnimationFrame(() => {
        const flip = flipRef.current
        if (!flip) return
        const items = container.querySelectorAll('.flip-book-page')
        if (items.length > 0) flip.updateFromHtml(items)
      })
      return
    }

    const width = pageSize.width || container.clientWidth || 1
    const height = pageSize.height || container.clientHeight || 1

    const flip = new PageFlip(container, {
      width,
      height,
      size: 'fixed',
      showCover: false,
      mobileScrollSupport: false,
      flippingTime: 500,
      startPage: currentPage,
      drawShadow: true,
      usePortrait: true,
      maxShadowOpacity: 0.5,
      useMouseEvents: false,
      disableFlipByClick: false,
      swipeDistance: 15,
    })

    flipRef.current = flip

    const rafId = requestAnimationFrame(() => {
      if (flipRef.current !== flip) return
      const items = container.querySelectorAll('.flip-book-page')
      if (items.length > 0) {
        flip.loadFromHTML(items)
        setReady(true)
      }
    })

    return () => {
      cancelAnimationFrame(rafId)
      const prev = flipRef.current
      if (prev) {
        // page-flip 的 loadFromHTML 把元素移入 distElement；
        // destroy 前先搬回 container，避免 React 元素丢失。
        try {
          const rescued = container.querySelectorAll('.flip-book-page')
          rescued.forEach(el => {
            if (el.parentElement !== container) container.appendChild(el)
          })
        } catch {
          /* DOM 操作极少失败 */
        }
        try {
          prev.clear()
        } catch {
          /* 忽略 */
        }
        try {
          prev.destroy()
        } catch {
          /* 忽略 */
        }
      }
      if (flipRef.current === prev) {
        flipRef.current = null
      }
      setReady(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPages, chapterKey])

  if (pageMds.length === 0) return null

  return (
    <div ref={containerRef} className="flip-stage">
      {pageMds.map((md, i) => (
        <PageContent key={i} md={md} proseClass={proseClass} />
      ))}
      {/* 手势层：覆盖在 page-flip 内部元素之上，确保 Hammer.js 能收到触摸事件 */}
      <div ref={gestureRef} className="flip-gesture-layer" />
    </div>
  )
}
