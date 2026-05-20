import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useReader } from '../hooks/useReader'
import Fuse from 'fuse.js'

interface SearchEntry {
  slug: string
  title: string
  type: 'chapter' | 'skill' | 'source'
  key: string
  displayName?: string
  text: string
}

interface SearchBarProps {
  scopeSlug?: string // 限定搜索的典籍slug
}

function getSnippetParts(
  text: string,
  query: string
): { before: string; match: string; after: string } | null {
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return null
  const start = Math.max(0, idx - 20)
  const end = Math.min(text.length, idx + query.length + 40)
  const prefix = start > 0 ? '…' : ''
  const suffix = end < text.length ? '…' : ''
  const localIdx = idx - start // position of query within the extracted slice
  const slice = text.slice(start, end)
  return {
    before: prefix + slice.slice(0, localIdx),
    match: slice.slice(localIdx, localIdx + query.length),
    after: slice.slice(localIdx + query.length) + suffix,
  }
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
  const [selectedIdx, setSelectedIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const queryRef = useRef(query)
  const containerRef = useRef<HTMLDivElement>(null)
  const resultRefs = useRef<(HTMLButtonElement | null)[]>([])
  const searchCacheRef = useRef<SearchEntry[] | null>(null)
  const fuseRef = useRef<Fuse<SearchEntry> | null>(null)
  const { openReader } = useReader()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function loadSearchIndex(): Promise<SearchEntry[]> {
    if (searchCacheRef.current) return searchCacheRef.current
    const res = await fetch(`${import.meta.env.BASE_URL}search-index.json`)
    const data = (await res.json()) as Array<{
      slug: string
      title: string
      interp: Array<{ key: string; text: string }>
      skill: Array<{ key: string; displayName?: string; text: string }>
      source: Array<{ key: string; text: string }>
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
            displayName: sk.displayName,
            text: sk.text,
          })
      }
      for (const src of book.source || []) {
        if (src.text)
          entries.push({
            slug: book.slug,
            title: book.title,
            type: 'source',
            key: src.key,
            text: src.text,
          })
      }
    }
    fuseRef.current = new Fuse(entries, {
      keys: ['text', 'key', 'displayName', 'title'],
      threshold: 0.0,
      includeScore: true,
      ignoreLocation: true,
      useExtendedSearch: true,
      minMatchCharLength: 2,
    })
    searchCacheRef.current = entries
    return entries
  }

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
      const fuzzyMatches = fuseRef.current
        ? fuseRef.current
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
      setSelectedIdx(-1)
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

  // Scroll selected result into view
  useEffect(() => {
    if (selectedIdx >= 0) resultRefs.current[selectedIdx]?.scrollIntoView({ block: 'nearest' })
  }, [selectedIdx])

  const handleNavigate = (slug: string, key: string, type: 'chapter' | 'skill' | 'source') => {
    const match = queryRef.current.slice(0, 50)
    setOpen(false)
    setQuery('')
    const normalizedType = type === 'chapter' ? 'interp' : type
    openReader({
      bookSlug: slug,
      modalType: normalizedType as 'interp' | 'skill' | 'source',
      modalKey: key,
      scrollToText: match || undefined,
    })
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
              onKeyDown={e => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault()
                  setSelectedIdx(i => Math.min(i + 1, results.length - 1))
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault()
                  setSelectedIdx(i => Math.max(i - 1, 0))
                } else if (e.key === 'Enter' && selectedIdx >= 0 && selectedIdx < results.length) {
                  e.preventDefault()
                  const r = results[selectedIdx]
                  handleNavigate(r.slug, r.key, r.type)
                }
              }}
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
                ref={el => {
                  resultRefs.current[i] = el
                }}
                className={`search-result-item${i === selectedIdx ? ' search-result-selected' : ''}`}
                onClick={() => handleNavigate(r.slug, r.key, r.type)}
                onMouseEnter={() => setSelectedIdx(i)}
                tabIndex={-1}
              >
                <span
                  className={`search-type-badge ${r.type === 'chapter' ? 'badge-chapter' : r.type === 'source' ? 'badge-source' : 'badge-skill'}`}
                >
                  {r.type === 'chapter' ? '解读' : r.type === 'source' ? '原文' : '技能'}
                </span>
                <div className="search-result-text">
                  <span className="search-book-title">《{r.title}》</span>
                  <span className="search-item-name">
                    {r.type === 'skill' && r.displayName ? r.displayName : r.key}
                  </span>
                  {query &&
                    (() => {
                      const parts = getSnippetParts(r.text, query)
                      return (
                        <div className="search-snippet">
                          {parts ? (
                            <>
                              {parts.before}
                              <span className="search-highlight">{parts.match}</span>
                              {parts.after}
                            </>
                          ) : (
                            r.text.slice(0, 60)
                          )}
                        </div>
                      )
                    })()}
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
