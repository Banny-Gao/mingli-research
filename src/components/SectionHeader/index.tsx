import type { ArtSection } from '../../data/book-types'

export interface CategoryTree {
  section: ArtSection
  categories: string[]
}

interface Props {
  tree: CategoryTree[]
  activeSection: ArtSection
  activeCategory: string
  onSelectCategory: (category: string) => void
  onSelectSection?: (section: ArtSection) => void
}

const SectionHeader = ({ tree, activeSection, activeCategory, onSelectCategory, onSelectSection }: Props) => (
  <nav className="section-nav" aria-label="术数分类导航">
    {/* Mobile: 术数标签行（水平滚动） */}
    {onSelectSection && (
      <div className="section-nav-labels">
        {tree.map(({ section }) => (
          <button
            key={section}
            className={`section-nav-label${section === activeSection ? ' active' : ''}`}
            onClick={() => onSelectSection(section)}
          >
            {section}
          </button>
        ))}
      </div>
    )}

    {/* PC: 分组结构 — 术数 → 子类；Mobile: 仅展示 active 术数 */}
    {tree.map(({ section, categories }) => (
      <div
        key={section}
        className={`section-nav-block${section !== activeSection && onSelectSection ? ' hidden-mobile' : ''}`}
      >
        {/* PC 术数标签（纯展示），Mobile 隐藏（已由 tabs row 展示） */}
        <span className="section-nav-label">{section}</span>

        <div className="section-nav-items">
          {categories.map(cat => {
            
            return (
              <button
                key={cat}
                className={`section-nav-item${cat === activeCategory ? ' active' : ''}`}
                onClick={() => onSelectCategory(cat)}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>
    ))}
  </nav>
)

export default SectionHeader
