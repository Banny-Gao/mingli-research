import React, { useState, useRef, useCallback, useEffect } from 'react'
import { X, PanelLeftClose, PanelLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import Mermaid from '../components/Mermaid'
import { getBook } from '../data/registry'
import { ReadingProgress, BackToTop, TocSidebar } from '../components/ReadingTools'
import AnnotationToolbar from '../components/AnnotationToolbar'
import AnnotationPanel from '../components/AnnotationPanel'
import ActionBar from '../components/ActionBar'
import { useBookmarks } from '../hooks/useProgress'
import { useAnnotations } from '../hooks/useAnnotations'
import type { AnnotationType, Annotation } from '../hooks/useAnnotations'

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

function injectAnnotations(
  html: string,
  annotations: Array<{
    selectedText: string
    matchIndex?: number
    rangeStart: number
    type: string
    id: string
  }>
): string {
  if (annotations.length === 0 || typeof document === 'undefined') return html
  const div = document.createElement('div')
  div.innerHTML = html

  for (const ann of annotations) {
    // Determine which occurrence of the text to mark.
    // Use matchIndex if available (new data), otherwise derive from rangeStart (legacy).
    let targetOccurrence = 0
    if (ann.matchIndex !== undefined) {
      targetOccurrence = ann.matchIndex
    } else {
      const plainText = div.textContent || ''
      let searchPos = 0
      while (true) {
        const idx = plainText.indexOf(ann.selectedText, searchPos)
        if (idx === -1 || idx >= ann.rangeStart) break
        targetOccurrence++
        searchPos = idx + 1
      }
    }

    // Walk DOM to find the target occurrence
    let currentOccurrence = 0
    const walk = (node: Node): boolean => {
      if (node.nodeType === Node.TEXT_NODE) {
        const nodeText = node.textContent || ''
        let localSearchStart = 0
        while (true) {
          const foundIdx = nodeText.indexOf(ann.selectedText, localSearchStart)
          if (foundIdx === -1) break

          if (currentOccurrence === targetOccurrence) {
            const before = nodeText.slice(0, foundIdx)
            const marked = nodeText.slice(foundIdx, foundIdx + ann.selectedText.length)
            const after = nodeText.slice(foundIdx + ann.selectedText.length)
            const mark = document.createElement('mark')
            mark.className = `ann-${ann.type}`
            mark.dataset.annId = ann.id
            mark.textContent = marked
            const frag = document.createDocumentFragment()
            frag.appendChild(document.createTextNode(before))
            frag.appendChild(mark)
            frag.appendChild(document.createTextNode(after))
            node.parentNode?.replaceChild(frag, node)
            return true
          }

          currentOccurrence++
          localSearchStart = foundIdx + 1
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        for (let i = 0; i < node.childNodes.length; i++) {
          if (walk(node.childNodes[i])) return true
        }
      }
      return false
    }
    walk(div)
  }
  return div.innerHTML
}

const ModalReader: React.FC<ModalReaderProps> = ({
  chapters,
  bookSlug,
  modalType,
  modalKey,
  scrollToText,
  onClose,
  onNavigate,
  onScrollToTextConsumed,
}) => {
  const modalBodyRef = useRef<HTMLDivElement>(null)
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

  const bookData = getBook(bookSlug)

  const interpContent = (bookData.interpContent as Record<string, () => Promise<string>>) || {}
  const sourceContent = (bookData.sourceContent as Record<string, () => Promise<string>>) || {}
  const skillRawContent = bookData.skillRawContent || {}
  const skillDisplayNames = bookData.skillDisplayNames || {}
  const interpToSkill = bookData.interpToSkill || {}
  const skillToInterp = bookData.skillToInterp || {}

  const { toggle: toggleBookmark, isBookmarked } = useBookmarks(bookSlug)
  const { annotations, add, remove, updateNote } = useAnnotations(
    bookSlug,
    modalKey,
    modalType === 'source'
  )

  // 加载内容（异步函数）
  useEffect(() => {
    if (!modalKey || !modalType || modalType === 'skill') return
    setContentLoading(true)
    setLoadedContent('')

    let loader: (() => Promise<string>) | undefined
    if (modalType === 'interp') {
      const contentMap = interpContent as Record<string, () => Promise<string>>
      loader = contentMap[modalKey]
    } else if (modalType === 'source') {
      const contentMap = sourceContent as Record<string, () => Promise<string>>
      loader = contentMap[modalKey]
    }

    if (!loader) {
      setContentLoading(false)
      return
    }

    loader()
      .then(content => {
        setLoadedContent(content)
        setContentLoading(false)
      })
      .catch(err => {
        console.error('[DEBUG] Load error:', err)
        setContentLoading(false)
      })
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
              top: container.scrollTop + rect.top - 100,
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
              setTimeout(() => {
                const combined = document.createTextNode(
                  (parent.childNodes[idx] as Text).textContent! +
                    (parent.childNodes[idx + 1] as HTMLElement).textContent! +
                    (parent.childNodes[idx + 2] as Text).textContent!
                )
                parent.replaceChild(combined, parent.childNodes[idx])
                parent.removeChild(parent.childNodes[idx + 1])
                parent.removeChild(parent.childNodes[idx + 1])
                onScrollToTextConsumed()
              }, 4000)
            }
          } catch {
            container.scrollTo({ top: 0, behavior: 'smooth' })
          }
        }
      }
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
    // skillRawContent 按章节文件夹名索引，需通过 skillToInterp 映射
    const contentKey = (skillToInterp as Record<string, string[]>)[modalKey]?.[0] || modalKey
    const loader = (skillRawContent as Record<string, () => Promise<string>>)[contentKey]
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
      el.scrollBy({ top: targetRect.top - containerRect.top - 80, behavior: 'smooth' })
    }
  }

  const skillDisplayName = modalKey ? skillDisplayNames[modalKey] || modalKey : ''
  const modalTitle =
    modalType === 'interp'
      ? `【${modalKey}】原文解读`
      : modalType === 'skill'
        ? `【${skillDisplayName}】技能`
        : `【${modalKey}】原文`
  const rawBody = contentLoading
    ? ''
    : loadedContent ||
      (modalType === 'source'
        ? '<p style="color:#8080a0;text-align:center;padding:40px 0">未找到该篇原文</p>'
        : modalType === 'interp'
          ? '<p style="color:#8080a0;text-align:center;padding:40px 0">未找到该篇解读内容</p>'
          : '')
  const annotatedBody = injectAnnotations(rawBody, annotations)
  const proseClass = modalType === 'interp' || modalType === 'source' ? 'prose-interp' : ''

  return (
    <>
      <div className="modal-backdrop">
        <div className="modal-card">
          <div className="modal-header">
            {modalType === 'interp' && (
              <button
                onClick={() => setTocOpen(v => !v)}
                title="目录"
                style={{
                  background: 'none',
                  border: '1px solid var(--color-border)',
                  borderRadius: 6,
                  padding: '6px',
                  cursor: 'pointer',
                  color: tocOpen ? 'var(--color-gold)' : 'var(--color-text-dim)',
                  display: 'flex',
                  alignItems: 'center',
                  marginRight: 8,
                  transition: 'all 0.2s',
                }}
              >
                {tocOpen ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
              </button>
            )}
            <span className="modal-title">{modalTitle}</span>
            <div className="flex-1" />
            <ActionBar
              key={modalKey}
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
          </div>
          <ReadingProgress scrollRef={modalBodyRef} />
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
                  if (window.innerWidth <= 640) setTocOpen(false)
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
                      e.preventDefault()
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
                <div
                  className={proseClass}
                  style={{ color: 'var(--color-text-dim)', padding: '40px 0', textAlign: 'center' }}
                >
                  加载中...
                </div>
              ) : (
                <div className={proseClass}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeSlug, rehypeHighlight, rehypeAutolinkHeadings]}
                    components={{
                      code({ className, children, ...props }) {
                        const isMermaid = className === 'language-mermaid'
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
              {modalType === 'interp' && interpToSkill[modalKey]?.length > 0 && (
                <div className="related-tags">
                  <span className="related-label">关联技能</span>
                  {(interpToSkill[modalKey] as string[]).map((sk: string) => (
                    <button
                      key={sk}
                      className="related-tag related-tag-skill"
                      onClick={() => onNavigate('skill', sk)}
                    >
                      {skillDisplayNames[sk] || sk}
                    </button>
                  ))}
                </div>
              )}
              {modalType === 'skill' && skillToInterp[modalKey]?.length > 0 && (
                <div className="related-tags">
                  <span className="related-label">相关篇目</span>
                  {(skillToInterp[modalKey] as string[]).map((ch: string) => (
                    <button
                      key={ch}
                      className="related-tag related-tag-chapter"
                      onClick={() => onNavigate('interp', ch)}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <BackToTop scrollRef={modalBodyRef} />
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
