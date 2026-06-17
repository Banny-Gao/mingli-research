// src/components/ModalReader/reader-mode/ScrollBody.tsx
import { useRef, useEffect, type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import gsap from 'gsap'
import Mermaid from '../../Mermaid'
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
}: ScrollBodyProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 恢复滚动位置
  useEffect(() => {
    const el = scrollRef.current
    if (!el || !annotatedBody) return
    const saved = loadScroll(bookSlug, modalType, modalKey)
    if (saved > 0) {
      gsap.to(el, { scrollTop: saved, duration: 0.4, ease: 'power2.out', overwrite: 'auto' })
    }
  }, [bookSlug, modalType, modalKey, annotatedBody])

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
  }, [bookSlug, modalType, modalKey, onScroll])

  return (
    <div className={className} ref={scrollRef}>
      {children ?? (
        <div className={proseClass}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[
              rehypeRaw,
              rehypeSlug,
              [rehypeHighlight, { ignoreMissing: true, plainText: ['mermaid'] }],
              rehypeAutolinkHeadings,
            ]}
            components={{
              code({ className: codeClass, children: codeChildren, ...props }) {
                const isMermaid = /\blanguage-mermaid\b/.test(codeClass || '')
                const codeText = String(codeChildren).replace(/\n$/, '')
                if (isMermaid) return <Mermaid>{codeText}</Mermaid>
                return (
                  <code className={codeClass} {...props}>
                    {codeChildren}
                  </code>
                )
              },
            }}
          >
            {annotatedBody}
          </ReactMarkdown>
        </div>
      )}
    </div>
  )
}
