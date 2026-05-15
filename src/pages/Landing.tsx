import React from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { books } from '../data/books'
import SearchBar from '../components/SearchBar'
import { useGlobalProgress } from '../hooks/useProgress'
import { ThemeToggle } from '../main'

const Landing: React.FC = () => {
  const gp = useGlobalProgress()
  return (
    <div className="page-container">
      <Helmet>
        <title>命理学术中心 - 经典原文 · 专业注解 · 学术整理</title>
        <meta
          name="description"
          content="基于《渊海子平》《滴天髓》等正统子平经典，对经典著作进行系统性学术解读。"
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
          <ThemeToggle />
          {gp.streakDays > 0 && <div className="streak-badge">🔥 连续{gp.streakDays}天</div>}
        </div>
        <div className="hero-badge">正统子平学术</div>
        <h1 className="hero-title">命理学术中心</h1>
        <p className="hero-subtitle">经典原文 · 专业注解 · 学术整理</p>
      </div>

      {/* Stats */}
      <div className="hero-stats">
        <div className="stat-item">
          <div className="stat-num">{books.length}</div>
          <div className="stat-label">典籍</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">{books.reduce((s, b) => s + b.total, 0)}</div>
          <div className="stat-label">总篇章</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">{books.reduce((s, b) => s + b.done, 0)}</div>
          <div className="stat-label">已解读</div>
        </div>
      </div>

      {/* Book Grid */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: 16,
          width: '100%',
          maxWidth: 900,
        }}
      >
        <Link
          to="/notes"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 16px',
            background: 'rgba(122,79,170,0.1)',
            border: '1px solid var(--color-border-hover)',
            borderRadius: 8,
            color: 'var(--color-purple-light)',
            fontSize: 13,
            textDecoration: 'none',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLElement).style.background = 'rgba(122,79,170,0.2)'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLElement).style.background = 'rgba(122,79,170,0.1)'
          }}
        >
          📝 我的笔记
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
              <span>已解读 {book.done} 篇</span>
              <span>{book.total > 0 ? Math.round((book.done / book.total) * 100) : 0}% 完成</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className="footer">
        Hermes Agent · 学术整理 ·
        <a
          href="https://www.iwzbz.com"
          target="_blank"
          rel="noreferrer"
          style={{ color: 'var(--color-blue)' }}
        >
          iwzbz.com
        </a>
      </div>
    </div>
  )
}

export default Landing
