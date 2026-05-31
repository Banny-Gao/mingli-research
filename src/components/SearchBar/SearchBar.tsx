import { useState, useEffect, useRef, useCallback } from 'react'
import Fuse from 'fuse.js'
import { useReader } from '../../hooks/useReader'
import { SEARCH_HISTORY_KEY } from '../../lib/constants'

interface SearchEntry {
  slug: string
  title: string
  section?: string
  type: 'chapter' | 'skill' | 'source'
  key: string
  displayName?: string
  text: string
}

interface SearchBarProps {
  scopeSlug?: string // 限定搜索的典籍slug
}

const SNIPPET_PREFIX = 20
const SNIPPET_SUFFIX = 40
const SNIPPET_FALLBACK = 60

function getSnippetParts(
  text: string,
  query: string
): { before: string; match: string; after: string } | null {
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return null
  const start = Math.max(0, idx - SNIPPET_PREFIX)
  const end = Math.min(text.length, idx + query.length + SNIPPET_SUFFIX)
  const prefix = start > 0 ? '…' : ''
  const suffix = end < text.length ? '…' : ''
  const localIdx = idx - start
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

const MAX_RESULTS = 10
const SCROLL_TEXT_PREVIEW = 50

type TypeFilter = 'all' | 'source' | 'chapter' | 'skill'

const TYPE_FILTERS: { value: TypeFilter; label: string; shortcut: string }[] = [
  { value: 'all', label: '全部', shortcut: 'Ctrl+1' },
  { value: 'source', label: '原文', shortcut: 'Ctrl+2' },
  { value: 'chapter', label: '解读', shortcut: 'Ctrl+3' },
  { value: 'skill', label: '技能', shortcut: 'Ctrl+4' },
]

const TYPE_TO_FILTER: Record<string, TypeFilter> = {
  source: 'source',
  chapter: 'chapter',
  skill: 'skill',
}

const ART_SECTIONS = ['山', '医', '命', '相', '卜'] as const
type SectionFilter = 'all' | (typeof ART_SECTIONS)[number]

interface HistoryEntry {
  query: string
  timestamp: number
}

const MAX_HISTORY = 10

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveHistory(entries: HistoryEntry[]) {
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(entries))
}

