import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import Mermaid from '../../Mermaid'
import { saveScroll, loadScroll } from './persistence'
import { SCROLL_DEBOUNCE_MS } from './constants'

export interface ScrollBodyProps {
  bookSlug: string
  modalType: 'interp' | 'skill' | 'source'
  modalKey: string
  annotatedBody: string
  proseClass: string
  measureContainerRef: React.RefObject<HTMLDivElement | null>
}

export function ScrollBody({
  bookSlug, modalType, modalKey, annotatedBody, proseClass,
}: ScrollBodyProps) {
  const ref = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const top = loadScroll(bookSlug, modalType, modalKey)
    ref.current?.scrollTo({ top, behavior: 'auto' })
  }, [bookSlug, modalType, modalKey])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onScroll = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        saveScroll(bookSlug, modalType, modalKey, el.scrollTop)
      }, SCROLL_DEBOUNCE_MS)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', onScroll)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [bookSlug, modalType, modalKey])

  return (
    <div className="modal-body" ref={ref}>
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
            code({ className, children, ...props }) {
              const isMermaid = /\blanguage-mermaid\b/.test(className || '')
              const codeText = String(children).replace(/\n$/, '')
              if (isMermaid) return <Mermaid>{codeText}</Mermaid>
              return <code className={className} {...props}>{children}</code>
            },
          }}
        >
          {annotatedBody}
        </ReactMarkdown>
      </div>
    </div>
  )
}
