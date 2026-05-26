#!/usr/bin/env node
/**
 * generate.js — 读取每本书的 catalog.md 生成数据文件
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { marked } from 'marked'
import { stripHtml } from './lib/utils.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '../books')
const OUT_DIR = path.join(__dirname, '../src/data')
const PUBLIC_DIR = path.join(__dirname, '../public')
const MAX_SEARCH_TEXT = 3000
const VALID_SECTIONS = ['山', '医', '命', '相', '卜']

marked.setOptions({ gfm: true, breaks: false })

// ===== 工具 =====

const buildMetaPattern = keys =>
  new RegExp(`^>\\s*(?:${keys.join('|')})[：:]`)

const headingId = text =>
  text.replace(/[^\w一-鿿\s-]/g, '').trim().replace(/\s+/g, '-').toLowerCase()

const parseMarkdown = md => {
  if (!md) return ''
  const clean = md.replace(/^---[\s\S]*?---\n/, '').trim()
  return String(marked.parse(clean))
}

const truncateText = (text, max) =>
  text.length > max ? text.slice(0, max) : text

// ===== catalog.md 解析 =====

const META_KEYS = {
  author: ['作者'],
  version: ['版本'],
  description: ['简介'],
  section: ['术数'],
  category: ['类别'],
  contentTypes: ['内容类型'],
}

const META_PATTERNS = Object.fromEntries(
  Object.entries(META_KEYS).map(([k, v]) => [k, buildMetaPattern(v)])
)

const parseBookMeta = filePath => {
  if (!fs.existsSync(filePath)) return null
  const content = fs.readFileSync(filePath, 'utf-8')
  const title = (content.match(/# 《([^》]+)》/) || [])[1] || null

  const meta = { author: '', version: '', description: '', section: '', category: '', contentTypes: '' }
  for (const line of content.split('\n')) {
    const t = line.trim()
    for (const [key, pattern] of Object.entries(META_PATTERNS)) {
      if (pattern.test(t)) meta[key] = t.replace(pattern, '').trim()
    }
  }
  return { title, ...meta }
}

const parseCatalog = catalogPath => {
  const content = fs.readFileSync(catalogPath, 'utf-8')
  const rows = []
  let currentCategory = ''

  for (const line of content.split('\n')) {
    const t = line.trim()
    if (!t) continue
    if (/^##\s/.test(t)) { currentCategory = t.replace(/^##\s*/, ''); continue }
    if (/^#\s/.test(t) || t.match(/^\|[-\s:|]+\|$/)) continue
    const cells = t.split('|').map(c => c.trim()).filter(c => c)
    if (cells.length < 3 || !/^\d+$/.test(cells[0])) continue
    rows.push({
      num: cells[0],
      title: cells[1],
      status: cells[2] || '',
      skills: cells[3] ? cells[3].split(',').map(s => s.trim()).filter(Boolean) : [],
      category: currentCategory,
    })
  }
  return rows
}

// ===== 书数据构建 =====

const readChapterContent = (bookRoot, row, chaptersData, interpKeys, sourceData) => {
  const interpPath = `articles/${row.title}/interpretation.md`
  const isDone = row.status === '已解读' && fs.existsSync(path.join(bookRoot, interpPath))

  if (isDone) {
    const fullPath = path.join(bookRoot, interpPath)
    if (fs.existsSync(fullPath)) {
      chaptersData[row.title] = parseMarkdown(fs.readFileSync(fullPath, 'utf-8'))
      interpKeys.push(row.title)
    } else {
      console.warn(`  ⚠️ 跳过缺失解读文件: ${fullPath}`)
    }
  }

  const srcPath = path.join(bookRoot, `articles/${row.title}/source.md`)
  if (fs.existsSync(srcPath)) {
    sourceData[row.title] = parseMarkdown(fs.readFileSync(srcPath, 'utf-8'))
  }

  return { num: row.num, name: row.title, isDone, category: row.category }
}

const readSkills = (bookRoot, catalogRows) => {
  const data = {}, rawData = {}, displayNames = {}, keys = []
  for (const row of catalogRows) {
    if (!row.skills?.length) continue
    for (const sk of row.skills) {
      const p = path.join(bookRoot, 'articles', row.title, 'skill.md')
      if (!fs.existsSync(p)) { console.warn(`  ⚠️ 跳过缺失技能文件: ${p}`); continue }
      const content = fs.readFileSync(p, 'utf-8')
      data[sk] = parseMarkdown(content)
      rawData[sk] = content
      const dn = content.match(/^---[\s\S]*?\ndisplayName:\s*(.+)\n[\s\S]*?^---/m)
      if (dn) displayNames[sk] = dn[1].trim()
      if (!keys.includes(sk)) keys.push(sk)
    }
  }
  return { data, rawData, displayNames, keys }
}

