import { useState, useRef, useLayoutEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Flame, FileText } from 'lucide-react'
import gsap from 'gsap'
import { books } from '../data/books'
import type { ArtSection } from '../data/book-types'
import SearchBar from '../components/SearchBar'
import SectionHeader, { type CategoryTree } from '../components/SectionHeader'
import { useGlobalProgress } from '../hooks/useProgress'
import { ThemeToggle } from '../components/ThemeToggle'

const SECTION_ORDER: ArtSection[] = ['命', '医', '山', '相', '卜']

const CATEGORY_TREE: CategoryTree[] = [
  { section: '山', categories: ['拳法'] },
  { section: '医', categories: ['中医'] },
  { section: '命', categories: ['八字', '紫微斗数', '七政四余'] },
  { section: '相', categories: ['地相', '人相', '星相'] },
  { section: '卜', categories: ['易经', '六爻', '梅花易数', '奇门遁甲', '大六壬'] },
]

const Landing = () => {
  const gp = useGlobalProgress()
  const [activeSection, setActiveSection] = useState<ArtSection>('命')
  const [activeCategory, setActiveCategory] = useState('八字')
  const gridRef = useRef<HTMLDivElement>(null)
  const ctxRef = useRef<gsap.Context | null>(null)

  const booksBySection = SECTION_ORDER.reduce<Record<ArtSection, typeof books>>(
    (acc, section) => { acc[section] = books.filter(b => b.section === section); return acc },
    {} as Record<ArtSection, typeof books>
  )

  const bookCount = (section: ArtSection, cat: string) =>
    booksBySection[section].filter(b => b.category === cat).length

  // 切换术数时默认选第一个有书的类别
  const handleSectionChange = (section: ArtSection) => {
    setActiveSection(section)
    const cats = CATEGORY_TREE.find(t => t.section === section)?.categories
    const first = cats?.find(c => bookCount(section, c) > 0) || cats?.[0] || activeCategory
    setActiveCategory(first)
  }

  const visibleBooks = booksBySection[activeSection].filter(b => b.category === activeCategory)
  const progressPercent = (done: number, total: number) =>
    total > 0 ? Math.round((done / total) * 100) : 0

  // GSAP 入场动画
  useLayoutEffect(() => {
    if (!gridRef.current) return
    ctxRef.current?.revert()
    ctxRef.current = gsap.context(() => {
      gsap.fromTo(gridRef.current,
        { x: 60, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out', overwrite: 'auto' }
      )
    }, gridRef)
    return () => ctxRef.current?.revert()
  }, [activeSection, activeCategory])

  return (
    <div className="page-wrapper">
      <Helmet>
        <title>豫知学堂 · 传统国学</title>
        <meta name="description" content="基于《渊海子平》《滴天髓》等正统子平经典，对经典著作进行系统解读。" />
        <meta property="og:title" content="豫知学堂 · 传统国学" />
        <meta property="og:description" content="基于《渊海子平》《滴天髓》等正统子平经典，对经典著作进行系统解读。" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.origin + window.location.pathname} />
        <link rel="canonical" href={window.location.origin + window.location.pathname} />
      </Helmet>

      <div className="top-actions">
        {gp.streakDays > 0 && (
          <div className="streak-badge">
            <Flame size={16} fill="var(--color-gold)" color="var(--color-gold)" />
            <div className="streak-tooltip">坚持学习，连续{gp.streakDays}天不间断</div>
          </div>
        )}
        <SearchBar />
        <ThemeToggle />
      </div>

      <div className="page-container">
        <div className="hero-section">
          <div className="hero-glow" />
          <h1 className="hero-title">豫知学堂</h1>
          <p className="hero-subtitle">经典原文 · 系统解读 · 技能沉淀</p>
        </div>

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

        <div className="flex justify-end mb-5 w-full max-w-[900px]">
          <Link to="/notes" className="notes-cta-btn flex items-center gap-1.5">
            <FileText size={16} /> 个人中心
          </Link>
        </div>

        <div className="section-group mb-8">
          <div className="section-layout">
            <div className="section-sidebar">
              <SectionHeader
                tree={CATEGORY_TREE}
                activeSection={activeSection}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
                onSelectSection={handleSectionChange}
              />
            </div>
            <div className="section-content" ref={gridRef}>
              <div className="book-grid">
                {visibleBooks.length > 0 ? (
                  visibleBooks.map(book => (
                    <Link
                      key={book.slug}
                      to={`/books/${book.section}/${book.slug}`}
                      className="book-card"
                    >
                      <div className="book-card-info">
                        <h2 className="book-card-title">《{book.title}》</h2>
                        <p className="book-card-meta">{book.author || ''}</p>
                      </div>
                      {book.description && <p className="book-card-desc">{book.description}</p>}
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progressPercent(book.done, book.total)}%` }} />
                      </div>
                      <div className="progress-meta">
                        <span>已解读 {book.done} 篇</span>
                        <span>{progressPercent(book.done, book.total)}% 完成</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="stat-label" style={{ textAlign: 'center', padding: '40px 0', gridColumn: '1 / -1' }}>
                    此分类暂无典籍，内容正在筹备中
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Landing
