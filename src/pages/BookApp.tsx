import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { X, Star, Bookmark, MoreHorizontal, PanelLeftClose, PanelLeft, Copy, ArrowLeft } from 'lucide-react'
import { books } from '../data/books'
import { interpContent, skillContent, sourceContent } from '../data/ditiansui-site'
import { skillRawContent, skillDisplayNames } from '../data/ditiansui-site/skill'
import { interpToSkill, skillToInterp } from '../data/ditiansui-site/assoc'
import ReadList from '../components/ReadList'
import { ReadingProgress, BackToTop, TocSidebar } from '../components/ReadingTools'
import SearchBar from '../components/SearchBar'
import AnnotationToolbar from '../components/AnnotationToolbar'
import AnnotationPanel from '../components/AnnotationPanel'
import { useReadProgress, useBookmarks, useGlobalProgress } from '../hooks/useProgress'
import { useAnnotations } from '../hooks/useAnnotations'
import type { AnnotationType } from '../hooks/useAnnotations'

function injectAnnotations(
  html: string,
  annotations: Array<{ rangeStart: number; rangeEnd: number; type: string; id: string }>
): string {
  if (annotations.length === 0) return html
  const sorted = [...annotations].sort((a, b) => a.rangeStart - b.rangeStart)
  let result = ''
  let cursor = 0
  for (const ann of sorted) {
    const start = Math.max(cursor, ann.rangeStart)
    const end = Math.min(html.length, ann.rangeEnd)
    result += html.slice(cursor, start)
    result += `<mark class="ann-${ann.type}" data-ann-id="${ann.id}">${html.slice(start, end)}</mark>`
    cursor = end
  }
  result += html.slice(cursor)
  return result
}

