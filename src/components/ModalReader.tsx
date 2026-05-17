import React, { useState, useRef, useCallback, useEffect } from 'react'
import { X, PanelLeftClose, PanelLeft } from 'lucide-react'
import { getBookCompat, getBookSkill, getBookAssoc } from '../data/registry'
import { ReadingProgress, BackToTop, TocSidebar } from '../components/ReadingTools'
import AnnotationToolbar from '../components/AnnotationToolbar'
import AnnotationPanel from '../components/AnnotationPanel'
import ActionBar from '../components/ActionBar'
import { useBookmarks } from '../hooks/useProgress'
import { useAnnotations } from '../hooks/useAnnotations'
import type { AnnotationType } from '../hooks/useAnnotations'

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
  annotations: Array<{ rangeStart: number; rangeEnd: number; type: string; id: string }>
): string {
  if (annotations.length === 0 || typeof document === 'undefined') return html
  const div = document.createElement('div')
  div.innerHTML = html
  const sorted = [...annotations].sort((a, b) => a.rangeStart - b.rangeStart)

  for (const ann of sorted) {
    let acc = 0
    const walk = (node: Node): boolean => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || ''
        const nodeStart = acc
        const nodeEnd = acc + text.length
        if (ann.rangeStart >= nodeStart && ann.rangeEnd <= nodeEnd) {
          const offsetStart = ann.rangeStart - nodeStart
          const offsetEnd = ann.rangeEnd - nodeStart
          const before = text.slice(0, offsetStart)
          const marked = text.slice(offsetStart, offsetEnd)
          const after = text.slice(offsetEnd)
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
        acc = nodeEnd
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        for (let i = 0; i < node.childNodes.length; i++) {
          if (walk(node.childNodes[i])) {
            return true
          }
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
  } | null>(null)
  const [tocOpen, setTocOpen] = useState(false)
  const [skillRawText, setSkillRawText] = useState('')

  const bookCompat = getBookCompat(bookSlug)
  const bookSkill = getBookSkill(bookSlug)
  const bookAssoc = getBookAssoc(bookSlug)

  const interpContent = bookCompat.interpContent || {}
  const sourceContent = bookCompat.sourceContent || {}
  const skillRawContent = bookSkill.skillRawContent || {}
  const skillDisplayNames = bookSkill.skillDisplayNames || {}
  const interpToSkill = bookAssoc.interpToSkill || {}
  const skillToInterp = bookAssoc.skillToInterp || {}

  const { toggle: toggleBookmark, isBookmarked } = useBookmarks(bookSlug)
  const { annotations, add, remove, updateNote } = useAnnotations(
    bookSlug,
    modalKey,
    modalType === 'source',
  )

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
    if (modalKey && scrollToText && modalBodyRef.current) {
      const container = modalBodyRef.current
      const plainText = container.innerText || container.textContent || ''
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
          } catch {
            container.scrollTo({ top: 0, behavior: 'smooth' })
          }
        }
      }
      onScrollToTextConsumed()
    }
  }, [modalKey, scrollToText, onScrollToTextConsumed])

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
      const currentIdx = modalKey
        ? chapters.findIndex(c => c.name === modalKey)
        : -1
      if (
        (e.key === 'j' || e.key === 'J') &&
        currentIdx >= 0 &&
        currentIdx < chapters.length - 1
      )
        onNavigate(modalType || 'interp', chapters[currentIdx + 1].name)
      if ((e.key === 'k' || e.key === 'K') && currentIdx > 0)
        onNavigate(modalType || 'interp', chapters[currentIdx - 1].name)
      if (e.key === 'b' || e.key === 'B') {
        if (modalKey) toggleBookmark(modalKey)
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
    const loader = (skillRawContent as Record<string, () => Promise<string>>)[
      modalKey
    ]
    if (!loader) return
    loader().then(text => setSkillRawText(text))
  }, [modalType, modalKey])

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !modalBodyRef.current) return
    const text = sel.toString().trim()
    if (!text) return
    const plainText = modalBodyRef.current.textContent || ''
    const start = plainText.indexOf(text)
    if (start === -1) return
    setToolbarPos({ x: e.clientX, y: e.clientY - 8 })
    setPendingSelection({ text, start, end: start + text.length })
  }, [])

  const handleAnnotationType = (type: AnnotationType) => {
    if (!pendingSelection) return
    add({
      type,
      selectedText: pendingSelection.text,
      rangeStart: pendingSelection.start,
      rangeEnd: pendingSelection.end,
      note: '',
      fromSource: modalType === 'source',
    })
    setToolbarPos(null)
    setPendingSelection(null)
    setShowPanel(true)
    window.getSelection()?.removeAllRanges()
  }

  const handleNavigate = () => {
    if (modalBodyRef.current) modalBodyRef.current.scrollTop = 0
  }

  const skillDisplayName = modalKey
    ? skillDisplayNames[modalKey] || modalKey
    : ''
  const modalTitle =
    modalType === 'interp'
      ? `【${modalKey}】原文解读`
      : modalType === 'skill'
        ? `【${skillDisplayName}】技能`
        : `【${modalKey}】原文`
  const rawBody =
    modalType === 'source'
      ? (sourceContent as Record<string, string>)[modalKey] ||
        '<p style="color:#8080a0;text-align:center;padding:40px 0">未找到该篇原文</p>'
      : modalType === 'interp'
        ? (interpContent as Record<string, string>)[modalKey] ||
          '<p style="color:#8080a0;text-align:center;padding:40px 0">未找到该篇解读内容</p>'
        : ''
  const annotatedBody = injectAnnotations(rawBody, annotations)
  const proseClass =
    modalType === 'interp' || modalType === 'source' ? 'prose-interp' : ''

  return (
    <>
      <div
        className="modal-backdrop"
        onClick={e => {
          if ((e.target as HTMLElement).classList.contains('modal-backdrop'))
            onClose()
        }}
      >
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
                  color: tocOpen
                    ? 'var(--color-gold)'
                    : 'var(--color-text-dim)',
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
            <div style={{ flex: 1 }} />
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
            <button className="btn-back" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
          <ReadingProgress scrollRef={modalBodyRef} />
          <div className="modal-content-wrapper">
            {modalType === 'interp' && (
              <TocSidebar
                html={rawBody}
                scrollRef={modalBodyRef}
                open={tocOpen}
              />
            )}
            <div
              className="modal-body"
              ref={modalBodyRef}
              onMouseUp={
                modalType !== 'skill' ? handleMouseUp : undefined
              }
              onTouchEnd={
                modalType !== 'skill'
                  ? e => {
                      const t = e.changedTouches[0]
                      handleMouseUp({
                        clientX: t.clientX,
                        clientY: t.clientY,
                      } as any)
                    }
                  : undefined
              }
            >
              {modalType === 'skill' ? (
                <pre className="skill-raw-body">
                  <code>{skillRawText || '加载中...'}</code>
                </pre>
              ) : (
                <div
                  className={proseClass}
                  dangerouslySetInnerHTML={{ __html: annotatedBody }}
                />
              )}
            </div>
          </div>
          {modalKey && (
            <div className="related-section">
              {modalType === 'interp' &&
                interpToSkill[modalKey]?.length > 0 && (
                  <div className="related-tags">
                    <span className="related-label">关联技能</span>
                    {(interpToSkill[modalKey] as string[]).map(
                      (sk: string) => (
                        <button
                          key={sk}
                          className="related-tag related-tag-skill"
                          onClick={() => onNavigate('skill', sk)}
                        >
                          {skillDisplayNames[sk] || sk}
                        </button>
                      ),
                    )}
                  </div>
                )}
              {modalType === 'skill' &&
                skillToInterp[modalKey]?.length > 0 && (
                  <div className="related-tags">
                    <span className="related-label">相关篇目</span>
                    {(skillToInterp[modalKey] as string[]).map(
                      (ch: string) => (
                        <button
                          key={ch}
                          className="related-tag related-tag-chapter"
                          onClick={() => onNavigate('interp', ch)}
                        >
                          {ch}
                        </button>
                      ),
                    )}
                  </div>
                )}
            </div>
          )}
          <BackToTop scrollRef={modalBodyRef} />
        </div>
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
      {toolbarPos && (
        <AnnotationToolbar
          position={toolbarPos}
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
