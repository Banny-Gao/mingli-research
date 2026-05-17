import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Filter, Bookmark, MessageSquare, ArrowRight, ArrowLeft, Trash2 } from 'lucide-react'
import { books } from '../data/books'
import {
  TYPE_LABELS,
  TYPE_COLORS,
  deleteAnnotation,
  batchDeleteAnnotations,
  batchDeleteBookmarks,
  loadAllBookmarks,
  loadAllAnnotations,
  exportMarkdown,
} from '../hooks/useNotesData'
import type { Annotation, AnnotationType } from '../hooks/useAnnotations'

const Notes: React.FC = () => {
  const [refresh, setRefresh] = useState(0)
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
    return Array.from(slugs).map(s => ({ slug: s, title: books.find(b => b.slug === s)?.title || s }))
  }, [all, bookmarks])

  const groups = useMemo(() => {
    const map = new Map<string, Map<string, { annotations: Annotation[]; origChapters: Set<string> }>>()
    for (const item of all) {
      if (bookFilter !== 'all' && item.slug !== bookFilter) continue
      if (typeFilter !== 'all' && item.annotation.type !== typeFilter) continue
      if (!map.has(item.slug)) map.set(item.slug, new Map())
      const chMap = map.get(item.slug)!
      if (!chMap.has(item.chapter)) chMap.set(item.chapter, { annotations: [], origChapters: new Set() })
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
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const toggleAllAnn = () => {
    if (selectedAnn.size === all.length) setSelectedAnn(new Set())
    else setSelectedAnn(new Set(all.map(a => a.annotation.id)))
  }

  const toggleAllBm = () => {
    const allBmKeys = bookmarks.flatMap(b => b.chapters.map(ch => `${b.slug}::${ch}`))
    if (selectedBm.size === allBmKeys.length) setSelectedBm(new Set())
    else setSelectedBm(new Set(allBmKeys))
  }

  const handleBatchDeleteAnn = () => {
    const toDelete = all.filter(a => selectedAnn.has(a.annotation.id))
    batchDeleteAnnotations(toDelete.map(a => ({ slug: a.slug, origChapter: a.origChapter, id: a.annotation.id })))
    setSelectedAnn(new Set())
    setRefresh(v => v + 1)
  }

  const handleBatchDeleteBm = () => {
    const toDelete: Array<{ slug: string; chapter: string }> = []
    for (const bm of bookmarks) {
      for (const ch of bm.chapters) {
        if (selectedBm.has(`${bm.slug}::${ch}`)) toDelete.push({ slug: bm.slug, chapter: ch })
      }
    }
    batchDeleteBookmarks(toDelete)
    setSelectedBm(new Set())
    setRefresh(v => v + 1)
  }

  return (
    <>
      <Helmet>
        <title>读书笔记 — 命理学术中心</title>
        <meta name="description" content={`已收录 ${total} 条批注`} />
      </Helmet>
      <div className="page-wrapper">
        <div className="page-container-narrow">
          <div className="book-hero">
            <div className="book-hero-glow" />
            <h1 style={{ fontSize: 32, color: 'var(--color-gold)', fontWeight: '700', letterSpacing: 6, marginBottom: 10, textShadow: '0 0 30px var(--color-gold-glow)' }}>
              个人中心
            </h1>
          </div>

          <div style={{ display: 'flex', marginTop: 12, marginBottom: 24, width: '100%' }}>
            <Link to="/" className="back-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <ArrowLeft size={14} /> 返回典籍首页
            </Link>
          </div>

          <div className="container-wide">
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button onClick={() => setTab('annotation')} className={`notes-btn ${tab === 'annotation' ? 'notes-btn-active' : ''}`}>
                <MessageSquare size={14} />批注 {total > 0 ? `(${total})` : ''}
              </button>
              <button onClick={() => setTab('bookmark')} className={`notes-btn ${tab === 'bookmark' ? 'notes-btn-active' : ''}`}>
                <Bookmark size={14} />收藏 {bmTotal > 0 ? `(${bmTotal})` : ''}
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <select value={bookFilter} onChange={e => setBookFilter(e.target.value)} style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '6px 10px', color: 'var(--color-text-body)', fontSize: 13, cursor: 'pointer' }}>
                <option value="all">所有典籍</option>
                {bookOptions.map(b => <option key={b.slug} value={b.slug}>《{b.title}》</option>)}
              </select>
              {tab === 'annotation' && (
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as AnnotationType | 'all')} style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '6px 10px', color: 'var(--color-text-body)', fontSize: 13, cursor: 'pointer' }}>
                  <option value="all">所有类型</option>
                  {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              )}
              <div style={{ flex: 1 }} />
              {tab === 'annotation' && total > 0 && (
                <button onClick={() => exportMarkdown(groups)} className="notes-btn notes-btn-export">
                  <Filter size={14} />导出 Markdown
                </button>
              )}
            </div>

          </div>

          {tab === 'bookmark' && (
            <div className="notes-section">
              {filteredBookmarks.length === 0 ? (
                <div className="notes-empty">
                  <Bookmark size={48} style={{ marginBottom: 16, color: 'var(--color-text-muted)' }} />
                  <div style={{ fontSize: 16, color: 'var(--color-text-dim)', marginBottom: 8 }}>暂无收藏篇目</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>在阅读时点击收藏按钮，收藏的篇目将显示在这里</div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <input type="checkbox" checked={bmTotal > 0 && selectedBm.size === bookmarks.flatMap(b => b.chapters).length} onChange={toggleAllBm} className="notes-checkbox" />
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)', cursor: 'pointer' }} onClick={toggleAllBm}>全选</span>
                    <div style={{ flex: 1 }} />
                    {selectedBm.size > 0 && (
                      <>
                        <span style={{ fontSize: 13, color: 'var(--color-text-dim)' }}>已选 {selectedBm.size} 项</span>
                        <button onClick={handleBatchDeleteBm} className="notes-btn notes-btn-danger"><Trash2 size={14} />删除选中</button>
                      </>
                    )}
                  </div>
                  {filteredBookmarks.map(bm => {
                    const book = books.find(b => b.slug === bm.slug)
                    return (
                      <div key={bm.slug} className="notes-book">
                        <div className="notes-book-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input type="checkbox" checked={bm.chapters.every(ch => selectedBm.has(`${bm.slug}::${ch}`))} onChange={() => { const keys = bm.chapters.map(ch => `${bm.slug}::${ch}`); setSelectedBm(prev => { const allSelected = keys.every(k => prev.has(k)); const next = new Set(prev); for (const k of keys) { if (allSelected) next.delete(k); else next.add(k) } return next }) }} className="notes-checkbox" />
                          <Link to={`/${bm.slug}`} style={{ color: 'var(--color-gold)', textDecoration: 'none' }}>《{book?.title || bm.slug}》</Link>
                        </div>
                        {bm.chapters.map(ch => (
                          <div key={ch} className="notes-chapter" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                              <input type="checkbox" checked={selectedBm.has(`${bm.slug}::${ch}`)} onChange={() => { setSelectedBm(prev => { const n = new Set(prev); if (n.has(`${bm.slug}::${ch}`)) n.delete(`${bm.slug}::${ch}`); else n.add(`${bm.slug}::${ch}`); return n }) }} className="notes-checkbox" />
                              <div className="notes-chapter-name" style={{ padding: '10px 0 6px' }}>{ch}</div>
                            </div>
                            <Link to={`/${bm.slug}?open=interp&key=${encodeURIComponent(ch)}`} style={{ fontSize: 12, color: 'var(--color-text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                              继续阅读 <ArrowRight size={12} />
                            </Link>
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
                  <MessageSquare size={48} style={{ marginBottom: 16, color: 'var(--color-text-muted)' }} />
                  <div style={{ fontSize: 16, color: 'var(--color-text-dim)', marginBottom: 8 }}>{all.length === 0 ? '暂无批注' : '没有匹配的批注'}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{all.length === 0 ? '在阅读篇目时选中文本添加批注' : '尝试调整筛选条件'}</div>
                  {all.length === 0 && (
                    <div style={{ marginTop: 20 }}>
                      <Link to={`/${books[0]?.slug || 'ditiansui-site'}`} style={{ color: 'var(--color-purple-light)', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 4 }}>前往阅读 <ArrowRight size={14} /></Link>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" checked={total > 0 && selectedAnn.size === all.length} onChange={toggleAllAnn} className="notes-checkbox" />
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)', cursor: 'pointer' }} onClick={toggleAllAnn}>全选</span>
                    <div style={{ flex: 1 }} />
                    {selectedAnn.size > 0 && (
                      <>
                        <span style={{ fontSize: 13, color: 'var(--color-text-dim)' }}>已选 {selectedAnn.size} 项</span>
                        <button onClick={handleBatchDeleteAnn} className="notes-btn notes-btn-danger"><Trash2 size={14} />删除选中</button>
                      </>
                    )}
                  </div>
                  {groups.map(group => (
                    <div key={group.slug} className="notes-book">
                      <div className="notes-book-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input type="checkbox" checked={group.chapters.every(ch => ch.annotations.every(a => selectedAnn.has(a.id)))} onChange={() => { const ids = group.chapters.flatMap(ch => ch.annotations.map(a => a.id)); setSelectedAnn(prev => { const allSelected = ids.every(id => prev.has(id)); const next = new Set(prev); for (const id of ids) { if (allSelected) next.delete(id); else next.add(id) } return next }) }} className="notes-checkbox" />
                        <Link to={`/${group.slug}`} style={{ color: 'var(--color-gold)', textDecoration: 'none' }}>《{group.book}》</Link>
                      </div>
                      {group.chapters.map(ch => (
                        <div key={ch.name} className="notes-chapter">
                          <div className="notes-chapter-name">{ch.name}</div>
                          {ch.annotations.map(ann => (
                            <div key={ann.id} className="notes-item">
                              <div className="notes-item-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <input type="checkbox" checked={selectedAnn.has(ann.id)} onChange={() => toggleAnnSelect(ann.id)} className="notes-checkbox" />
                                  <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 3, background: TYPE_COLORS[ann.type] + '22', color: TYPE_COLORS[ann.type], border: `1px solid ${TYPE_COLORS[ann.type]}55` }}>
                                    {TYPE_LABELS[ann.type]}
                                  </span>
                                </div>
                                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{new Date(ann.createdAt).toLocaleDateString('zh-CN')}</span>
                              </div>
                              <div className="notes-item-text">「{ann.selectedText}」</div>
                              {ann.note && <div className="notes-item-note">{ann.note}</div>}
                              <div className="notes-item-actions">
                                <Link to={`/${group.slug}?open=${ann.fromSource ? 'source' : 'interp'}&key=${encodeURIComponent(ch.name)}&match=${encodeURIComponent(ann.selectedText)}`} className="notes-item-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                  查看批注 <ArrowRight size={12} />
                                </Link>
                                <button onClick={() => { deleteAnnotation(group.slug, ch.origChapters?.[0] || ch.name, ann.id); setRefresh(v => v + 1) }} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 12, padding: 0 }}>
                                  删除
                                </button>
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
