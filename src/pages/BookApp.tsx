import React, { useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { books } from '../data/books'
import { interpContent, skillContent } from '../data/ditiansui-site'
import ReadList from '../components/ReadList'
import SkillGrid from '../components/SkillGrid'
import { ReadingProgress, BackToTop, TableOfContents } from '../components/ReadingTools'
import { useReadProgress, useBookmarks, useGlobalProgress } from '../hooks/useProgress'

const BookApp: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [activeTab, setActiveTab] = useState<'read' | 'skill'>('read')
  const [modalType, setModalType] = useState<'interp' | 'skill' | null>(null)
  const [modalKey, setModalKey] = useState('')
  const modalBodyRef = useRef<HTMLDivElement>(null)

  const book = books.find(b => b.slug === slug)
  const { markRead } = useReadProgress(slug || '')
  const { toggle: toggleBookmark, isBookmarked } = useBookmarks(slug || '')
  const { touchChapter } = useGlobalProgress()

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
  }

  const openModal = (type: 'interp' | 'skill', key: string) => {
    setModalType(type)
    setModalKey(key)
    if (slug) touchChapter(slug, key)
  }

  const modalTitle = modalType === 'interp' ? `【${modalKey}】原文解读` : `【${modalKey}】技能文件`
  const modalBody =
    modalType === 'interp'
      ? interpContent[modalKey] ||
        '<p style="color:#8080a0;text-align:center;padding:40px 0">未找到该篇解读内容</p>'
      : skillContent[modalKey] ||
        '<p style="color:#8080a0;text-align:center;padding:40px 0">未找到该技能内容</p>'

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
          <p style={{ fontSize: 13, color: 'var(--color-text-dim)', marginBottom: 24 }}>
            原著：刘伯温（托名）｜注疏：任铁樵｜评注：徐乐吾
          </p>
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
                  )}
                  <button className="btn-back" onClick={closeModal}>
                    ×
                  </button>
                </div>
              </div>
              {/* Reading Progress Bar */}
              <ReadingProgress scrollRef={modalBodyRef} />

              {/* TOC - only for interp */}
              {modalType === 'interp' && (
                <TableOfContents html={modalBody} scrollRef={modalBodyRef} />
              )}

              <div className="modal-body" ref={modalBodyRef}>
                <div className={proseClass} dangerouslySetInnerHTML={{ __html: modalBody }} />
              </div>

              {/* Back to Top */}
              <BackToTop scrollRef={modalBodyRef} />
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default BookApp