const buildAssoc = catalogRows => {
  const chapterToSkills = {}, skillToChapters = {}
  for (const row of catalogRows) {
    if (!row.skills.length) continue
    chapterToSkills[row.title] = row.skills
    for (const sk of row.skills) {
      if (!skillToChapters[sk]) skillToChapters[sk] = []
      if (!skillToChapters[sk].includes(row.title)) skillToChapters[sk].push(row.title)
    }
  }
  return { chapterToSkills, skillToChapters }
}

const processBook = bookSlug => {
  const bookRoot = path.join(ROOT, bookSlug)
  const catalogPath = path.join(bookRoot, 'catalog.md')
  const meta = parseBookMeta(catalogPath) || { title: bookSlug, author: '', version: '', description: '', section: '', contentTypes: '' }
  const contentTypes = meta.contentTypes ? meta.contentTypes.split(',').map(s => s.trim()).filter(Boolean) : []
  const catalogRows = parseCatalog(catalogPath)

  const chaptersData = {}, sourceData = {}
  const interpKeys = []
  const chapters = catalogRows.map(row =>
    readChapterContent(bookRoot, row, chaptersData, interpKeys, sourceData)
  )

  const skills = readSkills(bookRoot, catalogRows)
  const { chapterToSkills, skillToChapters } = buildAssoc(catalogRows)

  return {
    slug: bookSlug,
    title: meta.title,
    author: meta.author,
    version: meta.version,
    description: meta.description,
    section: meta.section,
    category: meta.category,
    contentTypes,
    total: chapters.length,
    done: chapters.filter(c => c.isDone).length,
    chapters,
    chaptersData,
    sourceData,
    skillsData: skills.data,
    skillsRawData: skills.rawData,
    skillDisplayNames: skills.displayNames,
    interpKeys,
    skillKeys: skills.keys,
    chapterToSkills,
    skillToChapters,
  }
}

// ===== 文件生成 =====

const generateBookFiles = book => {
  const outDir = path.join(OUT_DIR, book.slug)
  fs.mkdirSync(outDir, { recursive: true })

  // 清理旧子目录
  for (const sub of ['interp', 'source', 'skill']) {
    const d = path.join(outDir, sub)
    if (fs.existsSync(d)) fs.rmSync(d, { recursive: true })
  }

  const sourceKeys = Object.keys(book.sourceData)

  const globs = {
    interpretation: `const interpModules = import.meta.glob(
  '../../../books/${book.slug}/articles/*/interpretation.md',
  { query: '?raw', import: 'default', eager: false }
)`,
    source: `const sourceModules = import.meta.glob(
  '../../../books/${book.slug}/articles/*/source.md',
  { query: '?raw', import: 'default', eager: false }
)`,
    skill: `const skillModules = import.meta.glob(
  '../../../books/${book.slug}/articles/*/skill.md',
  { query: '?raw', import: 'default', eager: false }
)`,
  }

  const exports = {
    interpretation: `export const interpKeys = ${JSON.stringify(book.interpKeys)} as const;
export const interpContent = extractPathKey(interpModules as any, '/interpretation.md');`,
    source: `export const sourceKeys = ${JSON.stringify(sourceKeys)} as const;
export const sourceContent = extractPathKey(sourceModules as any, '/source.md');`,
    skill: `export const skillKeys = ${JSON.stringify(book.skillKeys)} as const;
export const skillContent = extractPathKey(skillModules as any, '/skill.md');
export const skillRawContent = extractPathKey(skillModules as any, '/skill.md');
export const skillDisplayNames: Record<string, string> = ${JSON.stringify(book.skillDisplayNames, null, 2)};`,
  }

  const selected = type => book.contentTypes.includes(type)

  fs.writeFileSync(path.join(outDir, 'content.ts'), `// Auto-generated — do not edit manually

${book.contentTypes.filter(t => globs[t]).map(t => globs[t]).join('\n')}

function extractPathKey(mod: Record<string, () => Promise<string>>, suffix: string): Record<string, () => Promise<string>> {
  const result: Record<string, () => Promise<string>> = {};
  for (const key in mod) {
    const idx = key.indexOf('/articles/');
    if (idx === -1) continue;
    const start = idx + '/articles/'.length;
    const end = key.lastIndexOf(suffix);
    if (end === -1) continue;
    result[key.slice(start, end)] = mod[key];
  }
  return result;
}

${book.contentTypes.filter(t => exports[t]).map(t => exports[t]).join('\n')}
`)

  fs.writeFileSync(path.join(outDir, 'assoc.ts'), `// Auto-generated — do not edit manually
export const chapterToSkills: Record<string, string[]> = ${JSON.stringify(book.chapterToSkills, null, 2)};
export const skillToChapters: Record<string, string[]> = ${JSON.stringify(book.skillToChapters, null, 2)};
`)

  const typeExports = {
    interpretation: 'interpKeys, interpContent',
    source: 'sourceKeys, sourceContent',
    skill: 'skillKeys, skillContent, skillRawContent, skillDisplayNames',
  }
  const idxExports = book.contentTypes.filter(t => typeExports[t]).map(t => typeExports[t]).join(', ')
  const chapterKey = book.chapters.length > 0
    ? book.chapters.map(c => JSON.stringify(c.name)).join(' | ')
    : 'never'

  fs.writeFileSync(path.join(outDir, 'index.ts'), `// Auto-generated — do not edit manually
export { ${idxExports} } from './content';
export { chapterToSkills, skillToChapters } from './assoc';

export type ChapterKey = ${chapterKey};
`)
}

