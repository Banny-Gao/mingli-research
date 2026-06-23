import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Wand2, ChevronLeft, BookOpen } from 'lucide-react'
import { CATEGORY_TREE, SECTION_ORDER } from '../data/category-tree'
import { skills, type Skill } from '../data/skills'
import { useReader } from '../hooks/useReader'

/**
 * 选第一个有 skill 的二级类别作为默认 activeCategory
 * 若该一级下没有 skill，fallback 到该一级下第一个有书的二级类别
 */
const getDefaultCategory = (section: string): string => {
  const node = CATEGORY_TREE.find(t => t.section === section)
  if (!node) return ''
  const firstWithSkill = node.categories.find(c =>
    skills.some(s => s.category === section && s.subcategory === c)
  )
  return firstWithSkill ?? node.categories[0] ?? ''
}

const Skills = () => {
  const [activeSection, setActiveSection] = useState<string>(
    SECTION_ORDER.find(s =>
      CATEGORY_TREE.find(t => t.section === s)?.categories.some(c =>
        skills.some(sk => sk.category === s && sk.subcategory === c)
      )
    ) ?? SECTION_ORDER[0]
  )
  const [activeCategory, setActiveCategory] = useState<string>(getDefaultCategory(activeSection))

  // 切换一级时自动重置二级
  const handleSectionChange = (section: string) => {
    setActiveSection(section)
    setActiveCategory(getDefaultCategory(section))
  }

  // 当前一级下可用的二级（按 CATEGORY_TREE 顺序）
  const subcategories = useMemo(
    () => CATEGORY_TREE.find(t => t.section === activeSection)?.categories ?? [],
    [activeSection]
  )

  // 当前二级下的 skill 列表
  const visibleSkills = useMemo(
    () => skills.filter(s => s.category === activeSection && s.subcategory === activeCategory),
    [activeSection, activeCategory]
  )

  // 是否有任何 skill（用于整体空态判断）
  const hasAnySkill = skills.length > 0

  return (
    <div className="page-wrapper">
      <Helmet>
        <title>技能列表 · 豫知学堂</title>
        <meta
          name="description"
          content="按术数类别聚合的 AI 可执行技能集，跨书沉淀，调用即得。"
        />
        <meta property="og:title" content="技能列表 · 豫知学堂" />
        <meta property="og:description" content="按术数类别聚合的 AI 可执行技能集" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.origin + window.location.pathname} />
        <link rel="canonical" href={window.location.origin + window.location.pathname} />
      </Helmet>

      <div className="top-actions">
        <Link to="/" className="back-link flex items-center gap-1">
          <ChevronLeft size={14} />
        </Link>
      </div>

      <div className="hero-glow" />

      <div className="page-container">
        <div className="hero-section">
          <h1 className="hero-title">技能列表</h1>
          <p className="hero-subtitle">按术数类别聚合 · 跨书沉淀 · 调用即得</p>
        </div>

        {!hasAnySkill ? (
          <div
            className="stat-label"
            style={{ textAlign: 'center', padding: '40px 0' }}
          >
            暂无技能，内容正在筹备中
          </div>
        ) : (
          <div className="section-group mb-8">
            <div className="section-layout">
              <div className="section-sidebar">
                <nav className="section-nav" aria-label="术数分类导航">
                  {/* 一级 tab */}
                  <div className="section-nav-labels">
                    {SECTION_ORDER.map(section => (
                      <button
                        key={section}
                        type="button"
                        className={`section-nav-label${section === activeSection ? ' active' : ''}`}
                        onClick={() => handleSectionChange(section)}
                      >
                        {section}
                      </button>
                    ))}
                  </div>
                  {/* 当前一级的二级 tab */}
                  <div className="section-nav-block">
                    <div className="section-nav-items">
                      {subcategories.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          className={`section-nav-item${cat === activeCategory ? ' active' : ''}`}
                          onClick={() => setActiveCategory(cat)}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </nav>
              </div>

              <div className="section-content">
                <div className="book-grid">
                  {visibleSkills.length > 0 ? (
                    visibleSkills.map(skill => (
                      <SkillCard
                        key={`${skill.category}/${skill.subcategory}/${skill.slug}`}
                        skill={skill}
                      />
                    ))
                  ) : (
                    <div
                      className="stat-label"
                      style={{ textAlign: 'center', padding: '40px 0', gridColumn: '1 / -1' }}
                    >
                      此分类暂无技能，内容正在筹备中
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const SkillCard = ({ skill }: { skill: Skill }) => {
  const { openReader } = useReader()

  const handleClick = () => {
    openReader({
      bookSlug: '__skill__',
      modalType: 'skill',
      modalKey: `${skill.category}/${skill.subcategory}/${skill.slug}`,
    })
  }

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className="book-card"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') handleClick()
      }}
      style={{ cursor: 'pointer' }}
    >
      <div className="book-card-info">
        <h2 className="book-card-title flex items-center gap-2">
          <Wand2 size={16} />
          {skill.displayName}
        </h2>
        <p className="book-card-meta">
          {skill.category} · {skill.subcategory} · {skill.type}
        </p>
      </div>
      <p className="book-card-desc">{skill.description}</p>
      <div className="book-card-meta flex items-center gap-1" style={{ marginTop: '8px' }}>
        <BookOpen size={12} />
        <span>
          {skill.rulesCount} 本书支撑 · 更新于 {skill.updated}
        </span>
      </div>
    </div>
  )
}

export default Skills
