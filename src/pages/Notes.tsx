import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Filter, Bookmark, MessageSquare, ArrowRight, ChevronLeft, Trash2 } from 'lucide-react'
import { useReader } from '../hooks/useReader'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { books } from '../data/books'
import {
  TYPE_LABELS,
  deleteAnnotation,
  batchDeleteAnnotations,
  batchDeleteBookmarks,
  loadAllBookmarks,
  loadAllAnnotations,
  exportMarkdown,
} from '../hooks/useNotesData'
import type { Annotation, AnnotationType } from '../hooks/useAnnotations'

const Notes = () => {
  const [refresh, setRefresh] = useState(0)
  const { openReader, closeVersion } = useReader()
  // Refresh data when modal closes (bookmark/annotation may have changed)
  useEffect(() => {
    setRefresh(v => v + 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeVersion])
  const [tab, setTab] = useState<'bookmark' | 'annotation'>('annotation')
  const [typeFilter, setTypeFilter] = useState<AnnotationType | 'all'>('all')
  const [bookFilter, setBookFilter] = useState<string>('all')
  const [selectedAnn, setSelectedAnn] = useState<Set<string>>(new Set())
  const [selectedBm, setSelectedBm] = useState<Set<string>>(new Set())

  const all = useMemo(() => loadAllAnnotations(), [refresh])
  const bookmarks = useMemo(() => loadAllBookmarks(), [refresh])

  const bookOptions = useMemo(() => {
    const slugs = new Set(all.map(a => a.slug))
    bookmarks.forEach(b => slugs.add(b.slug))
    return Array.from(slugs).map(s => ({
      slug: s,
      title: books.find(b => b.slug === s)?.title || s,
    }))
  }, [all, bookmarks])

  const groups = useMemo(() => {
    const map = new Map<
      string,
      Map<string, { annotations: Annotation[]; origChapters: Set<string> }>
    >()
    for (const item of all) {
      if (bookFilter !== 'all' && item.slug !== bookFilter) continue
      if (typeFilter !== 'all' && item.annotation.type !== typeFilter) continue
      if (!map.has(item.slug)) map.set(item.slug, new Map())
      const chMap = map.get(item.slug)!
      if (!chMap.has(item.chapter))
        chMap.set(item.chapter, { annotations: [], origChapters: new Set() })
      const entry = chMap.get(item.chapter)!
      entry.annotations.push(item.annotation)
      entry.origChapters.add(item.origChapter)
    }
    return Array.from(map.entries()).map(([slug, chMap]) => {
      const book = books.find(b => b.slug === slug)
      return {
        slug,
        book: book?.title || slug,
        chapters: Array.from(chMap.entries()).map(([name, { annotations, origChapters }]) => ({
          name,
          annotations,
          origChapters: Array.from(origChapters),
        })),
      }
    })
  }, [all, bookFilter, typeFilter])

  const filteredBookmarks = useMemo(() => {
    if (bookFilter === 'all') return bookmarks
    return bookmarks.filter(b => b.slug === bookFilter)
  }, [bookmarks, bookFilter])

  const total = all.length
  const bmTotal = bookmarks.reduce((s, b) => s + b.chapters.length, 0)

  const toggleAnnSelect = (id: string) => {
    setSelectedAnn(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleBmKeys = (keys: string[]) => {
    setSelectedBm(prev => {
      const allSelected = keys.every(k => prev.has(k))
      const next = new Set(prev)
      for (const k of keys) {
        if (allSelected) next.delete(k)
        else next.add(k)
      }
      return next
    })
  }

  const toggleAnnIds = (ids: string[]) => {
    setSelectedAnn(prev => {
      const allSelected = ids.every(id => prev.has(id))
      const next = new Set(prev)
      for (const id of ids) {
        if (allSelected) next.delete(id)
        else next.add(id)
      }
      return next
    })
  }

  const toggleAllAnn = () => {
    if (selectedAnn.size === all.length) setSelectedAnn(new Set())
    else setSelectedAnn(new Set(all.map(a => a.annotation.id)))
  }

  const toggleAllBm = () => {
    const allBmKeys = bookmarks.flatMap(b => b.chapters.map(ch => `${b.slug}::${ch.name}`))
    if (selectedBm.size === allBmKeys.length) setSelectedBm(new Set())
    else setSelectedBm(new Set(allBmKeys))
  }

  const handleBatchDeleteAnn = () => {
    const toDelete = all.filter(a => selectedAnn.has(a.annotation.id))
    batchDeleteAnnotations(
      toDelete.map(a => ({ slug: a.slug, origChapter: a.origChapter, id: a.annotation.id }))
    )
    setSelectedAnn(new Set())
    setRefresh(v => v + 1)
  }

  const handleBatchDeleteBm = () => {
    const toDelete = bookmarks.flatMap(bm =>
      bm.chapters
        .filter(chm => selectedBm.has(`${bm.slug}::${chm.name}`))
        .map(chm => ({ slug: bm.slug, chapter: chm.name }))
    )
    batchDeleteBookmarks(toDelete)
    setSelectedBm(new Set())
    setRefresh(v => v + 1)
  }

  return (
    <>
      <Helmet>
        <title>读书笔记 — 玄学文化馆</title>
        <meta name="description" content={`已收录 ${total} 条批注`} />
        <meta property="og:title" content={`读书笔记 — 玄学文化馆`} />
        <meta property="og:description" content={`已收录 ${total} 条批注`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.origin + window.location.pathname} />
        <link rel="canonical" href={window.location.origin + window.location.pathname} />
      </Helmet>
      <div className="page-wrapper">
        <div className="top-actions">
          <Link to="/" className="back-link flex items-center gap-1">
            <ChevronLeft size={14} />
          </Link>
        </div>

        <div className="book-hero-glow" />

        <div className="page-container-narrow">
          <div className="book-hero">
            <h1 className="text-3xl text-[var(--color-gold)] font-bold tracking-widest mb-[10px] hero-title-glow">
              个人中心
            </h1>
          </div>

          <div className="container-wide">
            <Tabs value={tab} onValueChange={v => setTab(v as 'bookmark' | 'annotation')}>
              <TabsList className="mb-4">
                <TabsTrigger value="annotation">
                  <MessageSquare size={14} />
                  批注 {total > 0 ? `(${total})` : ''}
                </TabsTrigger>
                <TabsTrigger value="bookmark">
                  <Bookmark size={14} />
                  收藏 {bmTotal > 0 ? `(${bmTotal})` : ''}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex gap-2 mb-4 flex-wrap">
              <select
                value={bookFilter}
                onChange={e => setBookFilter(e.target.value)}
                className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-md px-2.5 py-1.5 text-[var(--color-text-body)] text-xs cursor-pointer"
              >
                <option value="all">所有典籍</option>
                {bookOptions.map(b => (
                  <option key={b.slug} value={b.slug}>
                    《{b.title}》
                  </option>
                ))}
              </select>
              {tab === 'annotation' && (
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value as AnnotationType | 'all')}
                  className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-md px-2.5 py-1.5 text-[var(--color-text-body)] text-xs cursor-pointer"
                >
                  <option value="all">所有类型</option>
                  {Object.entries(TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              )}
              <div className="flex-1" />
              {tab === 'annotation' && total > 0 && (
                <Button onClick={() => exportMarkdown(groups)} variant="outline">
                  <Filter size={14} />
                  导出 Markdown
                </Button>
              )}
            </div>
          </div>

          {tab === 'bookmark' && (
            <div className="notes-section">
              {filteredBookmarks.length === 0 ? (
                <div className="notes-empty">
                  <Bookmark size={48} className="mb-4 text-[var(--color-text-muted)]" />
                  <div className="text-base text-[var(--color-text-dim)] mb-2">暂无收藏篇目</div>
                  <div className="text-xs text-[var(--color-text-muted)]">
                    在阅读时点击收藏按钮，收藏的篇目将显示在这里
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Checkbox
                      checked={
                        bmTotal > 0 && selectedBm.size === bookmarks.flatMap(b => b.chapters).length
                      }
                      onCheckedChange={toggleAllBm}
                    />
                    <span
                      className="text-xs text-[var(--color-text-muted)] cursor-pointer"
                      onClick={toggleAllBm}
                    >
                      全选
                    </span>
                    <div className="flex-1" />
                    {selectedBm.size > 0 && (
                      <>
                        <span className="text-xs text-[var(--color-text-dim)]">
                          已选 {selectedBm.size} 项
                        </span>
                        <Button onClick={handleBatchDeleteBm} variant="destructive">
                          <Trash2 size={14} />
                          删除选中
                        </Button>
                      </>
                    )}
                  </div>
                  {filteredBookmarks.map(bm => {
                    const book = books.find(b => b.slug === bm.slug)
                    return (
                      <div key={bm.slug} className="notes-book">
                        <div className="notes-book-title flex items-center gap-2">
                          <Checkbox
                            checked={bm.chapters.every(chm =>
                              selectedBm.has(`${bm.slug}::${chm.name}`)
                            )}
                            onCheckedChange={() => {
                              const keys = bm.chapters.map(chm => `${bm.slug}::${chm.name}`)
                              toggleBmKeys(keys)
                            }}
                          />
                          <Link
                            to={`/${bm.slug}`}
                            className="text-[var(--color-gold)] no-underline"
                          >
                            《{book?.title || bm.slug}》
                          </Link>
                        </div>
                        {bm.chapters.map(chm => (
                          <div
                            key={chm.name}
                            className="notes-chapter flex justify-between items-center"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <Checkbox
                                checked={selectedBm.has(`${bm.slug}::${chm.name}`)}
                                onCheckedChange={() => {
                                  const key = `${bm.slug}::${chm.name}`
                                  setSelectedBm(prev => {
                                    const n = new Set(prev)
                                    if (n.has(key)) n.delete(key)
                                    else n.add(key)
                                    return n
                                  })
                                }}
                              />
                              <div className="notes-chapter-name pt-2.5 pb-1.5">{chm.name}</div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                openReader({
                                  bookSlug: bm.slug,
                                  modalType: chm.type as 'interp' | 'skill' | 'source',
                                  modalKey: chm.name,
                                })
                              }
                              className="notes-item-link"
                            >
                              继续阅读 <ArrowRight size={12} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </>
              )}
            </div>
          )}

          {tab === 'annotation' && (
            <div className="notes-section">
              {groups.length === 0 ? (
                <div className="notes-empty">
                  <MessageSquare size={48} className="mb-4 text-[var(--color-text-muted)]" />
                  <div className="text-base text-[var(--color-text-dim)] mb-2">
                    {all.length === 0 ? '暂无批注' : '没有匹配的批注'}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">
                    {all.length === 0 ? '在阅读篇目时选中文本添加批注' : '尝试调整筛选条件'}
                  </div>
                  {all.length === 0 && (
                    <div className="mt-5">
                      <Link
                        to={`/${books[0]?.slug || 'ditiansui-site'}`}
                        className="text-[var(--color-purple-light)] text-sm inline-flex items-center gap-1"
                      >
                        前往阅读 <ArrowRight size={14} />
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={total > 0 && selectedAnn.size === all.length}
                      onCheckedChange={toggleAllAnn}
                    />
                    <span
                      className="text-xs text-[var(--color-text-muted)] cursor-pointer"
                      onClick={toggleAllAnn}
                    >
                      全选
                    </span>
                    <div className="flex-1" />
                    {selectedAnn.size > 0 && (
                      <>
                        <span className="text-xs text-[var(--color-text-dim)]">
                          已选 {selectedAnn.size} 项
                        </span>
                        <Button onClick={handleBatchDeleteAnn} variant="destructive">
                          <Trash2 size={14} />
                          删除选中
                        </Button>
                      </>
                    )}
                  </div>
                  {groups.map(group => (
                    <div key={group.slug} className="notes-book">
                      <div className="notes-book-title flex items-center gap-2">
                        <Checkbox
                          checked={group.chapters.every(ch =>
                            ch.annotations.every(a => selectedAnn.has(a.id))
                          )}
                          onCheckedChange={() => {
                            const ids = group.chapters.flatMap(ch => ch.annotations.map(a => a.id))
                            toggleAnnIds(ids)
                          }}
                        />
                        <Link
                          to={`/${group.slug}`}
                          className="text-[var(--color-gold)] no-underline"
                        >
                          《{group.book}》
                        </Link>
                      </div>
                      {group.chapters.map(ch => (
                        <div key={ch.name} className="notes-chapter">
                          <div className="notes-chapter-name">{ch.name}</div>
                          {ch.annotations.map(ann => (
                            <div key={ann.id} className="notes-item">
                              <div className="notes-item-header">
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    checked={selectedAnn.has(ann.id)}
                                    onCheckedChange={() => toggleAnnSelect(ann.id)}
                                  />
                                  <Badge variant="secondary" className={`ann-type-${ann.type}`}>
                                    {TYPE_LABELS[ann.type]}
                                  </Badge>
                                </div>
                                <span className="text-[11px] text-[var(--color-text-muted)]">
                                  {new Date(ann.createdAt).toLocaleDateString('zh-CN')}
                                </span>
                              </div>
                              <div className="notes-item-text">「{ann.selectedText}」</div>
                              {ann.note && <div className="notes-item-note">{ann.note}</div>}
                              <div className="notes-item-actions">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    openReader({
                                      bookSlug: group.slug,
                                      modalType: ann.fromSource ? 'source' : 'interp',
                                      modalKey: ch.name,
                                      scrollToText: ann.selectedText,
                                    })
                                  }
                                  className="notes-item-link"
                                >
                                  查看批注 <ArrowRight size={12} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    deleteAnnotation(
                                      group.slug,
                                      ch.origChapters?.[0] || ch.name,
                                      ann.id
                                    )
                                    setRefresh(v => v + 1)
                                  }}
                                >
                                  删除
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Notes
