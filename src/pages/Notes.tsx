import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { books } from '../data/books'
import type { Annotation, AnnotationType } from '../hooks/useAnnotations'
import { ThemeToggle, LangToggle } from '../main'

const ANN_KEY = 'mingli_annotations'

const TYPE_LABELS: Record<AnnotationType, string> = {
  emphasis: '重点',
  question: '疑问',
  quote: '引用',
}
const TYPE_LABELS_KEY: Record<AnnotationType, string> = {
  emphasis: 'annotations.emphasis',
  question: 'annotations.question',
  quote: 'annotations.quote',
}
const TYPE_COLORS: Record<AnnotationType, string> = {
  emphasis: 'var(--color-gold)',
  question: '#d05050',
  quote: '#60c060',
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

function exportMarkdown(groups: Array<{ book: string; chapters: Array<{ name: string; annotations: Annotation[] }> }>, label: Record<AnnotationType, string> = TYPE_LABELS) {
  let md = '# 读书笔记 — 命理学术中心\n\n'
  for (const group of groups) {
    md += `## 《${group.book}》\n\n`
    for (const ch of group.chapters) {
      md += `### ${ch.name}\n\n`
      for (const ann of ch.annotations) {
        md += `- **${label[ann.type]}**「${ann.selectedText}」\n`
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
  const { t } = useTranslation()
  const all = useMemo(() => loadAllAnnotations(), [])

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

  return (
    <>
      <Helmet>
        <title>{t('notes.title')} — 命理学术中心</title>
        <meta name="description" content={t('notes.total').replace('{n}', String(total))} />
      </Helmet>
      <div className="page-container-narrow">
        <div className="book-hero">
          <div className="book-hero-glow" />
          <div className="hero-badge">{t('notes.title')}</div>
          <h1 style={{ fontSize: 24, color: 'var(--color-gold)', fontWeight: 'bold', letterSpacing: 5, marginBottom: 8 }}>
            {t('notes.title')}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-dim)' }}>
            {t('notes.total').replace('{n}', String(total))}
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <LangToggle />
            <ThemeToggle />
          </div>
        </div>

        <div className="container-wide" style={{ marginBottom: 20 }}>
          <Link to="/" className="back-link">{t('bookApp.back')}</Link>
        </div>

        {total > 0 && (
          <div style={{ marginBottom: 20 }}>
            <button
              className="btn-primary"
              onClick={() => exportMarkdown(groups, { emphasis: t('annotations.emphasis'), question: t('annotations.question'), quote: t('annotations.quote') })}
              style={{ padding: '8px 20px', cursor: 'pointer', borderRadius: 8, background: 'var(--color-purple)', border: 'none', color: 'white', fontSize: 14 }}
            >
              t('notes.export')
            </button>
          </div>
        )}

        <div className="notes-list">
          {groups.length === 0 && (
            <div className="notes-empty">
              <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
              <div style={{ fontSize: 16, color: 'var(--color-text-dim)', marginBottom: 8 }}>{t('notes.empty')}</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{t('notes.emptyHint')}</div>
              <div style={{ marginTop: 20 }}>
                <Link to="/ditiansui-site" style={{ color: 'var(--color-purple-light)', fontSize: 14 }}>{t('notes.goRead')}</Link>
              </div>
            </div>
          )}
          {groups.map(group => (
            <div key={group.slug} className="notes-book">
              <div className="notes-book-title">
                <Link to={`/${group.slug}`} style={{ color: 'var(--color-gold)', textDecoration: 'none' }}>《{group.book}》</Link>
              </div>
              {group.chapters.map(ch => (
                <div key={ch.name} className="notes-chapter">
                  <div className="notes-chapter-name">{ch.name}</div>
                  {ch.annotations.map(ann => (
                    <div key={ann.id} className="notes-item">
                      <div className="notes-item-header">
                        <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 3, background: TYPE_COLORS[ann.type] + '22', color: TYPE_COLORS[ann.type], border: `1px solid ${TYPE_COLORS[ann.type]}55` }}>
                          {t(TYPE_LABELS_KEY[ann.type])}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                          {new Date(ann.createdAt).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                      <div className="notes-item-text">「{ann.selectedText}」</div>
                      {ann.note && <div className="notes-item-note">{ann.note}</div>}
                      <div className="notes-item-actions">
                        <Link to={`/${group.slug}`} className="notes-item-link">查看原文 →</Link>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default Notes