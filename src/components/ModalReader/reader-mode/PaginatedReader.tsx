// src/components/ModalReader/reader-mode/PaginatedReader.tsx
import { useRef, useState, useEffect, useMemo, memo, type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import Mermaid from '../../Mermaid'
import { usePaginatedBlocks } from './usePaginatedBlocks'
import { splitMarkdownByBlocks } from './splitMarkdownByBlocks'
import { groupBlocksIntoPages } from './groupBlocksIntoPages'
import { usePageNavigation } from './usePageNavigation'
import type { PageSize, PageRenderProps } from './types'

const MermaidMemo = memo(Mermaid)

interface PaginatedReaderProps {
  annotatedBody: string
  proseClass: string
  bookSlug: string
  modalType: 'interp' | 'skill' | 'source'
  modalKey: string
  initialPage?: number
  onCrossChapter?: (dir: 'prev' | 'next') => void
  children: (props: PageRenderProps) => ReactNode
}

export function PaginatedReader({
  annotatedBody,
  proseClass,
  bookSlug,
  modalType,
  modalKey,
  initialPage,
  onCrossChapter,
  children,
}: PaginatedReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const [pageSize, setPageSize] = useState<PageSize>({ width: 0, height: 0 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      if (entry) {
        const bs = entry.contentBoxSize?.[0]
        setPageSize({
          width: bs?.inlineSize ?? el.clientWidth,
          height: bs?.blockSize ?? el.clientHeight,
        })
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const { pages } = usePaginatedBlocks(measureRef as React.RefObject<HTMLElement>, pageSize)
  const blocks = useMemo(() => splitMarkdownByBlocks(annotatedBody), [annotatedBody])
  const pageMds = useMemo(() => groupBlocksIntoPages(blocks, pages), [blocks, pages])

  const nav = usePageNavigation({
    bookSlug,
    modalType,
    modalKey,
    totalPages: pageMds.length,
    initialPage,
    onCrossChapter,
  })

  // 稳定引用，避免 ReactMarkdown 因 props 变化而重建
  const remarkPlugins = useMemo(() => [remarkGfm], [])
  const rehypePlugins = useMemo(
    () =>
      [
        rehypeRaw,
        rehypeSlug,
        [rehypeHighlight, { ignoreMissing: true, plainText: ['mermaid'] }],
        rehypeAutolinkHeadings,
      ] as const,
    []
  )
  const markdownComponents = useMemo(
    () => ({
      code({ className, children: codeChildren, ...rest }: any) {
        const isMermaid = /\blanguage-mermaid\b/.test(className || '')
        const codeText = String(codeChildren).replace(/\n$/, '')
        if (isMermaid) return <MermaidMemo>{codeText}</MermaidMemo>
        return (
          <code className={className} {...rest}>
            {codeChildren}
          </code>
        )
      },
    }),
    []
  )

  const measureDom = useMemo(
    () => (
      <div
        ref={measureRef}
        className={`${proseClass} measure-dom`}
        style={{
          position: 'absolute',
          left: '-99999px',
          top: 0,
          width: pageSize.width || '100%',
          pointerEvents: 'none',
          visibility: 'hidden',
        }}
        aria-hidden="true"
      >
        <ReactMarkdown
          remarkPlugins={remarkPlugins}
          rehypePlugins={rehypePlugins as any}
          components={markdownComponents}
        >
          {annotatedBody}
        </ReactMarkdown>
      </div>
    ),
    [annotatedBody, proseClass, pageSize.width, remarkPlugins, rehypePlugins, markdownComponents]
  )

  return (
    <div ref={containerRef} className="paginated-reader-container">
      {measureDom}
      {children({
        pageMds,
        currentPage: nav.currentPage,
        goToPage: nav.goToPage,
        containerRef,
        pageSize,
      })}
    </div>
  )
}
