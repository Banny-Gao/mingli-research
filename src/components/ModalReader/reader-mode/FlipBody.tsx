import { useEffect, useRef, useState } from 'react'
import { PageFlip } from 'page-flip'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import Mermaid from '../../Mermaid'
import { PaginatedLayout } from './PaginatedLayout'
import { usePaginatedBlocks } from './usePaginatedBlocks'
import { savePage, loadPage } from './persistence'
import type { NavigateWithPage, PageSize } from './types'

export interface FlipBodyProps {
  bookSlug: string
  modalType: 'interp' | 'skill' | 'source'
  modalKey: string
  annotatedBody: string
  proseClass: string
  initialPage?: number
  onNavigate: NavigateWithPage
  onCrossChapter: (dir: 'prev' | 'next') => void
  chapters: Array<{ name: string }>
  gestureEnabled: boolean
  measureContainerRef: React.RefObject<HTMLDivElement | null>
}

export function FlipBody(props: FlipBodyProps) {
  const { annotatedBody, proseClass, bookSlug, modalType, modalKey, initialPage, gestureEnabled } = props
  const [pageSize, setPageSize] = useState<PageSize>({ width: 0, height: 0 })
  const [flipError, setFlipError] = useState(false)

  useEffect(() => {
    const update = () => setPageSize({ width: window.innerWidth, height: window.innerHeight })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  if (flipError) {
    return (
      <div className="modal-body">
        <div className="loading-center">仿真翻页加载失败,请切换为平滑模式</div>
      </div>
    )
  }

  return (
    <PaginatedLayout
      annotatedBody={annotatedBody}
      proseClass={proseClass}
      readerMode="flip"
      onNavigate={props.onNavigate}
      bookSlug={bookSlug}
      modalType={modalType}
      modalKey={modalKey}
    >
      {({ pages, subMds, currentPage }) => (
        <FlipPages
          pages={pages}
          subMds={subMds}
          pageSize={pageSize}
          bookSlug={bookSlug}
          modalType={modalType}
          modalKey={modalKey}
          initialPage={initialPage}
          gestureEnabled={gestureEnabled}
          onCrossChapter={props.onCrossChapter}
          proseClass={proseClass}
          currentPage={currentPage}
          onFlipError={() => setFlipError(true)}
        />
      )}
    </PaginatedLayout>
  )
}

interface FlipPagesProps {
  pages: ReturnType<typeof usePaginatedBlocks>['pages']
  subMds: string[]
  pageSize: PageSize
  bookSlug: string
  modalType: 'interp' | 'skill' | 'source'
  modalKey: string
  initialPage?: number
  gestureEnabled: boolean
  onCrossChapter: (dir: 'prev' | 'next') => void
  proseClass: string
  currentPage: number
  onFlipError: () => void
}

function FlipPages({
  pages, subMds, pageSize, bookSlug, modalType, modalKey,
  initialPage, proseClass, currentPage, onFlipError,
}: FlipPagesProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const flipRef = useRef<PageFlip | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || pages.length === 0 || pageSize.width === 0) return

    try {
      const flip = new PageFlip(container, {
        width: pageSize.width,
        height: pageSize.height,
        size: 'fixed',
        showCover: false,
        mobileScrollSupport: false,
        drawShadow: true,
      })
      const pageEls = Array.from(container.querySelectorAll<HTMLElement>('.flip-page'))
      if (pageEls.length > 0) flip.loadFromHTML(pageEls)
      flip.on('flip', (e: { data: number }) => {
        if (e.data === pages.length - 1) {
          // 末页翻到下篇 - 留给 crossChapter 决策
        }
      })
      flipRef.current = flip

      const target = initialPage ?? loadPage(bookSlug, modalType, modalKey)
      if (target > 0 && target < pages.length) {
        try { flip.turnToPage(target) } catch { /* ignore */ }
      }

      return () => {
        try { flip.destroy() } catch { /* ignore */ }
        flipRef.current = null
      }
    } catch (e) {
      console.warn('page-flip init failed, falling back', e)
      onFlipError()
    }
  }, [pages.length, pageSize.width, pageSize.height])

  useEffect(() => {
    if (currentPage > 0) savePage(bookSlug, modalType, modalKey, currentPage)
  }, [currentPage, bookSlug, modalType, modalKey])

  if (pageSize.width === 0 || pages.length === 0) {
    return <div ref={containerRef} className="flip-container" />
  }

  return (
    <div ref={containerRef} className="flip-container">
      {pages.map((_, i) => (
        <div key={i} className="flip-page" data-page={i}>
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
              {subMds[i] ?? ''}
            </ReactMarkdown>
          </div>
        </div>
      ))}
    </div>
  )
}
