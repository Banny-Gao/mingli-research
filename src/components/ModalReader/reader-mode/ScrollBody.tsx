// src/components/ModalReader/reader-mode/ScrollBody.tsx
import { useRef, useEffect, type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import gsap from 'gsap'
import { markdownComponents } from './markdownComponents'
import { remarkPlugins, rehypePlugins } from './markdownPlugins'
import { saveScroll, loadScroll } from './persistence'

interface ScrollBodyProps {
  bookSlug: string
  modalType: 'interp' | 'skill' | 'source'
  modalKey: string
  annotatedBody: string
  proseClass: string
  scrollRef: React.RefObject<HTMLDivElement | null>
  onScroll?: (scrollTop: number) => void
  className?: string
  children?: ReactNode
  onCenterTap?: () => void
}

const SCROLL_DEBOUNCE_MS = 300

/**
 * ScrollBody: 滚动模式（现状 .modal-body 的行为封装）。
 * 保留原有的 ReactMarkdown 渲染管线，仅增加 scroll 位置持久化。
 */
export function ScrollBody({
  bookSlug,
  modalType,
  modalKey,
  annotatedBody,
  proseClass,
  scrollRef,
  onScroll,
  className,
  children,
  onCenterTap,
}: ScrollBodyProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 恢复滚动位置：仅在章节身份变化时跑（不依赖 annotatedBody 引用，避免父级重渲时强制跳回）
  const chapterKey = `${bookSlug}:${modalType}:${modalKey}`
  const restoredKeyRef = useRef('')
  useEffect(() => {
    const el = scrollRef.current
    if (!el || !annotatedBody) return
    if (restoredKeyRef.current === chapterKey) return
    restoredKeyRef.current = chapterKey
    const saved = loadScroll(bookSlug, modalType, modalKey)
    if (saved > 0) {
      gsap.to(el, { scrollTop: saved, duration: 0.4, ease: 'power2.out', overwrite: 'auto' })
    }
    // 故意省略 scrollRef：ref 对象稳定
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterKey, bookSlug, modalType, modalKey, annotatedBody])

  // 持久化滚动位置
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handler = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        saveScroll(bookSlug, modalType, modalKey, el.scrollTop)
        onScroll?.(el.scrollTop)
      }, SCROLL_DEBOUNCE_MS)
    }
    el.addEventListener('scroll', handler, { passive: true })
    return () => {
      el.removeEventListener('scroll', handler)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    // 故意省略 scrollRef：ref 对象稳定
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookSlug, modalType, modalKey, onScroll])

  return (
    <div className={className} ref={scrollRef}>
      {children ?? (
        <div className={proseClass} onClick={() => onCenterTap?.()}>
          <ReactMarkdown
            remarkPlugins={remarkPlugins}
            rehypePlugins={rehypePlugins}
            components={markdownComponents}
          >
            {annotatedBody}
          </ReactMarkdown>
        </div>
      )}
    </div>
  )
}
