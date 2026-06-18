// src/components/ModalReader/reader-mode/PaginatedReader.tsx
import {
  useRef,
  useState,
  useEffect,
  useMemo,
  useImperativeHandle,
  forwardRef,
  type ReactNode,
} from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { usePaginatedBlocks } from './usePaginatedBlocks'
import { splitMarkdownByBlocks } from './splitMarkdownByBlocks'
import { groupBlocksIntoPages } from './groupBlocksIntoPages'
import { usePageNavigation } from './usePageNavigation'
import { markdownComponents } from './markdownComponents'
import type { PageSize, PageRenderProps } from './types'

export interface PaginatedReaderHandle {
  /** 通过 heading id 找 page（用于目录跳转）。找不到返回 -1 */
  getPageOfHeadingId: (id: string) => number
  /** 通过文本前缀在 measure DOM 中找 page + 搜索词（用于翻页后闪黄）。找不到返回 null */
  findText: (text: string) => { pageIdx: number; searchText: string } | null
  /** 跳转到指定 page */
  goToPage: (idx: number) => void
}

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

export const PaginatedReader = forwardRef<PaginatedReaderHandle, PaginatedReaderProps>(
  function PaginatedReader(
    {
      annotatedBody,
      proseClass,
      bookSlug,
      modalType,
      modalKey,
      initialPage,
      onCrossChapter,
      children,
    },
    ref
  ) {
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

    const blocks = useMemo(() => splitMarkdownByBlocks(annotatedBody), [annotatedBody])
    const { pages, getPageOfHeadingId, findText } = usePaginatedBlocks(
      measureRef as React.RefObject<HTMLElement>,
      pageSize,
      blocks
    )
    const pageMds = useMemo(() => groupBlocksIntoPages(blocks, pages), [blocks, pages])

    const nav = usePageNavigation({
      bookSlug,
      modalType,
      modalKey,
      totalPages: pageMds.length,
      initialPage,
      onCrossChapter,
    })

    useImperativeHandle(
      ref,
      () => ({ getPageOfHeadingId, findText, goToPage: nav.goToPage }),
      [getPageOfHeadingId, findText, nav.goToPage]
    )

    // 稳定引用，避免 ReactMarkdown 因 props 变化而重建
    const remarkPlugins = useMemo(() => [remarkGfm], [])
    // rehypePlugins 用 as const 推断元组类型，react-markdown 的 PluggableList
    // 对带 options 的元组推断不兼容（[Plugin, Options]）— 接受局部的 as any 收敛到单行
    const rehypePlugins = useMemo(
      () =>
        [
          rehypeRaw,
          rehypeSlug,
          [rehypeHighlight, { ignoreMissing: true, plainText: ['mermaid'] }],
          rehypeAutolinkHeadings,
        ] as unknown as Parameters<typeof ReactMarkdown>[0]['rehypePlugins'],
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
            visibility: 'hidden',
            // contain: layout style 让浏览器把 measure DOM 当独立子树，
            // 限制重排影响范围（mermaid 异步渲染时不触发外层 reflow）
            contain: 'layout style',
          } as React.CSSProperties}
          aria-hidden="true"
        >
          <ReactMarkdown
            remarkPlugins={remarkPlugins}
            rehypePlugins={rehypePlugins}
            components={markdownComponents}
          >
            {annotatedBody}
          </ReactMarkdown>
        </div>
      ),
      [annotatedBody, proseClass, pageSize.width, remarkPlugins, rehypePlugins]
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
)
