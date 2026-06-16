import { useEffect, useRef, useState } from 'react'
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
import { LONG_PRESS_MS, FLIP_THRESHOLD_PX, FLIP_RATIO, FLIP_MAX_DURATION_MS } from './constants'
import type { NavigateWithPage, PageSize } from './types'

export interface SmoothBodyProps {
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

export function SmoothBody(props: SmoothBodyProps) {
  const { annotatedBody, proseClass } = props
  const [pageSize, setPageSize] = useState<PageSize>({ width: 0, height: 0 })

  useEffect(() => {
    const update = () => setPageSize({ width: window.innerWidth, height: window.innerHeight })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return (
    <PaginatedLayout
      annotatedBody={annotatedBody}
      proseClass={proseClass}
      readerMode="smooth"
      onNavigate={props.onNavigate}
      bookSlug={props.bookSlug}
      modalType={props.modalType}
      modalKey={props.modalKey}
    >
      {({ pages, subMds, currentPage }) => (
        <SmoothPages
          pages={pages}
          subMds={subMds}
          pageSize={pageSize}
          bookSlug={props.bookSlug}
          modalType={props.modalType}
          modalKey={props.modalKey}
          initialPage={props.initialPage}
          gestureEnabled={props.gestureEnabled}
          onCrossChapter={props.onCrossChapter}
          proseClass={proseClass}
          currentPage={currentPage}
        />
      )}
    </PaginatedLayout>
  )
}

interface SmoothPagesProps {
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
}

function SmoothPages({
  pages, subMds, pageSize, bookSlug, modalType, modalKey,
  initialPage, gestureEnabled, onCrossChapter, proseClass, currentPage,
}: SmoothPagesProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const startTouch = useRef<{ x: number; y: number; t: number } | null>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const target = initialPage ?? loadPage(bookSlug, modalType, modalKey)
    if (target > 0 && pages.length > target) {
      const track = trackRef.current
      if (track) {
        track.style.transition = 'none'
        track.style.transform = `translateX(-${(target * 100) / pages.length}%)`
        requestAnimationFrame(() => {
          if (track) track.style.transition = ''
        })
      }
    }
  }, [bookSlug, modalType, modalKey, initialPage, pages.length])

  useEffect(() => {
    if (currentPage > 0) savePage(bookSlug, modalType, modalKey, currentPage)
  }, [currentPage, bookSlug, modalType, modalKey])

  useEffect(() => {
    if (!gestureEnabled) return
    const track = trackRef.current
    if (!track) return
    const onStart = (e: TouchEvent) => {
      const t = e.touches[0]
      startTouch.current = { x: t.clientX, y: t.clientY, t: Date.now() }
      longPressTimer.current = setTimeout(() => {
        startTouch.current = null
      }, LONG_PRESS_MS)
    }
    const onEnd = (e: TouchEvent) => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current)
      const start = startTouch.current
      startTouch.current = null
      if (!start) return
      const t = e.changedTouches[0]
      const dx = t.clientX - start.x
      const dy = t.clientY - start.y
      const dt = Date.now() - start.t
      if (dt > FLIP_MAX_DURATION_MS) return
      if (Math.abs(dx) < FLIP_THRESHOLD_PX) return
      if (Math.abs(dx) < Math.abs(dy) * FLIP_RATIO) return
      if (dx < 0) {
        if (currentPage < pages.length - 1) {
          // next page handled by transform
        } else {
          onCrossChapter('next')
        }
      } else {
        if (currentPage > 0) {
          // prev page handled by transform
        } else {
          onCrossChapter('prev')
        }
      }
    }
    track.addEventListener('touchstart', onStart, { passive: true })
    track.addEventListener('touchend', onEnd)
    return () => {
      track.removeEventListener('touchstart', onStart)
      track.removeEventListener('touchend', onEnd)
      if (longPressTimer.current) clearTimeout(longPressTimer.current)
    }
  }, [gestureEnabled, currentPage, pages.length, onCrossChapter])

  if (pageSize.width === 0 || pages.length === 0) {
    return <div ref={trackRef} className="smooth-track" />
  }

  const items: { md: string; pageIdx: number }[] = []
  for (let i = 0; i < pages.length; i++) {
    items.push({ md: subMds[i] ?? '', pageIdx: i })
  }

  return (
    <div className="smooth-viewport">
      <div
        ref={trackRef}
        className="smooth-track"
        style={{
          width: `${pages.length * 100}%`,
          transform: `translateX(-${(currentPage * 100) / pages.length}%)`,
          transition: 'transform 300ms ease',
        }}
      >
        {items.map(({ md, pageIdx }) => (
          <div
            key={pageIdx}
            className="smooth-page"
            data-page={pageIdx}
            style={{ width: `${100 / pages.length}%` }}
          >
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
                {md}
              </ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
