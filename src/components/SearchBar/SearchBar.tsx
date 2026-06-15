import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Fuse from 'fuse.js'
import { useReader } from '../../hooks/useReader'
import { SEARCH_HISTORY_KEY } from '../../lib/constants'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface SearchEntry {
  slug: string
  title: string
  section?: string
  category?: string
  author?: string
  chapterCategory?: string
  type: 'chapter' | 'skill' | 'source'
  key: string
  displayName?: string
  text: string
}

interface SearchBarProps {
  scopeSlug?: string // 限定搜索的典籍slug
}

interface SearchIndexJson {
  slug: string
  title: string
  section?: string
  category?: string
  author?: string
  interp: Array<{ key: string; chapterCategory?: string; text: string }>
  skill: Array<{ key: string; chapterCategory?: string; displayName?: string; text: string }>
  source: Array<{ key: string; chapterCategory?: string; text: string }>
}

interface ResultGroup {
  slug: string
  title: string
  author?: string
  category?: string
  items: { entry: SearchEntry; idx: number }[]
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

const SearchIcon = ({ className, size = 14 }: { className?: string; size?: number }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
)

type TypeFilter = 'all' | 'source' | 'chapter' | 'skill'

const TYPE_FILTERS: { value: TypeFilter; label: string; shortcut: string }[] = [
  { value: 'all', label: '全部', shortcut: 'Ctrl+1' },
  { value: 'source', label: '原文', shortcut: 'Ctrl+2' },
  { value: 'chapter', label: '解读', shortcut: 'Ctrl+3' },
  { value: 'skill', label: '技能', shortcut: 'Ctrl+4' },
]

const TYPE_TO_FILTER: Record<SearchEntry['type'], TypeFilter> = {
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

const AllFilterPill = ({ active, onClick }: { active: boolean; onClick: () => void }) => (
  <Button
    variant="ghost"
    size="sm"
    className={`search-filter-pill section${active ? ' active' : ''}`}
    onClick={onClick}
  >
    全部
  </Button>
)

const CategoryPill = ({
  label,
  active,
  count,
  onClick,
}: {
  label: string
  active: boolean
  count?: number
  onClick: () => void
}) => (
  <Button
    variant="ghost"
    size="sm"
    className={`search-filter-pill category${active ? ' active' : ''}`}
    onClick={onClick}
  >
    {label}
    {count != null && count > 0 && <span className="search-filter-count">{count}</span>}
  </Button>
)

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
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [availableCategories, setAvailableCategories] = useState<Set<string>>(new Set())
  const [fetchError, setFetchError] = useState(false)
  const [typeCounts, setTypeCounts] = useState<Record<TypeFilter, number>>({
    all: 0,
    source: 0,
    chapter: 0,
    skill: 0,
  })
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
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
  const categoryFilterRef = useRef<string>('all')

  const BADGE_CONFIG = {
    chapter: { className: 'badge-chapter', label: '解读' },
    source: { className: 'badge-source', label: '原文' },
    skill: { className: 'badge-skill', label: '技能' },
  } as const

  const loadSearchIndex = useCallback(async (): Promise<SearchEntry[]> => {
    if (searchCacheRef.current) return searchCacheRef.current
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}search-index.json`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as SearchIndexJson[]
      const sections = new Set<string>()
      const categories = new Set<string>()
      const entries: SearchEntry[] = data.flatMap(book => {
        if (book.section) sections.add(book.section)
        if (book.category) categories.add(book.category)
        return [
          ...book.interp
            .filter(ch => ch.text)
            .map(ch => ({
              slug: book.slug,
              title: book.title,
              section: book.section,
              category: book.category,
              author: book.author,
              chapterCategory: ch.chapterCategory,
              type: 'chapter' as const,
              key: ch.key,
              text: ch.text,
            })),
          ...book.skill
            .filter(sk => sk.text)
            .map(sk => ({
              slug: book.slug,
              title: book.title,
              section: book.section,
              category: book.category,
              author: book.author,
              chapterCategory: sk.chapterCategory,
              type: 'skill' as const,
              key: sk.key,
              displayName: sk.displayName,
              text: sk.text,
            })),
          ...(book.source || [])
            .filter(src => src.text)
            .map(src => ({
              slug: book.slug,
              title: book.title,
              section: book.section,
              category: book.category,
              author: book.author,
              chapterCategory: src.chapterCategory,
              type: 'source' as const,
              key: src.key,
              text: src.text,
            })),
        ]
      })
      fuseRef.current = new Fuse(entries, {
        keys: ['text', 'key', 'displayName', 'title'],
        threshold: 0.0,
        includeScore: true,
        ignoreLocation: true,
        useExtendedSearch: true,
        minMatchCharLength: 1,
      })
      setAvailableSections(sections)
      setAvailableCategories(categories)
      setFetchError(false)
      searchCacheRef.current = entries
      return entries
    } catch (err) {
      console.error('Search index load failed:', err)
      setFetchError(true)
      return []
    }
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
    categoryFilterRef.current = categoryFilter
  }, [typeFilter, sectionFilter, categoryFilter])

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
      // Compute counts from the full (query+scope filtered) result set before further filtering
      const counts: Record<TypeFilter, number> = {
        all: results.length,
        source: 0,
        chapter: 0,
        skill: 0,
      }
      const catCounts: Record<string, number> = {}
      for (const r of results) {
        counts[TYPE_TO_FILTER[r.type]]++
        if (r.category) catCounts[r.category] = (catCounts[r.category] || 0) + 1
      }
      setTypeCounts(counts)
      setCategoryCounts(catCounts)
      // Apply type + section + category filters before truncation
      const typeF = typeFilterRef.current
      const sectionF = sectionFilterRef.current
      const catF = categoryFilterRef.current
      if (typeF !== 'all') {
        results = results.filter(r => TYPE_TO_FILTER[r.type] === typeF)
      }
      if (sectionF !== 'all') {
        results = results.filter(r => r.section === sectionF)
      }
      if (catF !== 'all') {
        results = results.filter(r => r.category === catF)
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
  }, [query, typeFilter, sectionFilter, categoryFilter, doSearch])

  // keyboard: / to open, Esc to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName
      if (e.key === '/' && !open) {
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          e.preventDefault()
          setOpen(true)
        }
      }
      if (e.key === 'Escape') {
        if (!open) return
        setOpen(false)
        setQuery('')
      }
      if (e.ctrlKey && e.key >= '1' && e.key <= '4') {
        if (tag === 'INPUT' || tag === 'TEXTAREA') return
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

  const groupedResults = useMemo(() => {
    const groups: ResultGroup[] = []
    const seen = new Set<string>()
    for (let i = 0; i < results.length; i++) {
      const r = results[i]
      if (!seen.has(r.slug)) {
        seen.add(r.slug)
        groups.push({
          slug: r.slug,
          title: r.title,
          author: r.author,
          category: r.category,
          items: [],
        })
      }
      groups[groups.length - 1].items.push({ entry: r, idx: i })
    }
    return groups
  }, [results])

  return (
    <div className="search-bar-container" ref={containerRef}>
      {/* Search trigger button */}
      <Button
        variant="ghost"
        onClick={() => setOpen(!open)}
        className="search-trigger-btn"
        aria-label="打开搜索"
      >
        <SearchIcon />
        <span>搜索</span>
      </Button>

      {/* Search dropdown */}
      {open && (
        <div className="search-dropdown" onClick={e => e.stopPropagation()}>
          <div className="search-input-row">
            <input
              ref={inputRef}
              value={query}
              onChange={e => {
                setQuery(e.target.value)
                if (historyIdx >= 0) setHistoryIdx(-1)
              }}
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
              <Button
                key={f.value}
                variant="ghost"
                size="sm"
                className={`search-filter-pill${typeFilter === f.value ? ' active' : ''}`}
                onClick={() => setTypeFilter(f.value)}
                title={f.shortcut}
              >
                {f.label}
                {typeCounts[f.value] > 0 && f.value !== 'all' && (
                  <span className="search-filter-count">{typeCounts[f.value]}</span>
                )}
              </Button>
            ))}
            {availableSections.size >= 2 && (
              <>
                <span className="search-filter-sep" />
                <AllFilterPill
                  active={sectionFilter === 'all'}
                  onClick={() => setSectionFilter('all')}
                />
                {ART_SECTIONS.filter(s => availableSections.has(s)).map(s => (
                  <Button
                    key={s}
                    variant="ghost"
                    size="sm"
                    className={`search-filter-pill section${sectionFilter === s ? ' active' : ''}`}
                    onClick={() => setSectionFilter(s)}
                  >
                    {s}
                  </Button>
                ))}
              </>
            )}
            {availableCategories.size >= 2 && (
              <>
                <span className="search-filter-sep" />
                <AllFilterPill
                  active={categoryFilter === 'all'}
                  onClick={() => setCategoryFilter('all')}
                />
                {[...availableCategories].sort().map(c => (
                  <CategoryPill
                    key={c}
                    label={c}
                    active={categoryFilter === c}
                    count={categoryCounts[c]}
                    onClick={() => setCategoryFilter(c)}
                  />
                ))}
              </>
            )}
          </div>

          <div className="search-results">
            {fetchError && <div className="search-empty">搜索索引加载失败，请刷新页面重试</div>}
            {!fetchError && !query && history.length === 0 && (
              <div className="search-empty">输入关键词全文搜索篇目和技能</div>
            )}
            {!fetchError && !query && history.length > 0 && (
              <div className="search-history">
                <div className="search-history-header">
                  <span className="search-history-title">搜索历史</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="search-history-clear"
                    onClick={clearHistory}
                  >
                    清除全部
                  </Button>
                </div>
                {history.map((h, i) => (
                  <Button
                    key={h.query}
                    variant="ghost"
                    size="sm"
                    className={`search-result-item${i === historyIdx ? ' search-result-selected' : ''}`}
                    onClick={() => setQuery(h.query)}
                    onMouseEnter={() => setHistoryIdx(i)}
                    tabIndex={-1}
                  >
                    <SearchIcon className="search-history-icon" size={12} />
                    <div className="search-result-text">
                      <span className="search-item-name">{h.query}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="search-history-delete"
                      onClick={e => {
                        e.stopPropagation()
                        removeFromHistory(h.query)
                      }}
                      tabIndex={-1}
                      aria-label="删除该条历史"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </Button>
                  </Button>
                ))}
              </div>
            )}
            {!fetchError && query && !loading && results.length === 0 && (
              <div className="search-empty">未找到「{query}」相关篇目</div>
            )}
            {!fetchError && query && results.length > 0 && (
              <div className="search-result-count">
                找到 {typeCounts.all} 条结果
                {results.length < typeCounts.all ? `，显示前 ${results.length} 条` : ''}
              </div>
            )}
            {!fetchError &&
              groupedResults.map(group => (
                <div key={group.slug} className="search-book-group">
                  <div className="search-book-header">
                    《{group.title}》
                    {group.author && <span className="search-book-author"> — {group.author}</span>}
                    {group.category && (
                      <span className="search-book-category"> · {group.category}</span>
                    )}
                  </div>
                  {group.items.map(({ entry: r, idx: i }) => (
                    <Button
                      key={`${r.slug}-${r.type}-${r.key}`}
                      variant="ghost"
                      size="sm"
                      ref={el => {
                        resultRefs.current[i] = el
                      }}
                      className={`search-result-item${i === selectedIdx ? ' search-result-selected' : ''}`}
                      // eslint-disable-next-line react-hooks/refs -- handleNavigate only reads queryRef in click handler, not during render
                      onClick={() => handleNavigate(r.slug, r.key, r.type)}
                      onMouseEnter={() => setSelectedIdx(i)}
                      tabIndex={-1}
                    >
                      <Badge
                        variant="secondary"
                        className={`search-type-badge ${BADGE_CONFIG[r.type]?.className ?? BADGE_CONFIG.skill.className}`}
                      >
                        {BADGE_CONFIG[r.type]?.label ?? BADGE_CONFIG.skill.label}
                      </Badge>
                      <div className="search-result-text">
                        <span className="search-item-name">
                          {(r.type === 'skill' && r.displayName) || r.key}
                          {r.chapterCategory && (
                            <span className="search-chapter-category"> — {r.chapterCategory}</span>
                          )}
                        </span>
                        {query && renderSnippet(r.text, query)}
                      </div>
                    </Button>
                  ))}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchBar
