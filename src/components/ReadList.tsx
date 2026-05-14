import React from 'react'
import { Book } from '../data/books'

interface Props {
  book: Book
  onChapterClick: (name: string) => void
}

const ReadList: React.FC<Props> = ({ book, onChapterClick }) => {
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
          return (
            <div
              key={ch.name}
              onClick={() => ch.isDone && onChapterClick(ch.name)}
              className={`chapter-row ${ch.isDone ? 'done' : 'undone'}`}
            >
              <div className="chapter-num">{num}</div>
              <div className={`chapter-name ${ch.isDone ? 'done' : 'undone'}`}>{ch.name}</div>
              {ch.isDone && <div className="chapter-done">✅</div>}
              {ch.isDone && (
                <button
                  className="btn-text chapter-action"
                  onClick={e => {
                    e.stopPropagation()
                    onChapterClick(ch.name)
                  }}
                >
                  查看解读
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ReadList
