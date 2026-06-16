import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import Mermaid from '../../Mermaid'
import { usePaginatedBlocks } from './usePaginatedBlocks'
import { splitMarkdownByBlocks } from './splitMarkdownByBlocks'
import type { ReaderMode, NavigateWithPage, PageSize } from './types'

const isClient = typeof window !== 'undefined'
const useIsoLayoutEffect = isClient ? useLayoutEffect : useEffect

export interface PaginatedLayoutRenderArgs {
  pages: ReturnType<typeof usePaginatedBlocks>['pages']
  subMds: string[]
  measureRef: React.RefObject<HTMLDivElement | null>
  currentPage: number
  goToPage: ReturnType<typeof usePaginatedBlocks>['goToPage']
  getPageOf: ReturnType<typeof usePaginatedBlocks>['getPageOf']
}

interface PaginatedLayoutProps {
  annotatedBody: string
  proseClass: string
  readerMode: ReaderMode
  onNavigate: NavigateWithPage
  bookSlug: string
  modalType: 'interp' | 'skill' | 'source'
  modalKey: string
  children: (args: PaginatedLayoutRenderArgs) => ReactNode
}

export function PaginatedLayout({
  annotatedBody,
  proseClass,
  readerMode,
  children,
}: PaginatedLayoutProps) {
  const measureRef = useRef<HTMLDivElement>(null)
  const [pageSize, setPageSize] = useState<PageSize>({ width: 0, height: 0 })
  const [mounted, setMounted] = useState(false)

  useIsoLayoutEffect(() => {
    const update = () => {
      setPageSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }
    update()
    setMounted(true)
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const { pages, currentPage, goToPage, getPageOf } = usePaginatedBlocks(measureRef, pageSize)
  const subMds = mounted ? splitMarkdownByBlocks(annotatedBody) : []

  return (
    <>
      <div
        ref={measureRef}
        className={proseClass}
        data-reader-mode={readerMode}
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
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              )
            },
          }}
        >
          {annotatedBody}
        </ReactMarkdown>
      </div>

      {children({ pages, subMds, measureRef, currentPage, goToPage, getPageOf })}
    </>
  )
}
