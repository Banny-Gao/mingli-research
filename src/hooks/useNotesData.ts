import { ANN_KEY, BOOKMARK_KEY } from '../lib/constants'
import { skillToInterp } from '../data/ditiansui-site/assoc'
import type { Annotation, AnnotationType } from './useAnnotations'

// Constants
const MARKDOWN_TYPE = 'text/markdown;charset=utf-8'
const getDownloadFileName = () => `读书笔记-${new Date().toISOString().slice(0, 10)}.md`

// DP-1: Repository pattern - data access abstraction layer
const AnnotationRepository = {
  key: (slug: string, chapter: string) => `${ANN_KEY}_${slug}_${chapter}`,

  load: (slug: string, chapter: string): Annotation[] => {
    try {
      const raw = localStorage.getItem(AnnotationRepository.key(slug, chapter))
      if (!raw) return []
      return JSON.parse(raw)
    } catch {
      return []
    }
  },

  save: (slug: string, chapter: string, anns: Annotation[]) => {
    if (anns.length === 0) localStorage.removeItem(AnnotationRepository.key(slug, chapter))
    else localStorage.setItem(AnnotationRepository.key(slug, chapter), JSON.stringify(anns))
  },

  deleteOne: (annId: string) => (ann: Annotation) => ann.id !== annId,
}

const BookmarkRepository = {
  key: (slug: string) => `${BOOKMARK_KEY}_${slug}`,

  load: (slug: string): Array<{ name: string; type: string }> => {
    try {
      const raw = localStorage.getItem(BookmarkRepository.key(slug))
      if (!raw) return []
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []
      return parsed.map(item =>
        typeof item === 'string'
          ? { name: item, type: 'interp' }
          : { name: item.key ?? '', type: item.type ?? 'interp' }
      )
    } catch {
      return []
    }
  },

  save: (slug: string, entries: Array<{ name: string; type: string }>) => {
    localStorage.setItem(BookmarkRepository.key(slug), JSON.stringify(entries))
  },
}

export const TYPE_LABELS: Record<AnnotationType, string> = {
  emphasis: '重点',
  question: '疑问',
  quote: '引用',
}
export const TYPE_COLORS: Record<AnnotationType, string> = {
  emphasis: 'var(--color-gold)',
  question: 'var(--color-danger)',
  quote: 'var(--color-quote)',
}

export function normalizeChapter(chapter: string): string {
  const interp = skillToInterp[chapter]
  return interp?.length ? interp[0] : chapter
}

export function deleteAnnotation(slug: string, chapter: string, annId: string) {
  const anns = AnnotationRepository.load(slug, chapter)
  AnnotationRepository.save(slug, chapter, anns.filter(AnnotationRepository.deleteOne(annId)))
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
    const all = BookmarkRepository.load(slug)
    const filtered = all.filter(c => !chapters.has(c.name))
    if (filtered.length === 0) localStorage.removeItem(BookmarkRepository.key(slug))
    else BookmarkRepository.save(slug, filtered)
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
    const entries = BookmarkRepository.load(slug)
    if (entries.length > 0) map.set(slug, entries)
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
  let md = '# 读书笔记 — 玄学文化馆\n\n'
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
  const blob = new Blob([md], { type: MARKDOWN_TYPE })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = getDownloadFileName()
  a.click()
  URL.revokeObjectURL(url)
}
