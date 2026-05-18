#!/usr/bin/env node
/**
 * generate.js — 读取每本书的 catalog.md 生成数据文件
 *
 * 多文件输出模式（R1）：
 * - 每个篇目/技能输出为独立 .ts 文件
 * - 保留 compat layer 兼容层供旧消费者
 * - 生成类型文件（InterpKey / SkillKey）
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { marked } from 'marked'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// catalog.md 元信息 key 名配置（可按需扩展）
const META_KEYS = {
  author: ['作者'],
  version: ['版本'],
  description: ['简介'],
  section: ['术数'],
}
function buildMetaPattern(keys) {
  return new RegExp(`^>\\s*(?:${keys.join('|')})[：:]`)
}
const ROOT = path.join(__dirname, '../books')
const OUT_DIR = path.join(__dirname, '../src/data')
const PUBLIC_DIR = path.join(__dirname, '../public')

marked.setOptions({ gfm: true, breaks: false })

function headingId(text) {
  return text.replace(/[^\w一-鿿\s-]/g, '').trim().replace(/\s+/g, '-').toLowerCase()
}

const renderer = {
  heading({ text, depth }) {
    const id = headingId(text)
    return `<h${depth} id="${id}">${text}</h${depth}>`
  },
}

marked.use({ renderer })

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getSnippet(text, q, len = 60) {
  const idx = text.toLowerCase().indexOf(q.toLowerCase())
  if (idx === -1) return text.slice(0, len)
  const start = Math.max(0, idx - 20)
  const end = Math.min(text.length, idx + q.length + 40)
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '')
}

function parseMarkdown(md) {
  if (!md) return ''
  const clean = md.replace(/^---[\s\S]*?---\n/, '').trim()
  return String(marked.parse(clean))
}

function parseCatalog(catalogPath) {
  const content = fs.readFileSync(catalogPath, 'utf-8')
  const rows = []
  let currentCategory = ''
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    if (/^##\s/.test(trimmed)) {
      currentCategory = trimmed.replace(/^##\s*/, '')
      continue
    }
    if (/^#\s/.test(trimmed)) continue
    if (trimmed.match(/^\|[-\s:|]+\|$/)) continue
    const cells = trimmed
      .split('|')
      .map(c => c.trim())
      .filter(c => c !== '')
    if (cells.length < 3) continue
    const num = cells[0]
    if (!/^\d+$/.test(num)) continue
    // 6 列格式: [num, title, sourcePath, interpPath, status, skills]
    let status = ''
    let skills = []
    if (cells.length >= 5) {
      status = cells.length >= 6 ? cells[4] : cells[3]
      if (cells.length >= 6) {
        skills = cells[5]
          ? cells[5]
              .split(',')
              .map(s => s.trim())
              .filter(Boolean)
          : []
      }
    }
    rows.push({
      num,
      title: cells[1],
      sourcePath: cells[2] || '',
      interpPath: cells.length >= 6 ? cells[3] : '',
      status,
      skills,
      category: currentCategory,
    })
  }
  return rows
}

const META_PATTERNS = {
  author: buildMetaPattern(META_KEYS.author),
  version: buildMetaPattern(META_KEYS.version),
  description: buildMetaPattern(META_KEYS.description),
  section: buildMetaPattern(META_KEYS.section),
}

