import React from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { books } from '../data/books'
import SearchBar from '../components/SearchBar'
import { useGlobalProgress } from '../hooks/useProgress'
import { ThemeToggle, LangToggle } from '../main'

const Landing: React.FC = () => {
  const { t } = useTranslation()
  const gp = useGlobalProgress()
  return (
    <div className="page-container">
      <Helmet>
        <title>{t('landing.title')} - {t('landing.subtitle')}</title>
        <meta
          name="description"
          content={t('landing.metaDesc') || 'Mingli Research Center'}
        />
      </Helmet>

      {/* Hero */}
      <div className="hero-section">
        <div className="hero-glow" />
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 16,
            width: '100%',
            maxWidth: 900,
            marginBottom: 16,
          }}
        >
          <SearchBar />
          <LangToggle />
          <ThemeToggle />
          {gp.streakDays > 0 && (
            <div className="streak-badge">
              🔥 连续{gp.streakDays}天
            </div>
          )}
        </div>
        <div className="hero-badge">{t('landing.heroBadge')}</div>
        <h1 className="hero-title">{t('landing.title')}</h1>
        <p className="hero-subtitle">{t('landing.subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="hero-stats">
        <div className="stat-item">
          <div className="stat-num">{books.length}</div>
          <div className="stat-label">{t('landing.stats.books')}</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">{books.reduce((s, b) => s + b.total, 0)}</div>
          <div className="stat-label">{t('landing.stats.chapters')}</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">{books.reduce((s, b) => s + b.done, 0)}</div>
          <div className="stat-label">{t('landing.stats.done')}</div>
        </div>
      </div>

      {/* Book Grid */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16, width: '100%', maxWidth: 900 }}>
        <Link to="/notes" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 16px', background: 'rgba(122,79,170,0.1)', border: '1px solid var(--color-border-hover)', borderRadius: 8, color: 'var(--color-purple-light)', fontSize: 13, textDecoration: 'none', transition: 'all 0.2s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(122,79,170,0.2)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(122,79,170,0.1)' }}
        >
          📝 {t('nav.notes')}
        </Link>
      </div>
      <div className="book-grid">
        {books.map(book => (
          <Link key={book.slug} to={`/${book.slug}`} className="book-card">
            <div className="book-card-header">
              <div>
                <h2 className="book-card-title">《{book.title}》</h2>
                <p className="book-card-meta">原著：刘伯温（托名）｜注疏：任铁樵</p>
              </div>
              <div className="book-card-count">
                <div className="book-card-count-num">{book.total}</div>
                <div className="book-card-count-label">篇章</div>
              </div>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${book.total > 0 ? (book.done / book.total) * 100 : 0}%` }}
              />
            </div>
            <div className="progress-meta">
              <span>{t('landing.progress').replace('{done}', String(book.done))}</span>
              <span>{book.total > 0 ? t('landing.percent').replace('{percent}', String(Math.round((book.done / book.total) * 100))) : '0%'}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className="footer">
        {t('landing.footer')}
      </div>
    </div>
  )
}

export default Landing
