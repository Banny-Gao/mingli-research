import React, { useState } from 'react'
import { Book, ChapterInfo } from '../data/books'
import { ChevronDown } from 'lucide-react'

interface Props {
  book: Book
  onChapterClick: (name: string) => void
  onSourceClick: (name: string) => void
  onSkillClick?: (skillKey: string) => void
  sourceNames: string[]
  interpToSkill?: Record<string, string[]>
}

const ReadList: React.FC<Props> = ({
  book,
  onChapterClick,
  onSourceClick,
  onSkillClick,
  sourceNames,
  interpToSkill,
}) => {
  const categories = new Map<string, ChapterInfo[]>()
  for (const ch of book.chapters) {
    const cat = ch.category || '未分类'
    if (!categories.has(cat)) categories.set(cat, [])
    categories.get(cat)!.push(ch)
  }

  return (
    <>
      <div className="section-header">
        <span className="section-title">篇目总览</span>
        <span className="section-badge">
          共{book.total}篇 · 已解读{book.done}篇
        </span>
      </div>
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

  return (
    <div className="category-section">
      <div
        className="category-header cursor-pointer flex items-center justify-between px-4 py-3 rounded-lg select-none mt-3"
        onClick={() => setCollapsed(v => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setCollapsed(v => !v) }}
        style={{
          background: 'var(--color-surface)',
          marginBottom: collapsed ? 0 : 8,
          transition: 'background 0.2s',
        }}
      >
        <div className="flex items-center gap-2">
          <ChevronDown
            size={14}
            style={{
              color: 'var(--color-text-dim)',
              transition: 'transform 0.2s',
              transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
            }}
          />
          <span className="font-semibold text-sm">{category}</span>
        </div>
        <span className="section-badge text-xs">
          {doneCount}/{chapters.length} 已解读
        </span>
      </div>
      {!collapsed && (
        <div className="chapter-list mt-0">
          {chapters.map(ch => {
            const hasSource = sourceNames.includes(ch.name)
            const hasInterp = ch.isDone
            const skillKeys = interpToSkill?.[ch.name]
            const hasSkill = !!skillKeys?.length
            return (
              <div key={ch.name} className={`chapter-row ${ch.isDone ? 'done' : 'undone'}`}>
                <div className="chapter-num">{ch.num}</div>
                <div className={`chapter-name ${ch.isDone ? 'done' : 'undone'}`}>{ch.name}</div>
                <div className="chapter-actions">
                  {hasSource && (
                    <button
                      className="btn-text chapter-action action-source"
                      onClick={() => onSourceClick(ch.name)}
                    >
                      原文
                    </button>
                  )}
                  {hasInterp && (
                    <button
                      className="btn-text chapter-action"
                      onClick={() => onChapterClick(ch.name)}
                    >
                      解读
                    </button>
                  )}
                  {hasSkill && onSkillClick && skillKeys && (
                    <button
                      className="btn-text chapter-action action-skill"
                      onClick={() => onSkillClick(skillKeys[0])}
                    >
                      技能
                    </button>
                  )}
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
