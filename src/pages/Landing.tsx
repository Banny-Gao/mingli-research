import { useState, useRef, useLayoutEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { UserStar } from 'lucide-react'
import gsap from 'gsap'
import { books } from '../data/books'
import type { ArtSection } from '../data/book-types'
import SearchBar from '../components/SearchBar'
import SectionHeader from '../components/SectionHeader'
import { ThemeToggle } from '../components/ThemeToggle'
import { CATEGORY_TREE, SECTION_ORDER } from '../data/category-tree'

const Landing = () => {
  const [activeSection, setActiveSection] = useState<ArtSection>('命')
  const [activeCategory, setActiveCategory] = useState('八字')
  const gridRef = useRef<HTMLDivElement>(null)
  const ctxRef = useRef<gsap.Context | null>(null)

  const booksBySection = SECTION_ORDER.reduce<Record<ArtSection, typeof books>>(
    (acc, section) => {
      acc[section] = books.filter(b => b.section === section)
      return acc
    },
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
      gsap.fromTo(
        gridRef.current,
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
        <meta
          name="description"
          content="基于《渊海子平》《滴天髓》等正统子平经典，对经典著作进行系统解读。"
        />
        <meta property="og:title" content="豫知学堂 · 传统国学" />
        <meta
          property="og:description"
          content="基于《渊海子平》《滴天髓》等正统子平经典，对经典著作进行系统解读。"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.origin + window.location.pathname} />
        <link rel="canonical" href={window.location.origin + window.location.pathname} />
      </Helmet>

      <div className="top-actions">
        <Link to="/notes">
          <UserStar color="var(--color-purple-light)" size={20} />
        </Link>
        <SearchBar />
        <ThemeToggle />
      </div>

      <div className="hero-glow" />

      <div className="page-container">
        <div className="hero-section">
          <h1 className="hero-title">豫知学堂</h1>
          <p className="hero-subtitle">经典原文 · 系统解读 · 技能沉淀</p>
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
                        <div
                          className="progress-fill"
                          style={{ width: `${progressPercent(book.done, book.total)}%` }}
                        />
                      </div>
                    </Link>
                  ))
                ) : (
                  <div
                    className="stat-label"
                    style={{ textAlign: 'center', padding: '40px 0', gridColumn: '1 / -1' }}
                  >
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
