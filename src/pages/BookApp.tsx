import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { books } from '../data/books'
import { interpContent, skillContent } from '../data/ditiansui-site'
import { interpToSkill, skillToInterp } from '../data/ditiansui-site/assoc'
import ReadList from '../components/ReadList'
import SkillGrid from '../components/SkillGrid'
import { ReadingProgress, BackToTop, TableOfContents } from '../components/ReadingTools'
import AnnotationToolbar from '../components/AnnotationToolbar'
import AnnotationPanel from '../components/AnnotationPanel'
import { useReadProgress, useBookmarks, useGlobalProgress } from '../hooks/useProgress'
import { useAnnotations } from '../hooks/useAnnotations'
import type { AnnotationType } from '../hooks/useAnnotations'
import { ThemeToggle } from '../main'

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
  const [activeTab, setActiveTab] = useState<'read' | 'skill'>('read')
  const [modalType, setModalType] = useState<'interp' | 'skill' | null>(null)
  const [modalKey, setModalKey] = useState('')
  const modalBodyRef = useRef<HTMLDivElement>(null)
  const [toolbarPos, setToolbarPos] = useState<{ x: number; y: number } | null>(null)
  const [showPanel, setShowPanel] = useState(false)
  const [pendingSelection, setPendingSelection] = useState<{
    text: string
    start: number
    end: number
  } | null>(null)

  const book = books.find(b => b.slug === slug)
  const { markRead } = useReadProgress(slug || '')
  const { toggle: toggleBookmark, isBookmarked } = useBookmarks(slug || '')
  const { touchChapter } = useGlobalProgress()
  const { annotations, add, remove, updateNote } = useAnnotations(slug || '', modalKey)

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
  const pageDesc = book ? `${book.title}，已解读 ${book.done}/${book.total} 篇` : '未找到该典籍'

  if (!book) {
    return (
      <>
        <Helmet>
          <title>404 - 命理学术中心</title>
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
  }

  const openModal = (type: 'interp' | 'skill', key: string) => {
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

  const modalTitle = modalType === 'interp' ? `【${modalKey}】原文解读` : `【${modalKey}】技能文件`
  const rawBody =
    modalType === 'interp'
      ? interpContent[modalKey] ||
        '<p style="color:#8080a0;text-align:center;padding:40px 0">未找到该篇解读内容</p>'
      : skillContent[modalKey] ||
        '<p style="color:#8080a0;text-align:center;padding:40px 0">未找到该技能内容</p>'
  const annotatedBody = injectAnnotations(rawBody, annotations)

  const proseClass = modalType === 'interp' ? 'prose-interp' : 'prose-skill'

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
      </Helmet>
      <div className="page-container-narrow">
        {/* Hero */}
        <div className="book-hero">
          <div className="book-hero-glow" />
          <div className="hero-badge">正统子平 · 任铁樵增注本</div>
          <h1
            style={{
              fontSize: 24,
              color: 'var(--color-gold)',
              fontWeight: 'bold',
              letterSpacing: 5,
              marginBottom: 8,
              textShadow: '0 0 30px var(--color-gold-glow)',
            }}
          >
            《{book.title}》
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-dim)', marginBottom: 16 }}>
            原著：刘伯温（托名）｜注疏：任铁樵｜评注：徐乐吾
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <ThemeToggle />
            <div className="book-hero-stats">
              <div className="stat-item">
                <div className="stat-num">{book.total}</div>
                <div className="stat-label">全篇章</div>
              </div>
              <div className="stat-item">
                <div className="stat-num-green">{book.done}</div>
                <div className="stat-label">已解读</div>
              </div>
              <div className="stat-item">
                <div className="stat-num-purple">{book.skills.length}</div>
                <div className="stat-label">技能文件</div>
              </div>
            </div>
          </div>
        </div>

        {/* Back */}
        <div className="container-wide" style={{ marginBottom: 24 }}>
          <Link to="/" className="back-link">
            ← 返回典籍首页
          </Link>
        </div>

        {/* Tab Bar */}
        <div className="tab-bar">
          <button
            className={`tab-btn ${activeTab === 'read' ? 'active' : ''}`}
            onClick={() => setActiveTab('read')}
          >
            原文解读
          </button>
          <button
            className={`tab-btn ${activeTab === 'skill' ? 'active' : ''}`}
            onClick={() => setActiveTab('skill')}
          >
            技能库
          </button>
        </div>

        {/* Content */}
        <div className="container-wide animate-fade-up">
          {activeTab === 'read' && (
            <ReadList book={book} onChapterClick={n => openModal('interp', n)} />
          )}
          {activeTab === 'skill' && (
            <SkillGrid book={book} onSkillClick={n => openModal('skill', n)} />
          )}
        </div>

        {/* Modal */}
        {modalType && (
          <div
            className="modal-backdrop"
            onClick={e => {
              if ((e.target as HTMLElement).classList.contains('modal-backdrop')) closeModal()
            }}
          >
            <div className="modal-card" style={{ maxHeight: '90vh' }}>
              <div className="modal-header">
                <span className="modal-title">{modalTitle}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {modalKey && (
                    <>
                      <button
                        onClick={() => setShowPanel(v => !v)}
                        style={{
                          background: 'none',
                          border: '1px solid var(--color-border-hover)',
                          borderRadius: 6,
                          padding: '4px 10px',
                          cursor: 'pointer',
                          color: showPanel ? 'var(--color-gold)' : 'var(--color-text-dim)',
                          fontSize: 13,
                          transition: 'all 0.2s',
                        }}
                      >
                        批注{annotations.length > 0 ? ` (${annotations.length})` : ''}
                      </button>
                      <button
                        onClick={() => toggleBookmark(modalKey)}
                        style={{
                          background: 'none',
                          border: '1px solid var(--color-border-hover)',
                          borderRadius: 6,
                          padding: '4px 10px',
                          cursor: 'pointer',
                          color: isBookmarked(modalKey)
                            ? 'var(--color-gold)'
                            : 'var(--color-text-dim)',
                          fontSize: 13,
                          transition: 'all 0.2s',
                        }}
                      >
                        {isBookmarked(modalKey) ? '★ 已收藏' : '☆ 收藏'}
                      </button>
                    </>
                  )}
                  <button className="btn-back" onClick={closeModal}>
                    ×
                  </button>
                  <button className="btn-back" onClick={() => window.print()} title="打印">
                    ⎙
                  </button>
                </div>
              </div>

              {/* Reading Progress Bar */}
              <ReadingProgress scrollRef={modalBodyRef} />

              {/* TOC - only for interp */}
              {modalType === 'interp' && (
                <TableOfContents html={rawBody} scrollRef={modalBodyRef} />
              )}

              <div className="modal-body" ref={modalBodyRef} onMouseUp={handleMouseUp}>
                <div className={proseClass} dangerouslySetInnerHTML={{ __html: annotatedBody }} />
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
                          {sk}
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
              />
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default BookApp
