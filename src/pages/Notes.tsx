import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Filter, Bookmark, MessageSquare, ArrowRight, ArrowLeft, Trash2 } from 'lucide-react'
import { books } from '../data/books'
import { skillToInterp } from '../data/ditiansui-site/assoc'
import type { Annotation, AnnotationType } from '../hooks/useAnnotations'

const ANN_KEY = 'mingli_annotations'
const BOOKMARK_KEY = 'mingli_bookmarks'

const TYPE_LABELS: Record<AnnotationType, string> = {
  emphasis: '重点',
  question: '疑问',
  quote: '引用',
}
const TYPE_COLORS: Record<AnnotationType, string> = {
  emphasis: 'var(--color-gold)',
  question: '#d05050',
  quote: '#60c060',
}

function normalizeChapter(chapter: string): string {
  const interp = (skillToInterp as Record<string, string[]>)[chapter]
  return interp && interp.length > 0 ? interp[0] : chapter
}

function deleteAnnotation(slug: string, chapter: string, annId: string) {
  const key = `${ANN_KEY}_${slug}_${chapter}`
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return
    const anns: Annotation[] = JSON.parse(raw).filter((a: Annotation) => a.id !== annId)
    if (anns.length === 0) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(anns))
  } catch {}
}

function batchDeleteAnnotations(items: Array<{ slug: string; origChapter: string; id: string }>) {
  for (const item of items) {
    deleteAnnotation(item.slug, item.origChapter, item.id)
  }
}

function batchDeleteBookmarks(items: Array<{ slug: string; chapter: string }>) {
  // Group by slug to minimize localStorage reads
  const bySlug = new Map<string, Set<string>>()
  for (const item of items) {
    if (!bySlug.has(item.slug)) bySlug.set(item.slug, new Set())
    bySlug.get(item.slug)!.add(item.chapter)
  }
  for (const [slug, chapters] of bySlug) {
    const key = `${BOOKMARK_KEY}_${slug}`
    try {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const all: string[] = JSON.parse(raw)
      const filtered = all.filter(c => !chapters.has(c))
      if (filtered.length === 0) localStorage.removeItem(key)
      else localStorage.setItem(key, JSON.stringify(filtered))
    } catch {}
  }
}

function loadAllBookmarks(): Array<{ slug: string; chapters: string[] }> {
  const map = new Map<string, string[]>()
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith(BOOKMARK_KEY)) continue
    const slug = key.replace(BOOKMARK_KEY + '_', '')
    try {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const chapters: string[] = JSON.parse(raw)
      if (chapters.length > 0) map.set(slug, chapters)
    } catch {}
  }
  return Array.from(map.entries()).map(([slug, chapters]) => ({ slug, chapters }))
}

function loadAllAnnotations(): Array<{ slug: string; chapter: string; origChapter: string; annotation: Annotation }> {
  const results: Array<{ slug: string; chapter: string; origChapter: string; annotation: Annotation }> = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith(ANN_KEY)) continue
    // Strip __source suffix before parsing chapter name
    const cleanKey = key.replace(/__source$/, '')
    const parts = cleanKey.replace(ANN_KEY + '_', '').split('_', 2)
    if (parts.length !== 2 || !parts[1]) continue
    const [slug, origChapter] = parts
    try {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const anns: Annotation[] = JSON.parse(raw)
      const nc = normalizeChapter(origChapter)
      for (const ann of anns) results.push({ slug, chapter: nc, origChapter, annotation: ann })
    } catch {}
  }
  return results.sort((a, b) => b.annotation.createdAt - a.annotation.createdAt)
}

function exportMarkdown(groups: Array<{ book: string; chapters: Array<{ name: string; annotations: Annotation[] }> }>) {
  let md = '# 读书笔记 — 命理学术中心\n\n'
  for (const group of groups) {
    md += `## 《${group.book}》\n\n`
    for (const ch of group.chapters) {
      md += `### ${ch.name}\n\n`
      for (const ann of ch.annotations) {
        md += `- **${TYPE_LABELS[ann.type]}**「${ann.selectedText}」\n`
        if (ann.note) md += `  > ${ann.note}\n`
        md += '\n'
      }
    }
  }
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '命理学术笔记.md'
  a.click()
  URL.revokeObjectURL(url)
}

const btnBase: React.CSSProperties = {
  background: 'none',
  border: '1px solid var(--color-border)',
  borderRadius: 6,
  padding: '6px 12px',
  color: 'var(--color-text-dim)',
  cursor: 'pointer',
  fontSize: 13,
  transition: 'all 0.2s',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
}

