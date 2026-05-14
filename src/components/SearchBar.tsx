import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { books } from '../data/books'

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    const hits: {
      book: (typeof books)[0]
      chapter?: string
      skill?: string
      type: 'chapter' | 'skill'
    }[] = []
    for (const book of books) {
      for (const ch of book.chapters) {
        if (ch.name.toLowerCase().includes(q) || book.title.toLowerCase().includes(q)) {
          hits.push({ book, chapter: ch.name, type: 'chapter' })
        }
      }
      for (const sk of book.skills) {
        if (sk.name.toLowerCase().includes(q)) {
          hits.push({ book, skill: sk.name, type: 'skill' })
        }
      }
    }
    return hits
  }, [query])

  // 键盘快捷键 /
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && !open) {
        const tag = document.activeElement?.tagName
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          e.preventDefault()
          setOpen(true)
        }
      }
      if (e.key === 'Escape') {
        setOpen(false)
        setQuery('')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  return (
    <div style={{ position: 'relative' }}>
      {/* Search button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          background: 'rgba(122,79,170,0.1)',
          border: '1px solid var(--color-border)',
          borderRadius: 6,
          color: 'var(--color-text-dim)',
          fontSize: 13,
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        <span>搜索</span>
        <kbd
          style={{
            fontSize: 11,
            padding: '1px 4px',
            background: 'var(--color-border)',
            borderRadius: 3,
          }}
        >
          /
        </kbd>
      </button>

      {/* Search dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 8,
            width: 340,
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border-hover)',
            borderRadius: 10,
            boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
            zIndex: 200,
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: 12, borderBottom: '1px solid var(--color-border)' }}>
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="搜索篇目、技能..."
              style={{
                width: '100%',
                background: 'var(--color-bg-base)',
                border: '1px solid var(--color-border)',
                borderRadius: 6,
                padding: '8px 12px',
                color: 'var(--color-text-body)',
                fontSize: 14,
                outline: 'none',
              }}
            />
          </div>
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {query && results.length === 0 && (
              <div
                style={{
                  padding: 20,
                  textAlign: 'center',
                  color: 'var(--color-text-dim)',
                  fontSize: 13,
                }}
              >
                未找到「{query}」相关篇目
              </div>
            )}
            {!query && (
              <div
                style={{
                  padding: 20,
                  textAlign: 'center',
                  color: 'var(--color-text-muted)',
                  fontSize: 12,
                }}
              >
                输入关键词搜索篇目和技能
              </div>
            )}
            {results.map((r, i) => (
              <Link
                key={i}
                to={`/${r.book.slug}`}
                onClick={() => {
                  setOpen(false)
                  setQuery('')
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  borderBottom: '1px solid var(--color-border)',
                  textDecoration: 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e =>
                  ((e.currentTarget as HTMLElement).style.background = 'var(--color-bg-card-hover)')
                }
                onMouseLeave={e =>
                  ((e.currentTarget as HTMLElement).style.background = 'transparent')
                }
              >
                <span
                  style={{
                    fontSize: 11,
                    padding: '2px 6px',
                    borderRadius: 3,
                    background:
                      r.type === 'chapter' ? 'rgba(96,160,96,0.15)' : 'rgba(122,79,170,0.15)',
                    color:
                      r.type === 'chapter' ? 'var(--color-green)' : 'var(--color-purple-light)',
                    border: `1px solid ${r.type === 'chapter' ? 'rgba(96,160,96,0.3)' : 'rgba(122,79,170,0.3)'}`,
                  }}
                >
                  {r.type === 'chapter' ? '解读' : '技能'}
                </span>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--color-gold)' }}>《{r.book.title}》</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>
                    {r.chapter || r.skill}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 199 }}
          onClick={() => {
            setOpen(false)
            setQuery('')
          }}
        />
      )}
    </div>
  )
}

export default SearchBar
