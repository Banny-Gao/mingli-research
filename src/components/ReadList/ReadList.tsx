import { useState } from 'react'
import type { Book, ChapterInfo } from '../../data/book-types'
import { ChevronDown } from 'lucide-react'
import './ReadList.less'

interface Props {
  book: Book
  onChapterClick: (name: string) => void
  onSourceClick: (name: string) => void
  onSkillClick?: (skillKey: string) => void
  sourceNames: string[]
  interpToSkill?: Record<string, string[]>
}

const ReadList = ({
  book,
  onChapterClick,
  onSourceClick,
  onSkillClick,
  sourceNames,
  interpToSkill,
}: Props) => {
  const categories = new Map<string, ChapterInfo[]>()
  for (const ch of book.chapters) {
    const cat = ch.category || '未分类'
    if (!categories.has(cat)) categories.set(cat, [])
    categories.get(cat)!.push(ch)
  }

  return (
    <>
      {Array.from(categories.entries()).map(([category, chapters]) => (
        <CategorySection
          key={category}
          category={category}
          chapters={chapters}
          onChapterClick={onChapterClick}
          onSourceClick={onSourceClick}
          onSkillClick={onSkillClick}
          sourceNames={sourceNames}
          interpToSkill={interpToSkill}
        />
      ))}
    </>
  )
}

function CategorySection({
  category,
  chapters,
  onChapterClick,
  onSourceClick,
  onSkillClick,
  sourceNames,
  interpToSkill,
}: {
  category: string
  chapters: ChapterInfo[]
  onChapterClick: (name: string) => void
  onSourceClick: (name: string) => void
  onSkillClick?: (skillKey: string) => void
  sourceNames: string[]
  interpToSkill?: Record<string, string[]>
}) {
  const [collapsed, setCollapsed] = useState(false)
  const doneCount = chapters.filter(c => c.isDone).length

  const ACTION_CONFIG = [
    {
      key: 'source',
      label: '原文',
      condition: (ch: ChapterInfo) => sourceNames.includes(ch.name),
      action: (name: string) => onSourceClick(name),
      className: 'btn-text chapter-action action-source',
    },
    {
      key: 'interp',
      label: '解读',
      condition: (ch: ChapterInfo) => ch.isDone,
      action: (name: string) => onChapterClick(name),
      className: 'btn-text chapter-action',
    },
    {
      key: 'skill',
      label: '技能',
      condition: (ch: ChapterInfo) => !!interpToSkill?.[ch.name]?.length,
      action: (_n: string) => onSkillClick?.(interpToSkill?.[_n]?.[0] ?? ''),
      className: 'btn-text chapter-action action-skill',
    },
  ] as const

  return (
    <div className="category-section">
      <div
        className="category-header flex items-center justify-between cursor-pointer mb-3"
        onClick={() => setCollapsed(v => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') setCollapsed(v => !v)
        }}
      >
        <div className="flex items-center gap-2">
          <ChevronDown
            size={14}
            className={['category-chevron', collapsed ? ' rotated' : ''].join(' ')}
          />
          <span className="font-semibold text-sm">{category}</span>
        </div>
        <span className="section-badge text-xs">
          {doneCount}/{chapters.length} 已解读
        </span>
      </div>
      {!collapsed && (
        <div className="chapter-list mb-3">
          {chapters.map(ch => {
            const validActions = ACTION_CONFIG.filter(cfg => cfg.condition(ch))
            return (
              <div key={ch.name} className={`chapter-row ${ch.isDone ? 'done' : 'undone'}`}>
                <div className="chapter-num">{ch.num}</div>
                <div className={`chapter-name ${ch.isDone ? 'done' : 'undone'}`}>{ch.name}</div>
                <div className="chapter-actions">
                  {validActions.map(cfg => (
                    <button
                      key={cfg.key}
                      className={cfg.className}
                      onClick={() => cfg.action(ch.name)}
                    >
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ReadList
