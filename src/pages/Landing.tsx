import React from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Flame, FileText } from 'lucide-react'
import { books } from '../data/books'
import type { ArtSection } from '../data/book-types'
import SearchBar from '../components/SearchBar'
import { useGlobalProgress } from '../hooks/useProgress'
import { ThemeToggle } from '../components/ThemeToggle'

const SECTION_ORDER: ArtSection[] = ['命', '医', '山', '相', '卜']

const Landing: React.FC = () => {
  const gp = useGlobalProgress()

  const booksBySection = SECTION_ORDER.reduce<Record<ArtSection, typeof books>>((acc, sec) => {
    acc[sec] = books.filter(b => b.section === sec)
    return acc
  }, {} as Record<ArtSection, typeof books>)

  const activeSections = SECTION_ORDER.filter(sec => booksBySection[sec].length > 0)

  return (
    <div className="page-wrapper">
      <Helmet>
        <title>豫知五行 · 传统国学 </title>
        <meta
          name="description"
          content="基于《渊海子平》《滴天髓》等正统子平经典，对经典著作进行系统性学术解读。"
        />
      </Helmet>

      {/* 顶部悬浮功能区 */}
      <div className="top-actions">
        {gp.streakDays > 0 && (
          <div className="streak-badge">
            <Flame size={16} fill="var(--color-gold)" color="var(--color-gold)" />
            <div className="streak-tooltip">坚持学习命理经典，连续{gp.streakDays}天不间断</div>
          </div>
        )}

        <SearchBar />

        <ThemeToggle />
      </div>

      <div className="page-container">
        {/* Hero */}
        <div className="hero-section">
          <div className="hero-glow" />
          <h1 className="hero-title">豫知学堂</h1>
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

        {/* 笔记入口 */}
        <div className="flex justify-end mb-5 w-full max-w-[900px]">
          <Link
            to="/notes"
            className="notes-cta-btn flex items-center gap-1.5"
          >
            <FileText size={16} /> 个人中心
          </Link>
        </div>

        {/* Book Grid by Section */}
        {activeSections.map(sec => (
          <div key={sec} className="section-group mb-8">
            <h2 className="section-header">{sec}</h2>
            <div className="book-grid">
              {booksBySection[sec].map(book => (
                <Link key={book.slug} to={`/books/${book.section}/${book.slug}`} className="book-card">
                  <div className="book-card-info">
                    <h2 className="book-card-title">《{book.title}》</h2>
                    <p className="book-card-meta">{book.author || ''}</p>
                  </div>
                  {book.description && <p className="book-card-desc">{book.description}</p>}
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
          </div>
        ))}
      </div>
    </div>
  )
}

export default Landing
