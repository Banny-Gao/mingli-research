import React from 'react'
import { Book } from '../data/books'

interface Props {
  book: Book
  onChapterClick: (name: string) => void
  onSourceClick: (name: string) => void
  sourceNames: string[]
  skillToInterp: Record<string, string[]>
}

const ReadList: React.FC<Props> = ({
  book,
  onChapterClick,
  onSourceClick,
  sourceNames,
  skillToInterp,
}) => {
  return (
    <div>
      <div className="section-header">
        <span className="section-title">篇目总览</span>
        <span className="section-badge">
          共{book.total}篇 · 已解读{book.done}篇
        </span>
      </div>
      <div className="chapter-list">
        {book.chapters.map((ch, i) => {
          const num = String(i + 1).padStart(2, '0')
          const hasSource = sourceNames.includes(ch.name)
          const hasInterp = ch.isDone
          const hasSkill = !!skillToInterp[ch.name]
          return (
            <div key={ch.name} className={`chapter-row ${ch.isDone ? 'done' : 'undone'}`}>
              <div className="chapter-num">{num}</div>
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
                {hasSkill && (
                  <button
                    className="btn-text chapter-action action-skill"
                    onClick={() => onChapterClick(ch.name)}
                  >
                    技能
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ReadList