const generateGlobalFiles = books => {
  const validateSection = book =>
    VALID_SECTIONS.includes(book.section) ? book.section : (console.warn(`  ⚠️ ${book.slug} 术数无效: "${book.section}"，默认 "命"`), '命')

  const bookData = books.map(b => ({
    slug: b.slug,
    section: validateSection(b),
    category: b.category,
    title: b.title,
    author: b.author,
    version: b.version,
    description: b.description,
    total: b.total,
    done: b.done,
    chapters: b.chapters,
    skills: Object.keys(b.skillsData).sort((a, b) => a.localeCompare(b, 'zh')).map(name => ({ name })),
    sources: Object.keys(b.sourceData || {}).sort((a, b) => a.localeCompare(b, 'zh')).map(name => ({ name })),
  }))

  fs.writeFileSync(path.join(OUT_DIR, 'book-types.ts'), `// Auto-generated by scripts/generate.js — do not edit manually

export type ArtSection = '山' | '医' | '命' | '相' | '卜';

export interface ChapterInfo {
  num: string;
  name: string;
  isDone: boolean;
  category: string;
}

export interface Book {
  slug: string;
  section: ArtSection;
  category: string;
  title: string;
  author: string;
  version: string;
  description: string;
  total: number;
  done: number;
  chapters: ChapterInfo[];
  skills: { name: string }[];
  sources: { name: string }[];
}
`)

  fs.writeFileSync(path.join(OUT_DIR, 'books.ts'), `// Auto-generated by scripts/generate.js — do not edit manually
import type { Book } from './book-types';

export const books: Book[] = ${JSON.stringify(bookData, null, 2)};
`)

  // 全局 index.ts（不再使用 export *，避免多书同名类型冲突；前端通过 getBook() 访问）
  const indexExports = books.map(b => `// see registry.ts for dynamic access`).join('\n')
  fs.writeFileSync(path.join(OUT_DIR, 'index.ts'), `// Auto-generated — do not edit manually
// 前端请使用 import { getBook } from '@/data/registry' 访问各书数据
export { books } from './books'
export type { Book, ChapterInfo, ArtSection } from './book-types'
`)

  const safeIdent = slug => slug.replace(/[^a-zA-Z0-9_$]/g, '_')
  fs.writeFileSync(path.join(OUT_DIR, 'registry.ts'), `// Auto-generated — do not edit manually
// 动态加载各典籍数据，避免前端代码硬编码 slug
${books.map(b => `import * as _${safeIdent(b.slug)} from './${b.slug}';`).join('\n')}

const registry: Record<string, any> = {
${books.map(b => `  '${b.slug}': _${safeIdent(b.slug)},`).join('\n')}
};

export function getBook(slug: string) {
  return registry[slug] ?? {};
}
`)
}

const generateSearchIndex = books => {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true })
  const index = books.map(b => ({
    slug: b.slug,
    section: b.section,
    title: b.title,
    interp: b.interpKeys.map(k => ({ key: k, text: truncateText(stripHtml(b.chaptersData[k] || '', { collapseWhitespace: true }), MAX_SEARCH_TEXT) })),
    skill: b.skillKeys.map(k => ({ key: k, displayName: b.skillsRawData[k]?.match(/^---[\s\S]*?\ndisplayName:\s*(.+)\n[\s\S]*?^---/m)?.[1] ?? k, text: truncateText(stripHtml(b.skillsData[k] || '', { collapseWhitespace: true }), MAX_SEARCH_TEXT) })),
    source: Object.keys(b.sourceData || {}).map(k => ({ key: k, text: truncateText(stripHtml(b.sourceData[k] || '', { collapseWhitespace: true }), MAX_SEARCH_TEXT) })),
  }))
  fs.writeFileSync(path.join(PUBLIC_DIR, 'search-index.json'), JSON.stringify(index, null, 2))
  console.log('search-index.json generated.')
}

// ===== 入口 =====

marked.use({ renderer: { heading({ text, depth }) { return `<h${depth} id="${headingId(text)}">${text}</h${depth}>` } } })

const BOOK_DIRS = fs.readdirSync(ROOT).filter(f =>
  fs.statSync(path.join(ROOT, f)).isDirectory() && fs.existsSync(path.join(ROOT, f, 'catalog.md'))
)

const books = BOOK_DIRS.map(processBook)

for (const book of books) generateBookFiles(book)
generateGlobalFiles(books)
generateSearchIndex(books)

console.log(`Generated ${books.length} book(s):`)
for (const b of books) {
  console.log(`  ${b.slug}: total=${b.total}, done=${b.done}`)
  console.log(`    interp keys: ${b.interpKeys.join(', ')}`)
  console.log(`    skill keys: ${b.skillKeys.join(', ')}`)
}
console.log('Done.')
