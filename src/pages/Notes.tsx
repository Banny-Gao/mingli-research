import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { books } from '../data/books'
import type { Annotation, AnnotationType } from '../hooks/useAnnotations'
import { ThemeToggle } from '../main'

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

function loadAllAnnotations(): Array<{ slug: string; chapter: string; annotation: Annotation }> {
  const results: Array<{ slug: string; chapter: string; annotation: Annotation }> = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith(ANN_KEY)) continue
    const parts = key.replace(ANN_KEY + '_', '').split('_', 2)
    if (parts.length !== 2) continue
    const [slug, chapter] = parts
    try {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const anns: Annotation[] = JSON.parse(raw)
      for (const ann of anns) results.push({ slug, chapter, annotation: ann })
    } catch {}
  }
  return results.sort((a, b) => b.annotation.createdAt - a.annotation.createdAt)
}

function exportMarkdown(
  groups: Array<{ book: string; chapters: Array<{ name: string; annotations: Annotation[] }> }>
) {
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

const Notes: React.FC = () => {
  const [refresh, setRefresh] = useState(0)
  const all = useMemo(() => loadAllAnnotations(), [refresh])
  const bookmarks = useMemo(() => loadAllBookmarks(), [refresh])

  const groups = useMemo(() => {
    const map = new Map<string, Map<string, Annotation[]>>()
    for (const item of all) {
      if (!map.has(item.slug)) map.set(item.slug, new Map())
      const chMap = map.get(item.slug)!
      if (!chMap.has(item.chapter)) chMap.set(item.chapter, [])
      chMap.get(item.chapter)!.push(item.annotation)
    }
    return Array.from(map.entries()).map(([slug, chMap]) => {
      const book = books.find(b => b.slug === slug)
      return {
        slug,
        book: book?.title || slug,
        chapters: Array.from(chMap.entries()).map(([name, annotations]) => ({ name, annotations })),
      }
    })
  }, [all])

  const total = all.length
  const bmTotal = bookmarks.reduce((s, b) => s + b.chapters.length, 0)

  return (
    <>
      <Helmet>
        <title>读书笔记 — 命理学术中心</title>
        <meta name="description" content={`已收录 ${total} 条批注`} />
      </Helmet>
      <div className="page-wrapper">
        <div className="top-actions">
          <ThemeToggle />
        </div>
        <div className="page-container-narrow">
          <div className="book-hero">
            <div className="book-hero-glow" />
            <div className="hero-badge">批注管理</div>
            <h1
              style={{
                fontSize: 32,
                color: 'var(--color-gold)',
                fontWeight: '700',
                letterSpacing: 6,
                marginBottom: 10,
                textShadow: '0 0 30px var(--color-gold-glow)',
              }}
            >
              我的笔记
            </h1>
            <p style={{ fontSize: 13, color: 'var(--color-text-dim)', letterSpacing: 2 }}>
              {total} 条批注 · {bmTotal} 个收藏
            </p>
          </div>

          <div
            className="container-wide"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <Link to="/" className="back-link">
              ← 返回典籍首页
            </Link>
            {total > 0 && (
              <button
                className="btn-text"
                onClick={() => exportMarkdown(groups)}
                style={{ borderColor: 'var(--color-purple)', color: 'var(--color-purple-light)' }}
              >
                导出 Markdown
              </button>
            )}
          </div>

          {/* 收藏列表 */}
          {bmTotal > 0 && (
            <div className="notes-section">
              <div className="section-header">
                <span className="section-title">我的收藏</span>
                <span className="section-badge">{bmTotal} 篇</span>
              </div>
              {bookmarks.map(bm => {
                const book = books.find(b => b.slug === bm.slug)
                return (
                  <div key={bm.slug} className="notes-book">
                    <div className="notes-book-title">
                      <Link to={`/${bm.slug}`} style={{ color: 'var(--color-gold)', textDecoration: 'none' }}>
                        《{book?.title || bm.slug}》
                      </Link>
                    </div>
                    {bm.chapters.map(ch => (
                      <div key={ch} className="notes-chapter">
                        <div className="notes-chapter-name">{ch}</div>
                        <Link to={`/${bm.slug}?open=interp&key=${encodeURIComponent(ch)}`} className="notes-item-link">
                          继续阅读 →
                        </Link>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          )}

          {/* 批注列表 */}
          <div className="notes-section">
            <div className="section-header">
              <span className="section-title">批注记录</span>
              <span className="section-badge">{total} 条</span>
            </div>
            {groups.length === 0 && (
              <div className="notes-empty">
                <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
                <div style={{ fontSize: 16, color: 'var(--color-text-dim)', marginBottom: 8 }}>
                  暂无批注
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                  在阅读篇目时选中文本添加批注，批注将显示在这里
                </div>
                <div style={{ marginTop: 20 }}>
                  <Link
                    to="/ditiansui-site"
                    style={{ color: 'var(--color-purple-light)', fontSize: 14 }}
                  >
                    前往阅读 →
                  </Link>
                </div>
              </div>
            )}
            {groups.map(group => (
              <div key={group.slug} className="notes-book">
                <div className="notes-book-title">
                  <Link
                    to={`/${group.slug}`}
                    style={{ color: 'var(--color-gold)', textDecoration: 'none' }}
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
                          <span
                            style={{
                              fontSize: 10,
                              padding: '1px 6px',
                              borderRadius: 3,
                              background: TYPE_COLORS[ann.type] + '22',
                              color: TYPE_COLORS[ann.type],
                              border: `1px solid ${TYPE_COLORS[ann.type]}55`,
                            }}
                          >
                            {TYPE_LABELS[ann.type]}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                            {new Date(ann.createdAt).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                        <div className="notes-item-text">「{ann.selectedText}」</div>
                        {ann.note && <div className="notes-item-note">{ann.note}</div>}
                        <div className="notes-item-actions">
                          <Link to={`/${group.slug}`} className="notes-item-link">
                            查看原文 →
                          </Link>
                          <button
                            onClick={() => { deleteAnnotation(group.slug, ch.name, ann.id); setRefresh(v => v + 1) }}
                            style={{
                              background: 'none', border: 'none', color: 'var(--color-text-muted)',
                              cursor: 'pointer', fontSize: 12, padding: 0,
                            }}
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default Notes
