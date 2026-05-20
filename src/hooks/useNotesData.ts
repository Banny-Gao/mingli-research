import { skillToInterp } from '../data/ditiansui-site/assoc'
import type { Annotation, AnnotationType } from './useAnnotations'

const ANN_KEY = 'mingli_annotations'
const BOOKMARK_KEY = 'mingli_bookmarks'

export const TYPE_LABELS: Record<AnnotationType, string> = {
  emphasis: '重点',
  question: '疑问',
  quote: '引用',
}
export const TYPE_COLORS: Record<AnnotationType, string> = {
  emphasis: 'var(--color-gold)',
  question: '#d05050',
  quote: '#60c060',
}

export function normalizeChapter(chapter: string): string {
  const interp = (skillToInterp as Record<string, string[]>)[chapter]
  return interp && interp.length > 0 ? interp[0] : chapter
}

export function deleteAnnotation(slug: string, chapter: string, annId: string) {
  const key = `${ANN_KEY}_${slug}_${chapter}`
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return
    const anns: Annotation[] = JSON.parse(raw).filter((a: Annotation) => a.id !== annId)
    if (anns.length === 0) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(anns))
  } catch {
    /* ignore parse errors */
  }
}

export function batchDeleteAnnotations(
  items: Array<{ slug: string; origChapter: string; id: string }>
) {
  for (const item of items) {
    deleteAnnotation(item.slug, item.origChapter, item.id)
  }
}

export function batchDeleteBookmarks(items: Array<{ slug: string; chapter: string }>) {
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
    } catch {
      /* ignore parse errors */
    }
  }
}

export function loadAllBookmarks(): Array<{
  slug: string
  chapters: Array<{ name: string; type: string }>
}> {
  const map = new Map<string, Array<{ name: string; type: string }>>()
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith(BOOKMARK_KEY)) continue
    const slug = key.replace(BOOKMARK_KEY + '_', '')
    try {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const parsed = JSON.parse(raw)
      const entries: Array<{ name: string; type: string }> = []
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (typeof item === 'string') entries.push({ name: item, type: 'interp' })
          else if (item?.key) entries.push({ name: item.key, type: item.type || 'interp' })
        }
      }
      if (entries.length > 0) map.set(slug, entries)
    } catch {
      /* ignore parse errors */
    }
  }
  return Array.from(map.entries()).map(([slug, chapters]) => ({ slug, chapters }))
}

export function loadAllAnnotations(): Array<{
  slug: string
  chapter: string
  origChapter: string
  annotation: Annotation
}> {
  const results: Array<{
    slug: string
    chapter: string
    origChapter: string
    annotation: Annotation
  }> = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith(ANN_KEY)) continue
    // Strip __source suffix before parsing chapter name
    const cleanKey = key.replace(/__source$/, '')
    // FIXME: split('_', 2) breaks if slug contains underscores.
    // Currently slugs use hyphens (e.g. "ditiansui-site"), so this is safe.
    // If future slugs include underscores, switch to a prefix-strip approach.
    const parts = cleanKey.replace(ANN_KEY + '_', '').split('_', 2)
    if (parts.length !== 2 || !parts[1]) continue
    const [slug, origChapter] = parts
    try {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const anns: Annotation[] = JSON.parse(raw)
      const nc = normalizeChapter(origChapter)
      for (const ann of anns) results.push({ slug, chapter: nc, origChapter, annotation: ann })
    } catch {
      /* ignore parse errors */
    }
  }
  return results.sort((a, b) => b.annotation.createdAt - a.annotation.createdAt)
}

export function exportMarkdown(
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