function parseBookMeta(filePath) {
  if (!fs.existsSync(filePath)) return null
  const content = fs.readFileSync(filePath, 'utf-8')
  const m = content.match(/# 《([^》]+)》/)
  const title = m ? m[1] : null

  let author = ''
  let version = ''
  let description = ''
  let section = ''
  for (const line of content.split('\n')) {
    const t = line.trim()
    if (META_PATTERNS.author.test(t)) author = t.replace(META_PATTERNS.author, '').trim()
    else if (META_PATTERNS.version.test(t)) version = t.replace(META_PATTERNS.version, '').trim()
    else if (META_PATTERNS.description.test(t)) description = t.replace(META_PATTERNS.description, '').trim()
    else if (META_PATTERNS.section.test(t)) section = t.replace(META_PATTERNS.section, '').trim()
  }

  return { title, author, version, description, section }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

const BOOK_DIRS = fs.readdirSync(ROOT).filter(f => {
  const p = path.join(ROOT, f)
  return (
    fs.statSync(p).isDirectory() &&
    fs.existsSync(path.join(p, 'catalog.md'))
  )
})

const books = []

for (const bookSlug of BOOK_DIRS) {
  const bookRoot = path.join(ROOT, bookSlug)
  const catalogPath = path.join(bookRoot, 'catalog.md')

  const meta = parseBookMeta(catalogPath) || { title: bookSlug, author: '', version: '', description: '', section: '' }
  const title = meta.title
  const author = meta.author
  const version = meta.version
  const description = meta.description
  const section = meta.section
  const catalogRows = parseCatalog(catalogPath)

  const chapters = []
  const chaptersData = {}
  const sourceData = {}
  const interpKeys = []
  const skillKeys = []

  for (const row of catalogRows) {
    const isDone = row.status === '已解读' && row.interpPath && row.interpPath.length > 0
    chapters.push({ num: row.num, name: row.title, isDone, category: row.category })

    if (isDone) {
      const fullPath = path.join(bookRoot, row.interpPath)
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8')
        const html = parseMarkdown(content)
        chaptersData[row.title] = html
        interpKeys.push(row.title)
      } else {
        console.warn(`  ⚠️ 跳过缺失解读文件: ${fullPath}`)
      }
    }

    // 读取 source 内容
    if (row.sourcePath) {
      const sourcePath = path.join(bookRoot, row.sourcePath)
      if (fs.existsSync(sourcePath)) {
        const content = fs.readFileSync(sourcePath, 'utf-8')
        sourceData[row.title] = parseMarkdown(content)
      }
    }
  }

  // 读取 skills（从 articles/ 目录根据 catalog 中 skills 列指定）
  const skillsData = {}
  const skillsRawData = {}
  const skillDisplayNames = {}
  for (const row of catalogRows) {
    if (row.skills && row.skills.length > 0) {
      for (const skillName of row.skills) {
        const skillPath = path.join(bookRoot, 'articles', row.title, 'skill.md')
        if (fs.existsSync(skillPath)) {
          const content = fs.readFileSync(skillPath, 'utf-8')
          skillsData[skillName] = parseMarkdown(content)
          skillsRawData[skillName] = content
          // Extract displayName from YAML frontmatter
          const dnMatch = content.match(/^---[\s\S]*?\ndisplayName:\s*(.+)\n[\s\S]*?^---/m)
          if (dnMatch) skillDisplayNames[skillName] = dnMatch[1].trim()
          if (!skillKeys.includes(skillName)) skillKeys.push(skillName)
        } else {
          console.warn(`  ⚠️ 跳过缺失技能文件: ${skillPath}`)
        }
      }
    }
  }

  const doneCount = chapters.filter(c => c.isDone).length

  // Build association map
  const interpToSkill = {}
  const skillToInterp = {}
  for (const row of catalogRows) {
    if (row.skills.length > 0) {
      interpToSkill[row.title] = row.skills
      for (const sk of row.skills) {
        if (!skillToInterp[sk]) skillToInterp[sk] = []
        if (!skillToInterp[sk].includes(row.title)) skillToInterp[sk].push(row.title)
      }
    }
  }

  books.push({
    slug: bookSlug,
    title,
    author,
    version,
    description,
    section,
    total: chapters.length,
    done: doneCount,
    chapters,
    chaptersData,
    skillsData,
    skillsRawData,
    sourceData,
    interpKeys,
    skillKeys,
  })

  // ===== 输出（content.ts + assoc.ts + index.ts）=====
  const bookOutDir = path.join(OUT_DIR, bookSlug)
  ensureDir(bookOutDir)

  // 清理旧子目录（interp/source/skill），已合并到 content.ts
  for (const sub of ['interp', 'source', 'skill']) {
    const subDir = path.join(bookOutDir, sub)
    if (fs.existsSync(subDir)) fs.rmSync(subDir, { recursive: true })
  }

  // 写入 content.ts（所有内容加载器 + extractPathKey 只写一次）
  const sourceKeys = Object.keys(sourceData)
  const contentTs = `// Auto-generated — do not edit manually

const interpModules = import.meta.glob(
  '../../../books/${bookSlug}/articles/*/interpretation.md',
  { query: '?raw', import: 'default', eager: false }
)
const sourceModules = import.meta.glob(
  '../../../books/${bookSlug}/articles/*/source.md',
  { query: '?raw', import: 'default', eager: false }
)
const skillModules = import.meta.glob(
  '../../../books/${bookSlug}/articles/*/skill.md',
  { query: '?raw', import: 'default', eager: false }
)

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

export const interpKeys = ${JSON.stringify(interpKeys)} as const;
export const interpContent = extractPathKey(interpModules as any, '/interpretation.md');
export const sourceKeys = ${JSON.stringify(sourceKeys)} as const;
export const sourceContent = extractPathKey(sourceModules as any, '/source.md');
export const skillKeys = ${JSON.stringify(skillKeys)} as const;
export const skillContent = extractPathKey(skillModules as any, '/skill.md');
export const skillRawContent = extractPathKey(skillModules as any, '/skill.md');
export const skillDisplayNames: Record<string, string> = ${JSON.stringify(skillDisplayNames, null, 2)};
`
  fs.writeFileSync(path.join(bookOutDir, 'content.ts'), contentTs)

  // 写入 assoc.ts
  const assocContent = `// Auto-generated — do not edit manually
export const interpToSkill: Record<string, string[]> = ${JSON.stringify(interpToSkill, null, 2)};
export const skillToInterp: Record<string, string[]> = ${JSON.stringify(skillToInterp, null, 2)};
`
  fs.writeFileSync(path.join(bookOutDir, 'assoc.ts'), assocContent)

  // 写入 book-level index.ts（平铺导出，无 namespace 嵌套）
  const interpType = interpKeys.map(k => `'${k.replace(/'/g, "\\'")}'`).join(' | ')
  const skillType = skillKeys.map(k => `'${k}'`).join(' | ')
  const sourceType =
    sourceKeys.length > 0 ? sourceKeys.map(k => `'${k.replace(/'/g, "\\'")}'`).join(' | ') : 'never'

  const indexContent = `// Auto-generated — do not edit manually
export { interpKeys, interpContent, sourceKeys, sourceContent, skillKeys, skillContent, skillRawContent, skillDisplayNames } from './content';
export { interpToSkill, skillToInterp } from './assoc';

// 类型定义
export type InterpKey = ${interpType || 'never'};
export type SkillKey = ${skillType || 'never'};
export type SourceKey = ${sourceType || 'never'};
`
  fs.writeFileSync(path.join(bookOutDir, 'index.ts'), indexContent)
}

// 生成 book-types.ts
const bookTypesContent = `// Auto-generated by scripts/generate.js — do not edit manually

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
`
fs.writeFileSync(path.join(OUT_DIR, 'book-types.ts'), bookTypesContent)

// 生成 books.ts（仅数据，类型从 book-types.ts 导入）
const VALID_SECTIONS = ['山', '医', '命', '相', '卜']
const bookData = books.map(b => ({
  slug: b.slug,
  section: VALID_SECTIONS.includes(b.section) ? b.section : (() => { console.warn('  ⚠️ ' + b.slug + ' 术数无效: "' + b.section + '"，默认 "命"'); return '命' })(),
  title: b.title,
  author: b.author,
  version: b.version,
  description: b.description,
  total: b.total,
  done: b.done,
  chapters: b.chapters,
  skills: Object.keys(b.skillsData)
    .sort((a, bb) => a.localeCompare(bb, 'zh'))
    .map(name => ({ name })),
  sources: Object.keys(b.sourceData || {})
    .sort((a, bb) => a.localeCompare(bb, 'zh'))
    .map(name => ({ name })),
}))

const booksTs = `// Auto-generated by scripts/generate.js — do not edit manually
import type { Book } from './book-types';

export const books: Book[] = ${JSON.stringify(bookData, null, 2)};
`

fs.writeFileSync(path.join(OUT_DIR, 'books.ts'), booksTs)

// 更新 index.ts
let indexExports = '// Auto-generated — do not edit manually\n'
for (const book of books) {
  indexExports += `export * from './${book.slug}';\n`
}
fs.writeFileSync(path.join(OUT_DIR, 'index.ts'), indexExports)

// 生成 registry.ts（多书动态加载，避免前端硬编码 slug）
function safeIdent(slug) { return slug.replace(/[^a-zA-Z0-9_$]/g, '_') }
const registryImports = books.map(b => {
  const id = safeIdent(b.slug)
  return `import * as _${id} from './${b.slug}';`
}).join('\n')
const registryMap = books.map(b => {
  const id = safeIdent(b.slug)
  return `  '${b.slug}': _${id},`
}).join('\n')
const registryContent = `// Auto-generated — do not edit manually
// 动态加载各典籍数据，避免前端代码硬编码 slug
${registryImports}

const registry: Record<string, any> = {
${registryMap}
};

export function getBook(slug: string) {
  return registry[slug] ?? {};
}
`
fs.writeFileSync(path.join(OUT_DIR, 'registry.ts'), registryContent)

console.log(`Generated ${books.length} book(s):`)
for (const b of books) {
  console.log(`  ${b.slug}: total=${b.total}, done=${b.done}`)
  console.log(`    interp keys: ${b.interpKeys.join(', ')}`)
  console.log(`    skill keys: ${b.skillKeys.join(', ')}`)
}

// ===== 全文搜索索引 =====
ensureDir(PUBLIC_DIR)
const searchIndex = books.map(b => ({
  slug: b.slug,
  title: b.title,
  interp: b.interpKeys.map(k => ({
    key: k,
    text: stripHtml(b.chaptersData[k] || ''),
  })),
  skill: b.skillKeys.map(k => ({
    key: k,
    displayName: (b.skillsRawData[k]?.match(/^---[\s\S]*?\ndisplayName:\s*(.+)\n[\s\S]*?^---/m)?.[1] ?? k),
    text: stripHtml(b.skillsData[k] || ''),
  })),
  source: Object.keys(b.sourceData || {}).map(k => ({
    key: k,
    text: stripHtml(b.sourceData[k] || ''),
  })),
}))
fs.writeFileSync(path.join(PUBLIC_DIR, 'search-index.json'), JSON.stringify(searchIndex, null, 2))
console.log('search-index.json generated.')
console.log('Done.')
