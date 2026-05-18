import React, { useState, useEffect } from 'react'
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft } from 'lucide-react'
import { books } from '../data/books'
import { getBookCompat, getBookAssoc } from '../data/registry'
import ReadList from '../components/ReadList'
import SearchBar from '../components/SearchBar'
import ModalReader from '../components/ModalReader'
import { useReadProgress, useGlobalProgress } from '../hooks/useProgress'

const BookApp: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const [modalType, setModalType] = useState<'interp' | 'skill' | 'source' | null>(null)
  const [modalKey, setModalKey] = useState('')
  const [scrollToText, setScrollToText] = useState<string | null>(null)
  const navigate = useNavigate()

  const bookSlug = slug || ''
  const book = books.find(b => b.slug === bookSlug)
  const bookCompat = getBookCompat(bookSlug)
  const bookAssoc = getBookAssoc(bookSlug)

  const skillContent = bookCompat.skillContent || {}
  const sourceContent = bookCompat.sourceContent || {}
  const interpToSkill = bookAssoc.interpToSkill || {}

  const { markRead } = useReadProgress(bookSlug)
  const { touchChapter } = useGlobalProgress()

  const bookSourceKeys = Object.keys(sourceContent) as unknown as string[]
  const skillKeys = Object.keys(skillContent || {})

  // Handle URL params for search navigation
  useEffect(() => {
    const open = searchParams.get('open')
    const key = searchParams.get('key')
    if (open && key) {
      const normalizedType = open === 'chapter' ? 'interp' : open
      setModalType(normalizedType as 'interp' | 'skill')
      setModalKey(decodeURIComponent(key))
      const match = searchParams.get('match')
      if (match) setScrollToText(decodeURIComponent(match))
    }
  }, [searchParams])

  const pageTitle = book ? `《${book.title}》- 命理学术中心` : '404 - 命理学术中心'
  const pageDesc = book ? `共${book.total}篇·已解读${book.done}篇·已有${skillKeys.length}个技能` : '未找到该典籍'

  if (!book) {
    return (
      <>
        <Helmet><title>404</title></Helmet>
        <div className="page-container">
          <div className="not-found">
            <div className="not-found-inner">
              <div className="not-found-code">404</div>
              <p className="not-found-msg">未找到该典籍</p>
              <Link to="/" className="btn-primary">返回首页</Link>
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
    setScrollToText(null)
    navigate(`/#/${bookSlug}`, { replace: true })
  }

  const openModal = (type: 'interp' | 'skill' | 'source', key: string) => {
    setModalType(type)
    setModalKey(key)
    if (bookSlug) touchChapter(bookSlug, key)
  }

  return (
    <>
      <Helmet><title>{pageTitle}</title><meta name="description" content={pageDesc} /></Helmet>
      <div className="page-wrapper">
        <div className="top-actions"><SearchBar scopeSlug={bookSlug} /></div>
        <div className="page-container-narrow">
          <div className="book-hero">
            <div className="book-hero-glow" />
            <h1 className="text-xl text-[var(--color-gold)] font-bold tracking-[5px] mb-1" style={{ textShadow: '0 0 30px var(--color-gold-glow)' }}>
              《{book.title}》
            </h1>
            {book.author && <p className="text-xs text-[var(--color-text-dim)] mb-1">{book.author}</p>}
            {book.description && <p className="text-xs text-[var(--color-text-dim)] leading-relaxed max-w-[600px] mx-auto mb-2">{book.description}</p>}
            <div className="book-hero-stats">
              <div className="stat-item"><div className="stat-num">{book.total}</div><div className="stat-label">全篇章</div></div>
              <div className="stat-item"><div className="stat-num-green">{book.done}</div><div className="stat-label">已解读</div></div>
            </div>
            <Link to="/" className="back-link flex items-center gap-1"><ArrowLeft size={14} /> 返回典籍首页</Link>
          </div>
          <div className="container-wide animate-fade-up">
            <ReadList book={book} onChapterClick={n => openModal('interp', n)} onSourceClick={n => openModal('source', n)} onSkillClick={sk => openModal('skill', sk)} sourceNames={bookSourceKeys} interpToSkill={interpToSkill} />
          </div>
          {modalType && (
            <ModalReader
              chapters={book.chapters}
              bookSlug={bookSlug}
              modalType={modalType}
              modalKey={modalKey}
              scrollToText={scrollToText}
              onClose={closeModal}
              onNavigate={openModal}
              onScrollToTextConsumed={() => setScrollToText(null)}
            />
          )}
        </div>
      </div>
    </>
  )
}

export default BookApp
