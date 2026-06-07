import { useState, useRef, useCallback, useEffect } from 'react'
import { X, PanelLeftClose, PanelLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import Mermaid from '../Mermaid'
import './ModalReader.less'
import { getBook } from '../../data/registry'
import { ReadingProgress, BackToTop, TocSidebar } from '../ReadingTools'
import AnnotationToolbar from '../AnnotationToolbar'
import AnnotationPanel from '../AnnotationPanel'
import ActionBar from '../ActionBar'
import { useBookmarks } from '../../hooks/useProgress'
import { useAnnotations } from '../../hooks/useAnnotations'
import type { AnnotationType, Annotation } from '../../hooks/useAnnotations'
import { injectAnnotations } from '../../utils/injectAnnotations'

interface ModalReaderProps {
  chapters: Array<{ name: string }>
  bookSlug: string
  modalType: 'interp' | 'skill' | 'source'
  modalKey: string
  scrollToText: string | null
  onClose: () => void
  onNavigate: (type: 'interp' | 'skill' | 'source', key: string) => void
  onScrollToTextConsumed: () => void
}

interface BookData {
  interpContent?: Record<string, () => Promise<string>>
  sourceContent?: Record<string, () => Promise<string>>
  skillRawContent?: Record<string, () => Promise<string>>
  skillDisplayNames?: Record<string, string>
  chapterToSkills?: Record<string, string[]>
  skillToChapters?: Record<string, string[]>
}

const SCROLL_OFFSET = 100
const ANNOTATION_SCROLL_OFFSET = 80
const AUTO_FADE_MS = 4000
const MOBILE_BREAKPOINT = 640

const ModalReader = ({
  chapters,
  bookSlug,
  modalType,
  modalKey,
  scrollToText,
  onClose,
  onNavigate,
  onScrollToTextConsumed,
}: ModalReaderProps) => {
  const modalBodyRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [toolbarPos, setToolbarPos] = useState<{ x: number; y: number } | null>(null)
  const [showPanel, setShowPanel] = useState(false)
  const [pendingSelection, setPendingSelection] = useState<{
    text: string
    start: number
    end: number
    matchIndex: number
  } | null>(null)
  const [tocOpen, setTocOpen] = useState(false)
  const [skillRawText, setSkillRawText] = useState('')
  const [loadedContent, setLoadedContent] = useState('')
  const [contentLoading, setContentLoading] = useState(false)

  const bookData = getBook(bookSlug) as BookData

  const interpContent = bookData.interpContent ?? {}
  const sourceContent = bookData.sourceContent ?? {}
  const skillRawContent = bookData.skillRawContent ?? {}
  const skillDisplayNames = bookData.skillDisplayNames ?? {}
  const chapterToSkills = bookData.chapterToSkills ?? {}
  const skillToChapters = bookData.skillToChapters ?? {}

  const { toggle: toggleBookmark, isBookmarked } = useBookmarks(bookSlug)
  const { annotations, add, remove, updateNote } = useAnnotations(
    bookSlug,
    modalKey,
    modalType === 'source'
  )

  // 加载内容（异步函数）
  useEffect(() => {
    if (!modalKey || !modalType || modalType === 'skill') return
    let cancelled = false
    setContentLoading(true)
    setLoadedContent('')

    let loader: (() => Promise<string>) | undefined
    if (modalType === 'interp') {
      loader = interpContent[modalKey]
    } else if (modalType === 'source') {
      loader = sourceContent[modalKey]
    }

    if (!loader) {
      setContentLoading(false)
      return
    }

    loader()
      .then(content => {
        if (!cancelled) { setLoadedContent(content); setContentLoading(false) }
      })
      .catch(() => {
        if (!cancelled) setContentLoading(false)
      })
    return () => { cancelled = true }
  }, [modalKey, modalType])

  // Reset internal UI state when navigating between chapters
  const prevKeyRef = useRef(modalKey)
  useEffect(() => {
    if (prevKeyRef.current !== modalKey) {
      setToolbarPos(null)
      setShowPanel(false)
      setPendingSelection(null)
      setTocOpen(false)
      setSkillRawText('')
      prevKeyRef.current = modalKey
    }
  }, [modalKey])

  // Scroll to matching text when opened from search
  useEffect(() => {
    if (modalKey && scrollToText && modalBodyRef.current && !contentLoading) {
      const container = modalBodyRef.current
      const plainText = container.textContent || ''
      if (!plainText) return
      const searchText = scrollToText.trim()
      const idx = plainText.indexOf(searchText)
      if (idx >= 0) {
        let charCount = 0
        let targetNode: Node | null = null
        let targetOffset = 0
        const walk = (node: Node) => {
          if (targetNode) return
          if (node.nodeType === Node.TEXT_NODE) {
            const text = (node as Text).textContent || ''
            const nextCount = charCount + text.length
            if (idx < nextCount) {
              targetNode = node
              targetOffset = Math.min(idx - charCount, text.length)
              return
            }
            charCount = nextCount
          } else {
            for (const child of Array.from(node.childNodes)) {
              walk(child)
              if (targetNode) return
            }
          }
        }
        walk(container)
        if (targetNode) {
          const nodeText = (targetNode as Text).textContent || ''
          const nodeLen = nodeText.length
          const validOffset = Math.min(targetOffset, nodeLen - 1)
          const validEndOffset = Math.min(validOffset + searchText.length, nodeLen)
          try {
            const range = document.createRange()
            range.setStart(targetNode, validOffset)
            range.setEnd(targetNode, validEndOffset)
            const rect = range.getBoundingClientRect()
            container.scrollTo({
              top: container.scrollTop + rect.top - SCROLL_OFFSET,
              behavior: 'smooth',
            })

            // Temporary highlight that auto-fades
            const mark = document.createElement('mark')
            mark.className = 'search-flash'
            mark.textContent = nodeText.slice(validOffset, validEndOffset)
            const before = document.createTextNode(nodeText.slice(0, validOffset))
            const after = document.createTextNode(nodeText.slice(validEndOffset))
            const frag = document.createDocumentFragment()
            frag.appendChild(before)
            frag.appendChild(mark)
            frag.appendChild(after)
            const parent = (targetNode as Text).parentNode
            if (parent) {
              const idx = Array.from(parent.childNodes).indexOf(targetNode)
              parent.replaceChild(frag, targetNode)
              timerRef.current = setTimeout(() => {
                const combined = document.createTextNode(
                  (parent.childNodes[idx] as Text).textContent! +
                    (parent.childNodes[idx + 1] as HTMLElement).textContent! +
                    (parent.childNodes[idx + 2] as Text).textContent!
                )
                parent.replaceChild(combined, parent.childNodes[idx])
                parent.removeChild(parent.childNodes[idx + 1])
                parent.removeChild(parent.childNodes[idx + 1])
                onScrollToTextConsumed()
                timerRef.current = null
              }, AUTO_FADE_MS)
            }
          } catch {
            container.scrollTo({ top: 0, behavior: 'smooth' })
          }
        }
      }
    }
    // Cleanup: cancel pending restore timer
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [modalKey, scrollToText, onScrollToTextConsumed, loadedContent, contentLoading, skillRawText])

  // J/K keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'Escape') {
        setToolbarPos(null)
        setPendingSelection(null)
        return
      }
      const currentIdx = modalKey ? chapters.findIndex(c => c.name === modalKey) : -1
      if ((e.key === 'j' || e.key === 'J') && currentIdx >= 0 && currentIdx < chapters.length - 1)
        onNavigate(modalType || 'interp', chapters[currentIdx + 1].name)
      if ((e.key === 'k' || e.key === 'K') && currentIdx > 0)
        onNavigate(modalType || 'interp', chapters[currentIdx - 1].name)
      if (e.key === 'b' || e.key === 'B') {
        if (modalKey) toggleBookmark(modalKey, modalType)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [chapters, modalKey, modalType, toggleBookmark, onNavigate])

  // Load raw skill content
  useEffect(() => {
    if (modalType !== 'skill' || !modalKey) {
      setSkillRawText('')
      return
    }
    // skillRawContent 按章节文件夹名索引，需通过 skillToChapters 映射
    const contentKey = skillToChapters[modalKey]?.[0] || modalKey
    const loader = skillRawContent[contentKey]
    if (!loader) return
    loader().then(text => setSkillRawText(text))
  }, [modalType, modalKey])

  const handleMouseUp = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !modalBodyRef.current) return
    const text = sel.toString().trim()
    if (!text) return

    // Walk DOM from selection anchor to get exact character offset
    const range = sel.getRangeAt(0)
    const startNode = range.startContainer
    const startOffset = range.startOffset

    let charCount = 0
    let foundStart = -1
    const walk = (node: Node) => {
      if (foundStart >= 0) return
      if (node === startNode) {
        if (node.nodeType === Node.TEXT_NODE) {
          foundStart = charCount + startOffset
        }
        return
      }
      if (node.nodeType === Node.TEXT_NODE) {
        charCount += (node.textContent || '').length
      } else {
        for (const child of Array.from(node.childNodes)) {
          walk(child)
          if (foundStart >= 0) return
        }
      }
    }
    walk(modalBodyRef.current)
    if (foundStart < 0) return

    // Count occurrences of text before found position to determine matchIndex
    const plainText = modalBodyRef.current.textContent || ''
    let matchIndex = 0
    let searchPos = 0
    while (true) {
      const idx = plainText.indexOf(text, searchPos)
      if (idx === -1 || idx >= foundStart) break
      matchIndex++
      searchPos = idx + 1
    }

    const clientX = 'touches' in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX
    const clientY = 'touches' in e ? e.changedTouches[0].clientY : (e as React.MouseEvent).clientY
    setToolbarPos({ x: clientX, y: clientY - 8 })
    setPendingSelection({ text, start: foundStart, end: foundStart + text.length, matchIndex })
  }, [])

  const handleAnnotationType = (type: AnnotationType) => {
    if (!pendingSelection) return
    add({
      type,
      selectedText: pendingSelection.text,
      rangeStart: pendingSelection.start,
      rangeEnd: pendingSelection.end,
      matchIndex: pendingSelection.matchIndex,
      note: '',
      fromSource: modalType === 'source',
    })
    setToolbarPos(null)
    setPendingSelection(null)
    window.getSelection()?.removeAllRanges()
  }

  const handleNavigate = (ann: Annotation) => {
    setShowPanel(false)
    const el = modalBodyRef.current
    if (!el) return
    const target = el.querySelector(`[data-ann-id="${CSS.escape(ann.id)}"]`) as HTMLElement | null
    if (target) {
      const containerRect = el.getBoundingClientRect()
      const targetRect = target.getBoundingClientRect()
      el.scrollBy({
        top: targetRect.top - containerRect.top - ANNOTATION_SCROLL_OFFSET,
        behavior: 'smooth',
      })
    }
  }


  // 统一 ChapterKey 下的跨内容导航：同一篇章的 source / interp / skill 互相跳转
  const chapterName =
    modalType === 'skill' ? skillToChapters[modalKey]?.[0] || modalKey : modalKey
  const chapterSkillName = chapterToSkills[chapterName]?.[0]
  const hasSource = !!sourceContent[chapterName]
  const hasInterp = !!interpContent[chapterName]
  const hasSkill = !!skillRawContent[chapterName]

  const contentNavItems = [
    { type: 'source' as const, label: '原文', show: hasSource && modalType !== 'source', navKey: chapterName },
    { type: 'interp' as const, label: '解读', show: hasInterp && modalType !== 'interp', navKey: chapterName },
    { type: 'skill' as const, label: '技能', show: hasSkill && modalType !== 'skill' && !!chapterSkillName, navKey: chapterSkillName || '' },
  ].filter(c => c.show)
  const rawBody = contentLoading
    ? ''
    : loadedContent ||
      (modalType === 'source'
        ? '<p class="not-found-msg">未找到该篇原文</p>'
        : modalType === 'interp'
          ? '<p class="not-found-msg">未找到该篇解读内容</p>'
          : '')
  const annotatedBody = injectAnnotations(rawBody, annotations)
  const proseClass = modalType === 'interp' || modalType === 'source' ? 'prose-interp' : ''

  return (
    <>
      <div className="modal-backdrop">
        <div className="modal-card">
          <div className="modal-header">
            {modalType === 'interp' && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setTocOpen(v => !v)}
                title="目录"
                className={`toc-toggle-btn${tocOpen ? ' active' : ''}`}
                aria-label="切换目录"
              >
                {tocOpen ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
              </Button>
            )}
            <div className="flex-1" />
            <ActionBar
              key={modalKey}
              bookSlug={bookSlug}
              modalType={modalType}
              modalKey={modalKey}
              isBookmarked={isBookmarked}
              toggleBookmark={toggleBookmark}
              annotationsCount={annotations.length}
              onTogglePanel={() => setShowPanel(v => !v)}
              skillRawContent={skillRawContent}
            />
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={18} />
            </Button>
            <ReadingProgress scrollRef={modalBodyRef} />
          </div>
          <div
            className="modal-content-wrapper"
            onClick={e => {
              if (tocOpen && !(e.target as HTMLElement).closest('.toc-sidebar')) {
                setTocOpen(false)
              }
            }}
          >
            {modalType === 'interp' && (
              <TocSidebar
                html={rawBody}
                scrollRef={modalBodyRef}
                open={tocOpen}
                onItemClick={() => {
                  if (window.innerWidth <= MOBILE_BREAKPOINT) setTocOpen(false)
                }}
              />
            )}
            <div
              className="modal-body"
              ref={modalBodyRef}
              onMouseUp={modalType !== 'skill' ? handleMouseUp : undefined}
              onTouchEnd={
                modalType !== 'skill'
                  ? e => {
                      const sel = window.getSelection()
                      if (sel && !sel.isCollapsed) e.preventDefault()
                      handleMouseUp(e)
                    }
                  : undefined
              }
            >
              {modalType === 'skill' ? (
                <pre className="skill-raw-body">
                  <code>{skillRawText || '加载中...'}</code>
                </pre>
              ) : contentLoading ? (
                <div className={`${proseClass} loading-center`}>加载中...</div>
              ) : (
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
              )}
            </div>
          </div>
          {modalKey && (
            <div className="related-section">
              {/* 同一篇章内的跨内容导航 */}
              {contentNavItems.length > 0 && (
                <div className="related-tags">
                  <span className="related-label">本篇内容</span>
                  {contentNavItems.map(({ type, label, navKey }) => (
                    <Button
                      key={type}
                      variant="ghost"
                      size="sm"
                      className={`related-tag related-tag-${type}`}
                      onClick={() => onNavigate(type, navKey)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              )}

              {[
                {
                  key: 'interp',
                  data: (chapterToSkills[chapterName] || []).filter(
                    s => modalType !== 'skill' || s !== modalKey
                  ),
                  label: '关联技能',
                  navigateType: 'skill' as const,
                  displayName: skillDisplayNames,
                },
                {
                  key: 'skill',
                  data: skillToChapters[modalKey],
                  label: '相关篇目',
                  navigateType: 'interp' as const,
                  displayName: null as Record<string, string> | null,
                },
              ]
                .filter(item => item.data?.length)
                .map(({ key, data, label, navigateType, displayName }) => (
                  <div key={key} className="related-tags">
                    <span className="related-label">{label}</span>
                    {(data as string[]).map(item => (
                      <Button
                        key={item}
                        variant="ghost"
                        size="sm"
                        className={`related-tag related-tag-${key}`}
                        onClick={() => onNavigate(navigateType, item)}
                      >
                        {displayName ? displayName[item] || item : item}
                      </Button>
                    ))}
                  </div>
                ))}

              <BackToTop scrollRef={modalBodyRef} />
            </div>
          )}

          {showPanel && (
            <AnnotationPanel
              annotations={annotations}
              onRemove={remove}
              onUpdateNote={updateNote}
              onNavigate={handleNavigate}
              onClose={() => setShowPanel(false)}
            />
          )}
        </div>
      </div>
      {toolbarPos && (
        <AnnotationToolbar
          position={toolbarPos}
          selectedText={pendingSelection?.text}
          onSelect={handleAnnotationType}
          onClose={() => {
            setToolbarPos(null)
            setPendingSelection(null)
          }}
        />
      )}
    </>
  )
}

export default ModalReader
