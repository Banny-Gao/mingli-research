import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Fuse from 'fuse.js'

interface SearchEntry {
  slug: string
  title: string
  type: 'chapter' | 'skill'
  key: string
  text: string
}

interface SearchBarProps {
  scopeSlug?: string // 限定搜索的典籍slug
}

let searchCache: SearchEntry[] | null = null
let fuseInstance: Fuse<SearchEntry> | null = null

function getSnippet(text: string, query: string, len = 60): string {
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text.slice(0, len)
  const start = Math.max(0, idx - 20)
  const end = Math.min(text.length, idx + query.length + 40)
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '')
}

async function loadSearchIndex(): Promise<SearchEntry[]> {
  if (searchCache) return searchCache
  const res = await fetch('/search-index.json')
  const data = (await res.json()) as Array<{
    slug: string
    title: string
    interp: Array<{ key: string; text: string }>
    skill: Array<{ key: string; text: string }>
  }>
  const entries: SearchEntry[] = []
  for (const book of data) {
    for (const ch of book.interp) {
      if (ch.text)
        entries.push({
          slug: book.slug,
          title: book.title,
          type: 'chapter',
          key: ch.key,
          text: ch.text,
        })
    }
    for (const sk of book.skill) {
      if (sk.text)
        entries.push({
          slug: book.slug,
          title: book.title,
          type: 'skill',
          key: sk.key,
          text: sk.text,
        })
    }
  }
  fuseInstance = new Fuse(entries, {
    keys: ['text', 'key', 'title'],
    threshold: 0.0,
    includeScore: true,
    ignoreLocation: true,
    useExtendedSearch: true,
    minMatchCharLength: 2,
  })
  searchCache = entries
  return entries
}

function fuzzySearch(entries: SearchEntry[], query: string): SearchEntry[] {
  const q = query.toLowerCase()
  return entries.filter(
    entry =>
      entry.text.toLowerCase().includes(q) ||
      entry.key.toLowerCase().includes(q) ||
      entry.title.toLowerCase().includes(q)
  )
}

function filterByScope(entries: SearchEntry[], scopeSlug: string | undefined): SearchEntry[] {
  if (!scopeSlug) return entries
  return entries.filter(e => e.slug === scopeSlug)
}

const SearchBar: React.FC<SearchBarProps> = ({ scopeSlug }) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchEntry[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const queryRef = useRef(query)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Keep queryRef in sync
  useEffect(() => {
    queryRef.current = query
  }, [query])

  const doSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults([])
        return
      }
      setLoading(true)
      const entries = await loadSearchIndex()
      if (!entries.length) {
        setLoading(false)
        return
      }
      // 精确匹配优先（中文key精确匹配）
      const exactMatches = entries.filter(
        entry => entry.key === q || entry.key.toLowerCase().includes(q.toLowerCase())
      )
      // Fuzzy 后备
      const fuzzyMatches = fuseInstance
        ? fuseInstance
            .search(q)
            .map(r => r.item)
            .filter(item => !exactMatches.some(e => e.key === item.key))
        : []

      let results = [...exactMatches, ...fuzzyMatches]
      if (results.length === 0) {
        results = fuzzySearch(entries, q)
      }
      const filtered = filterByScope(results, scopeSlug)
      setResults(filtered.slice(0, 10))
      setLoading(false)
    },
    [scopeSlug]
  )

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(query), 200)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, doSearch])

  // keyboard: / to open, Esc to close
  useEffect(() => {
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

  // auto-focus input when opened
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const handleNavigate = (slug: string, key: string, type: 'chapter' | 'skill') => {
    const match = queryRef.current.slice(0, 50)
    setOpen(false)
    setQuery('')
    // Map 'chapter' to 'interp' for compatibility
    const openType = type === 'chapter' ? 'interp' : 'skill'
    navigate(
      `/${slug}?open=${openType}&key=${encodeURIComponent(key)}&match=${encodeURIComponent(match)}`
    )
  }

  const highlight = (text: string, q: string) => {
    if (!q) return text
    const idx = text.toLowerCase().indexOf(q.toLowerCase())
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <mark className="search-highlight">{text.slice(idx, idx + q.length)}</mark>
        {text.slice(idx + q.length)}
      </>
    )
  }

  return (
    <div className="search-bar-container" ref={containerRef}>
      {/* Search trigger button */}
      <button onClick={() => setOpen(!open)} className="search-trigger-btn">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <span>搜索</span>
      </button>

      {/* Search dropdown */}
      {open && (
        <div className="search-dropdown" onClick={e => e.stopPropagation()}>
          <div className="search-input-row">
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="搜索篇目、技能、注解内容..."
              className="search-input"
            />
            {loading && <span className="search-spinner" />}
          </div>

          <div className="search-results">
            {!query && <div className="search-empty">输入关键词全文搜索篇目和技能</div>}
            {query && !loading && results.length === 0 && (
              <div className="search-empty">未找到「{query}」相关篇目</div>
            )}
            {results.map((r, i) => (
              <button
                key={i}
                className="search-result-item"
                onClick={() => handleNavigate(r.slug, r.key, r.type)}
                onMouseEnter={e =>
                  ((e.currentTarget as HTMLElement).style.background = 'var(--color-bg-card-hover)')
                }
                onMouseLeave={e =>
                  ((e.currentTarget as HTMLElement).style.background = 'transparent')
                }
              >
                <span
                  className={`search-type-badge ${r.type === 'chapter' ? 'badge-chapter' : 'badge-skill'}`}
                >
                  {r.type === 'chapter' ? '解读' : '技能'}
                </span>
                <div className="search-result-text">
                  <span className="search-book-title">《{r.title}》</span>
                  <span className="search-item-name">{r.key}</span>
                  {query && <div className="search-snippet">{getSnippet(r.text, query)}</div>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchBar
