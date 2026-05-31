import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ChevronLeft } from 'lucide-react'
import { buttonVariants } from '../components/ui/button'
import { cn } from '../lib/utils'
import { books } from '../data/books'
import { getBook } from '../data/registry'
import ReadList from '../components/ReadList'
import SearchBar from '../components/SearchBar'
import { useReader } from '../hooks/useReader'

const BookApp = () => {
  const { slug } = useParams<{ slug: string }>()
  const { openReader } = useReader()

  const bookSlug = slug || ''
  const book = books.find(b => b.slug === bookSlug)
  const bookCompat = getBook(bookSlug)

  const skillContent = (bookCompat.skillContent as Record<string, any>) || {}
  const sourceContent = (bookCompat.sourceContent as Record<string, any>) || {}
  const chapterToSkills = bookCompat.chapterToSkills || {}

  const bookSourceKeys = Object.keys(sourceContent) as unknown as string[]
  const skillKeys = Object.keys(skillContent || {})

  // Handle URL params for search navigation — extract from query string on mount, clean up after
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const open = params.get('open')
    const key = params.get('key')
    if (!open || !key) return
    const normalizedType = open === 'chapter' ? 'interp' : open
    openReader({
      bookSlug,
      modalType: normalizedType as 'interp' | 'skill' | 'source',
      modalKey: decodeURIComponent(key),
      scrollToText: params.get('match') ? decodeURIComponent(params.get('match')!) : undefined,
    })
    window.history.replaceState(null, '', window.location.pathname)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pageTitle = book ? `《${book.title}》- 玄学文化馆` : '404 - 玄学文化馆'
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
              <Link to="/" className={cn(buttonVariants({ variant: 'outline' }))}>返回首页</Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  const openModal = (type: 'interp' | 'skill' | 'source', key: string) => {
    openReader({ bookSlug, modalType: type, modalKey: key })
  }

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.origin + window.location.pathname} />
        <link rel="canonical" href={window.location.origin + window.location.pathname} />
      </Helmet>
      <div className="page-wrapper">
        <div className="top-actions">
          <Link to="/" className="back-link flex items-center gap-1">
            <ChevronLeft size={14} />
          </Link>
          <SearchBar scopeSlug={bookSlug} />
        </div>
        <div className="book-hero-glow" />
        
        <div className="page-container-narrow">
          <div className="book-hero">
            <h1 className="text-xl text-[var(--color-gold)] font-bold tracking-[5px] mb-1 hero-title-glow">
              《{book.title}》
            </h1>
            {book.author && (
              <p className="text-xs text-[var(--color-text-dim)] mb-1">{book.author}</p>
            )}
            {book.description && (
              <p className="text-xs text-[var(--color-text-dim)] leading-relaxed max-w-[600px] mx-auto mb-2">
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
          </div>
          <div className="container-wide animate-fade-up">
            <ReadList
              book={book}
              onChapterClick={n => openModal('interp', n)}
              onSourceClick={n => openModal('source', n)}
              onSkillClick={sk => openModal('skill', sk)}
              sourceNames={bookSourceKeys}
              chapterToSkills={chapterToSkills}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default BookApp