const checkboxStyle: React.CSSProperties = {
  cursor: 'pointer',
  accentColor: 'var(--color-gold)',
  flexShrink: 0,
  margin: 0,
  width: 14,
  height: 14,
}

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
              <button onClick={() => setTab('annotation')} style={{ ...btnBase, lineHeight: 1.5, color: tab === 'annotation' ? 'var(--color-gold)' : 'var(--color-text-dim)', borderColor: tab === 'annotation' ? 'var(--color-gold)' : 'var(--color-border)' }}>
                <MessageSquare size={14} />批注 {total > 0 ? `(${total})` : ''}
              </button>
              <button onClick={() => setTab('bookmark')} style={{ ...btnBase, lineHeight: 1.5, color: tab === 'bookmark' ? 'var(--color-gold)' : 'var(--color-text-dim)', borderColor: tab === 'bookmark' ? 'var(--color-gold)' : 'var(--color-border)' }}>
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
                <button onClick={() => exportMarkdown(groups)} style={{ ...btnBase, borderColor: 'var(--color-purple)', color: 'var(--color-purple-light)' }}>
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
                    <input type="checkbox" checked={bmTotal > 0 && selectedBm.size === bookmarks.flatMap(b => b.chapters).length} onChange={toggleAllBm} style={checkboxStyle} />
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)', cursor: 'pointer' }} onClick={toggleAllBm}>全选</span>
                    <div style={{ flex: 1 }} />
                    {selectedBm.size > 0 && (
                      <>
                        <span style={{ fontSize: 13, color: 'var(--color-text-dim)' }}>已选 {selectedBm.size} 项</span>
                        <button onClick={handleBatchDeleteBm} style={{ ...btnBase, borderColor: '#d0505066', color: '#d05050' }}><Trash2 size={14} />删除选中</button>
                      </>
                    )}
                  </div>
                  {filteredBookmarks.map(bm => {
                    const book = books.find(b => b.slug === bm.slug)
                    return (
                      <div key={bm.slug} className="notes-book">
                        <div className="notes-book-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input type="checkbox" checked={bm.chapters.every(ch => selectedBm.has(`${bm.slug}::${ch}`))} onChange={() => { const keys = bm.chapters.map(ch => `${bm.slug}::${ch}`); setSelectedBm(prev => { const allSelected = keys.every(k => prev.has(k)); const next = new Set(prev); for (const k of keys) { if (allSelected) next.delete(k); else next.add(k) } return next }) }} style={checkboxStyle} />
                          <Link to={`/${bm.slug}`} style={{ color: 'var(--color-gold)', textDecoration: 'none' }}>《{book?.title || bm.slug}》</Link>
                        </div>
                        {bm.chapters.map(ch => (
                          <div key={ch} className="notes-chapter" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                              <input type="checkbox" checked={selectedBm.has(`${bm.slug}::${ch}`)} onChange={() => { setSelectedBm(prev => { const n = new Set(prev); if (n.has(`${bm.slug}::${ch}`)) n.delete(`${bm.slug}::${ch}`); else n.add(`${bm.slug}::${ch}`); return n }) }} style={checkboxStyle} />
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
                    <input type="checkbox" checked={total > 0 && selectedAnn.size === all.length} onChange={toggleAllAnn} style={checkboxStyle} />
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)', cursor: 'pointer' }} onClick={toggleAllAnn}>全选</span>
                    <div style={{ flex: 1 }} />
                    {selectedAnn.size > 0 && (
                      <>
                        <span style={{ fontSize: 13, color: 'var(--color-text-dim)' }}>已选 {selectedAnn.size} 项</span>
                        <button onClick={handleBatchDeleteAnn} style={{ ...btnBase, borderColor: '#d0505066', color: '#d05050' }}><Trash2 size={14} />删除选中</button>
                      </>
                    )}
                  </div>
                  {groups.map(group => (
                    <div key={group.slug} className="notes-book">
                      <div className="notes-book-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input type="checkbox" checked={group.chapters.every(ch => ch.annotations.every(a => selectedAnn.has(a.id)))} onChange={() => { const ids = group.chapters.flatMap(ch => ch.annotations.map(a => a.id)); setSelectedAnn(prev => { const allSelected = ids.every(id => prev.has(id)); const next = new Set(prev); for (const id of ids) { if (allSelected) next.delete(id); else next.add(id) } return next }) }} style={checkboxStyle} />
                        <Link to={`/${group.slug}`} style={{ color: 'var(--color-gold)', textDecoration: 'none' }}>《{group.book}》</Link>
                      </div>
                      {group.chapters.map(ch => (
                        <div key={ch.name} className="notes-chapter">
                          <div className="notes-chapter-name">{ch.name}</div>
                          {ch.annotations.map(ann => (
                            <div key={ann.id} className="notes-item">
                              <div className="notes-item-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <input type="checkbox" checked={selectedAnn.has(ann.id)} onChange={() => toggleAnnSelect(ann.id)} style={checkboxStyle} />
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