const BookApp: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const [modalType, setModalType] = useState<'interp' | 'skill' | 'source' | null>(null)
  const [modalKey, setModalKey] = useState('')
  const [scrollToText, setScrollToText] = useState<string | null>(null)
  const modalBodyRef = useRef<HTMLDivElement>(null)
  const [toolbarPos, setToolbarPos] = useState<{ x: number; y: number } | null>(null)
  const [showPanel, setShowPanel] = useState(false)
  const [pendingSelection, setPendingSelection] = useState<{
    text: string
    start: number
    end: number
  } | null>(null)
  const [tocOpen, setTocOpen] = useState(false)
  const [actionPopoverOpen, setActionPopoverOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [skillRawText, setSkillRawText] = useState('')

  const book = books.find(b => b.slug === slug)
  const { markRead } = useReadProgress(slug || '')
  const { toggle: toggleBookmark, isBookmarked } = useBookmarks(slug || '')
  const { touchChapter } = useGlobalProgress()
  const { annotations, add, remove, updateNote } = useAnnotations(slug || '', modalKey)
  const bookSourceKeys = Object.keys(sourceContent) as unknown as string[]
  const skillKeys = Object.keys(skillContent || {})

  // Handle URL params for search navigation
  useEffect(() => {
    const open = searchParams.get('open')
    const key = searchParams.get('key')
    if (open && key) {
      // Normalize 'chapter' -> 'interp' for compatibility
      const normalizedType = open === 'chapter' ? 'interp' : open
      setModalType(normalizedType as 'interp' | 'skill')
      setModalKey(decodeURIComponent(key))
      const match = searchParams.get('match')
      if (match) {
        setScrollToText(decodeURIComponent(match))
      }
    }
  }, [searchParams])

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
            // Fallback: scroll to top
            container.scrollTo({ top: 0, behavior: 'smooth' })
          }
        }
      }
      setScrollToText(null) // Only scroll once
    }
  }, [modalKey, scrollToText])

  // J/K keyboard shortcuts for chapter navigation
  useEffect(() => {
    if (!book) return
    const handler = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'Escape') {
        setToolbarPos(null)
        setPendingSelection(null)
        return
      }
      const chapters = book.chapters
      const currentIdx = modalKey ? chapters.findIndex(c => c.name === modalKey) : -1
      if ((e.key === 'j' || e.key === 'J') && currentIdx >= 0 && currentIdx < chapters.length - 1) {
        openModal(modalType || 'interp', chapters[currentIdx + 1].name)
      }
      if ((e.key === 'k' || e.key === 'K') && currentIdx > 0) {
        openModal(modalType || 'interp', chapters[currentIdx - 1].name)
      }
      if (e.key === 'b' || e.key === 'B') {
        if (modalKey) toggleBookmark(modalKey)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [book, modalKey, modalType, toggleBookmark])

  const pageTitle = book ? `《${book.title}》- 命理学术中心` : '404 - 命理学术中心'
  const pageDesc = book
    ? `共${book.total}篇·已解读${book.done}篇·已有${skillKeys.length}个技能`
    : '未找到该典籍'

  if (!book) {
    return (
      <>
        <Helmet>
          <title>404</title>
        </Helmet>
        <div className="page-container">
          <div className="not-found">
            <div className="not-found-inner">
              <div className="not-found-code">404</div>
              <p className="not-found-msg">未找到该典籍</p>
              <Link to="/" className="btn-primary">
                返回首页
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  const closeModal = () => {
    if (modalType === 'interp' && modalKey) markRead(modalKey)
    setModalType(null)
    setModalKey('')
    setToolbarPos(null)
    setShowPanel(false)
    setScrollToText(null)
    setTocOpen(false)
    setActionPopoverOpen(false)
  }

  const openModal = (type: 'interp' | 'skill' | 'source', key: string) => {
    setModalType(type)
    setModalKey(key)
    setToolbarPos(null)
    setShowPanel(false)
    if (slug) touchChapter(slug, key)
  }

  const handleMouseUp = useCallback(() => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !modalBodyRef.current) return
    const text = sel.toString().trim()
    if (!text) return
    const range = sel.getRangeAt(0)
    const preCaretRange = range.cloneRange()
    preCaretRange.selectNodeContents(modalBodyRef.current)
    preCaretRange.setEnd(range.startContainer, range.startOffset)
    const start = preCaretRange.toString().length
    const end = start + text.length
    const rect = range.getBoundingClientRect()
    setToolbarPos({ x: rect.left + rect.width / 2, y: rect.top - 8 })
    setPendingSelection({ text, start, end })
  }, [])

  const handleAnnotationType = (type: AnnotationType) => {
    if (!pendingSelection) return
    add({
      type,
      selectedText: pendingSelection.text,
      rangeStart: pendingSelection.start,
      rangeEnd: pendingSelection.end,
      note: '',
    })
    setToolbarPos(null)
    setPendingSelection(null)
    setShowPanel(true)
    window.getSelection()?.removeAllRanges()
  }

  const handleNavigate = (ann: { rangeStart: number }) => {
    if (modalBodyRef.current) {
      modalBodyRef.current.scrollTop = 0
    }
  }

  const skillDisplayName = modalKey ? skillDisplayNames[modalKey] || modalKey : ''
  const modalTitle =
    modalType === 'interp'
      ? `【${modalKey}】原文解读`
      : modalType === 'skill'
        ? `【${skillDisplayName}】技能`
        : `【${modalKey}】原文`
  const rawBody =
    modalType === 'source'
      ? (sourceContent as unknown as Record<string, string>)[modalKey] ||
        '<p style="color:#8080a0;text-align:center;padding:40px 0">未找到该篇原文</p>'
      : modalType === 'interp'
        ? (interpContent as Record<string, string>)[modalKey] ||
          '<p style="color:#8080a0;text-align:center;padding:40px 0">未找到该篇解读内容</p>'
        : '' // skills use raw, not rendered
  const annotatedBody = injectAnnotations(rawBody, annotations)

  const proseClass =
    modalType === 'source'
      ? 'prose-source'
      : modalType === 'interp'
        ? 'prose-interp'
        : ''

  // Load raw skill content
  useEffect(() => {
    if (modalType !== 'skill' || !modalKey) { setSkillRawText(''); return }
    const loader = (skillRawContent as Record<string, () => Promise<string>>)[modalKey]
    if (!loader) return
    loader().then(text => setSkillRawText(text))
  }, [modalType, modalKey])

  // Copy handler
  const handleCopy = async () => {
    if (modalType !== 'skill') return
    const raw = modalKey ? (skillRawContent as Record<string, () => Promise<string>>)[modalKey] : null
    if (!raw) return
    const text = await raw()
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
      </Helmet>
      <div className="page-wrapper">
        <div className="top-actions">
          <SearchBar scopeSlug={slug} />
        </div>
        <div className="page-container-narrow">
          {/* Hero */}
          <div className="book-hero">
            <div className="book-hero-glow" />
            <h1
              style={{
                fontSize: 24,
                color: 'var(--color-gold)',
                fontWeight: 'bold',
                letterSpacing: 5,
                marginBottom: 4,
                textShadow: '0 0 30px var(--color-gold-glow)',
              }}
            >
              《{book.title}》
            </h1>

            {book.author && (
              <p style={{ fontSize: 13, color: 'var(--color-text-dim)', marginBottom: 4 }}>
                {book.author}
              </p>
            )}
            {book.description && (
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--color-text-dim)',
                  lineHeight: 1.6,
                  maxWidth: 600,
                  margin: '0 auto 8px',
                }}
              >
                {book.description}
              </p>
            )}

            <div className="book-hero-stats">
              <div className="stat-item">
                <div className="stat-num">{book.total}</div>
                <div className="stat-label">全篇章</div>
              </div>
              <div className="stat-item">
                <div className="stat-num-green">{book.done}</div>
                <div className="stat-label">已解读</div>
              </div>
            </div>

            <Link to="/" className="back-link" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <ArrowLeft size={14} /> 返回典籍首页
            </Link>
          </div>

          {/* Content */}
          <div className="container-wide animate-fade-up">
            <ReadList
              book={book}
              onChapterClick={n => openModal('interp', n)}
              onSourceClick={n => openModal('source', n)}
              onSkillClick={sk => openModal('skill', sk)}
              sourceNames={bookSourceKeys}
              skillToInterp={skillToInterp}
              interpToSkill={interpToSkill}
            />
          </div>

          {/* Modal */}
          {modalType && (
            <div
              className="modal-backdrop"
              onClick={e => {
                if ((e.target as HTMLElement).classList.contains('modal-backdrop')) closeModal()
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
                  <div style={{ flex: 1 }} />
                  {modalKey && modalType === 'interp' && (
                    <div className="action-popover-container">
                      <button
                        className="action-popover-btn"
                        onClick={() => setActionPopoverOpen(v => !v)}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {actionPopoverOpen && (
                        <div className="action-popover">
                          <button
                            className="action-popover-item"
                            onClick={() => { setShowPanel(v => !v); setActionPopoverOpen(false) }}
                          >
                            <Bookmark size={14} />
                            批注{annotations.length > 0 ? ` (${annotations.length})` : ''}
                          </button>
                          <button
                            className="action-popover-item"
                            onClick={() => { toggleBookmark(modalKey); setActionPopoverOpen(false) }}
                          >
                            <Star size={14} fill={isBookmarked(modalKey) ? 'var(--color-gold)' : 'none'} />
                            {isBookmarked(modalKey) ? '已收藏' : '收藏'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  {modalType === 'skill' && modalKey && (
                    <button
                      onClick={handleCopy}
                      style={{
                        background: 'none',
                        border: '1px solid var(--color-border)',
                        borderRadius: 6,
                        padding: '6px 10px',
                        cursor: 'pointer',
                        color: copied ? 'var(--color-green)' : 'var(--color-text-dim)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 13,
                        transition: 'all 0.2s',
                      }}
                    >
                      <Copy size={14} />
                      {copied ? '已复制' : '复制'}
                    </button>
                  )}
                  <button className="btn-back" onClick={closeModal}>
                    <X size={18} />
                  </button>
                </div>

                {/* Reading Progress Bar */}
                <ReadingProgress scrollRef={modalBodyRef} />

                {/* Content with optional TOC sidebar */}
                <div className="modal-content-wrapper">
                  {modalType === 'interp' && (
                    <TocSidebar
                      html={rawBody}
                      scrollRef={modalBodyRef}
                      open={tocOpen}
                      onClose={() => setTocOpen(false)}
                    />
                  )}
                  <div
                    className="modal-body"
                    ref={modalBodyRef}
                    onMouseUp={modalType !== 'skill' ? handleMouseUp : undefined}
                  >
                    {modalType === 'skill' ? (
                      <pre className="skill-raw-body"><code>{skillRawText || '加载中...'}</code></pre>
                    ) : (
                      <div className={proseClass} dangerouslySetInnerHTML={{ __html: annotatedBody }} />
                    )}
                  </div>
                </div>

                {/* Annotation Toolbar */}
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

                {/* Related items */}
                {modalKey && (
                  <div className="related-section">
                    {modalType === 'interp' && interpToSkill[modalKey]?.length > 0 && (
                      <div className="related-tags">
                        <span className="related-label">关联技能</span>
                        {interpToSkill[modalKey].map(sk => (
                          <button
                            key={sk}
                            className="related-tag related-tag-skill"
                            onClick={() => openModal('skill', sk)}
                          >
                            {skillDisplayNames[sk] || sk}
                          </button>
                        ))}
                      </div>
                    )}
                    {modalType === 'skill' && skillToInterp[modalKey]?.length > 0 && (
                      <div className="related-tags">
                        <span className="related-label">相关篇目</span>
                        {skillToInterp[modalKey].map(ch => (
                          <button
                            key={ch}
                            className="related-tag related-tag-chapter"
                            onClick={() => openModal('interp', ch)}
                          >
                            {ch}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <BackToTop scrollRef={modalBodyRef} />
              </div>

              {/* Annotation Panel */}
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
          )}
        </div>
      </div>
    </>
  )
}

export default BookApp