const SearchBar = ({ scopeSlug }: SearchBarProps) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(-1)
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory)
  const [historyIdx, setHistoryIdx] = useState(-1)
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>('all')
  const [availableSections, setAvailableSections] = useState<Set<string>>(new Set())
  const inputRef = useRef<HTMLInputElement>(null)
  const queryRef = useRef(query)
  const containerRef = useRef<HTMLDivElement>(null)
  const resultRefs = useRef<(HTMLButtonElement | null)[]>([])
  const searchCacheRef = useRef<SearchEntry[] | null>(null)
  const fuseRef = useRef<Fuse<SearchEntry> | null>(null)
  const { openReader } = useReader()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const typeFilterRef = useRef<TypeFilter>('all')
  const sectionFilterRef = useRef<SectionFilter>('all')

  const BADGE_CONFIG = {
    chapter: { className: 'badge-chapter', label: '解读' },
    source: { className: 'badge-source', label: '原文' },
    skill: { className: 'badge-skill', label: '技能' },
  } as const

  const loadSearchIndex = useCallback(async (): Promise<SearchEntry[]> => {
    if (searchCacheRef.current) return searchCacheRef.current
    const res = await fetch(`${import.meta.env.BASE_URL}search-index.json`)
    const data = (await res.json()) as Array<{
      slug: string
      title: string
      section?: string
      interp: Array<{ key: string; text: string }>
      skill: Array<{ key: string; displayName?: string; text: string }>
      source: Array<{ key: string; text: string }>
    }>
    const sections = new Set<string>()
    const entries: SearchEntry[] = data.flatMap(book => {
      if (book.section) sections.add(book.section)
      return [
      ...book.interp.filter(ch => ch.text).map(ch => ({
        slug: book.slug,
        title: book.title,
        section: book.section,
        type: 'chapter' as const,
        key: ch.key,
        text: ch.text,
      })),
      ...book.skill.filter(sk => sk.text).map(sk => ({
        slug: book.slug,
        title: book.title,
        section: book.section,
        type: 'skill' as const,
        key: sk.key,
        displayName: sk.displayName,
        text: sk.text,
      })),
      ...(book.source || []).filter(src => src.text).map(src => ({
        slug: book.slug,
        title: book.title,
        section: book.section,
        type: 'source' as const,
        key: src.key,
        text: src.text,
      })),
    ]})
    fuseRef.current = new Fuse(entries, {
      keys: ['text', 'key', 'displayName', 'title'],
      threshold: 0.0,
      includeScore: true,
      ignoreLocation: true,
      useExtendedSearch: true,
      minMatchCharLength: 2,
    })
    setAvailableSections(sections)
    searchCacheRef.current = entries
    return entries
  }, [])

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

  // Keep refs in sync
  useEffect(() => {
    typeFilterRef.current = typeFilter
    sectionFilterRef.current = sectionFilter
  }, [typeFilter, sectionFilter])

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
      results = filterByScope(results, scopeSlug)
      // Apply type + section filters before truncation so filter changes see full result set
      const tf = typeFilterRef.current
      const sf = sectionFilterRef.current
      if (tf !== 'all') {
        results = results.filter(r => TYPE_TO_FILTER[r.type] === tf)
      }
      if (sf !== 'all') {
        results = results.filter(r => r.section === sf)
      }
      setResults(results.slice(0, MAX_RESULTS))
      setSelectedIdx(-1)
      setLoading(false)
    },
    [scopeSlug]
  )

  // Debounced search: triggered by query or filter changes
  useEffect(() => {
    if (!query.trim()) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(query), 200)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, typeFilter, sectionFilter, doSearch])

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
      if (e.ctrlKey && e.key >= '1' && e.key <= '4') {
        e.preventDefault()
        setTypeFilter(TYPE_FILTERS[Number(e.key) - 1].value)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  // auto-focus input when opened + preload index for section filter
  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
      loadSearchIndex()
    }
  }, [open, loadSearchIndex])

  // Scroll selected result into view
  useEffect(() => {
    if (selectedIdx >= 0) resultRefs.current[selectedIdx]?.scrollIntoView({ block: 'nearest' })
  }, [selectedIdx])

  const addToHistory = useCallback((q: string) => {
    const trimmed = q.trim()
    if (!trimmed) return
    setHistory(prev => {
      const filtered = prev.filter(h => h.query !== trimmed)
      const next = [{ query: trimmed, timestamp: Date.now() }, ...filtered].slice(0, MAX_HISTORY)
      saveHistory(next)
      return next
    })
  }, [])

  const removeFromHistory = useCallback((q: string) => {
    setHistory(prev => {
      const next = prev.filter(h => h.query !== q)
      saveHistory(next)
      return next
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    saveHistory([])
  }, [])

  const handleNavigate = (slug: string, key: string, type: 'chapter' | 'skill' | 'source') => {
    const match = queryRef.current.slice(0, SCROLL_TEXT_PREVIEW)
    addToHistory(queryRef.current)
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

  const renderSnippet = (text: string, q: string) => {
    const parts = getSnippetParts(text, q)
    if (!parts) return <div className="search-snippet">{text.slice(0, SNIPPET_FALLBACK)}</div>
    return (
      <div className="search-snippet">
        {parts.before}
        <span className="search-highlight">{parts.match}</span>
        {parts.after}
      </div>
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
              onKeyDown={e => {
                const inHistoryMode = !query && history.length > 0
                if (e.key === 'ArrowDown') {
                  e.preventDefault()
                  if (inHistoryMode) {
                    setHistoryIdx(i => Math.min(i + 1, history.length - 1))
                  } else {
                    setSelectedIdx(i => Math.min(i + 1, results.length - 1))
                  }
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault()
                  if (inHistoryMode) {
                    setHistoryIdx(i => Math.max(i - 1, 0))
                  } else {
                    setSelectedIdx(i => Math.max(i - 1, 0))
                  }
                } else if (e.key === 'Enter') {
                  if (inHistoryMode && historyIdx >= 0 && historyIdx < history.length) {
                    e.preventDefault()
                    setQuery(history[historyIdx].query)
                    setHistoryIdx(-1)
                  } else if (selectedIdx >= 0 && selectedIdx < results.length) {
                    e.preventDefault()
                    const r = results[selectedIdx]
                    handleNavigate(r.slug, r.key, r.type)
                  }
                }
              }}
              placeholder="搜索篇目、技能、注解内容..."
              className="search-input"
            />
            {loading && <span className="search-spinner" />}
          </div>

          <div className="search-filter-row">
            {TYPE_FILTERS.map(f => (
              <button
                key={f.value}
                className={`search-filter-pill${typeFilter === f.value ? ' active' : ''}`}
                onClick={() => setTypeFilter(f.value)}
                title={f.shortcut}
              >
                {f.label}
              </button>
            ))}
            {availableSections.size >= 2 && (
              <>
                <span className="search-filter-sep" />
                <button
                  className={`search-filter-pill section${sectionFilter === 'all' ? ' active' : ''}`}
                  onClick={() => setSectionFilter('all')}
                >
                  全部
                </button>
                {ART_SECTIONS.filter(s => availableSections.has(s)).map(s => (
                  <button
                    key={s}
                    className={`search-filter-pill section${sectionFilter === s ? ' active' : ''}`}
                    onClick={() => setSectionFilter(s)}
                  >
                    {s}
                  </button>
                ))}
              </>
            )}
          </div>

          <div className="search-results">
            {!query && history.length === 0 && (
              <div className="search-empty">输入关键词全文搜索篇目和技能</div>
            )}
            {!query && history.length > 0 && (
              <div className="search-history">
                <div className="search-history-header">
                  <span className="search-history-title">搜索历史</span>
                  <button className="search-history-clear" onClick={clearHistory}>
                    清除全部
                  </button>
                </div>
                {history.map((h, i) => (
                  <button
                    key={h.query}
                    className={`search-result-item${i === historyIdx ? ' search-result-selected' : ''}`}
                    onClick={() => setQuery(h.query)}
                    onMouseEnter={() => setHistoryIdx(i)}
                    tabIndex={-1}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="search-history-icon">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                    <div className="search-result-text">
                      <span className="search-item-name">{h.query}</span>
                    </div>
                    <button
                      className="search-history-delete"
                      onClick={e => {
                        e.stopPropagation()
                        removeFromHistory(h.query)
                      }}
                      tabIndex={-1}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </button>
                ))}
              </div>
            )}
            {query && !loading && results.length === 0 && (
              <div className="search-empty">未找到「{query}」相关篇目</div>
            )}
            {results
              .map((r, i) => (
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
                  className={`search-type-badge ${BADGE_CONFIG[r.type]?.className ?? BADGE_CONFIG.skill.className}`}
                >
                  {BADGE_CONFIG[r.type]?.label ?? BADGE_CONFIG.skill.label}
                </span>
                <div className="search-result-text">
                  <span className="search-book-title">《{r.title}》</span>
                  <span className="search-item-name">
                    {(r.type === 'skill' && r.displayName) || r.key}
                  </span>
                  {query && renderSnippet(r.text, query)}
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
