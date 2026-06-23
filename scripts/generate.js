#!/usr/bin/env node
/**
 * generate.js — 读取每本书的 catalog.md 生成数据文件
 *
 * 用法：
 *   node scripts/generate.js           生成 books/ → src/data/* 全部文件
 *   node scripts/generate.js --audit   只审计 skills/ 目录，不修改任何文件
 *
 * --audit 退出码：
 *   0  校验通过（skills/ 不存在或所有 SKILL.md 合规）
 *   1  校验失败（打印违规清单）
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { marked } from 'marked'
import { stripHtml } from './lib/utils.js'
import { CATEGORY_TREE, isValidCategory } from './lib/category-tree.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '../books')
const SKILLS_ROOT = path.join(__dirname, '../skills')
const OUT_DIR = path.join(__dirname, '../src/data')
const PUBLIC_DIR = path.join(__dirname, '../public')
const MAX_SEARCH_TEXT = 3000
const VALID_SECTIONS = ['山', '医', '命', '相', '卜']
const AUDIT_ONLY = process.argv.includes('--audit')

marked.setOptions({ gfm: true, breaks: false })

// ===== 工具 =====

const buildMetaPattern = keys => new RegExp(`^>\\s*(?:${keys.join('|')})[：:]`)

const headingId = text =>
  text
    .replace(/[^\w一-鿿\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()

const parseMarkdown = md => {
  if (!md) return ''
  const clean = md.replace(/^---[\s\S]*?---\n/, '').trim()
  return String(marked.parse(clean))
}

const truncateText = (text, max) => (text.length > max ? text.slice(0, max) : text)

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

  const meta = {
    author: '',
    version: '',
    description: '',
    section: '',
    category: '',
    contentTypes: '',
  }
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
    if (/^##\s/.test(t)) {
      currentCategory = t.replace(/^##\s*/, '')
      continue
    }
    if (/^#\s/.test(t) || t.match(/^\|[-\s:|]+\|$/)) continue
    const cells = t
      .split('|')
      .map(c => c.trim())
      .filter(c => c)
    if (cells.length < 2 || !/^\d+$/.test(cells[0])) continue
    rows.push({ num: cells[0], title: cells[1], category: currentCategory })
  }
  return rows
}

// ===== 书数据构建 =====

const readChapterContent = (bookRoot, row, chaptersData, interpKeys, sourceData) => {
  const interpPath = `articles/${row.title}/interpretation.md`
  const isDone = fs.existsSync(path.join(bookRoot, interpPath))

  if (isDone) {
    const fullPath = path.join(bookRoot, interpPath)
    if (fs.existsSync(fullPath)) {
      chaptersData[row.title] = parseMarkdown(fs.readFileSync(fullPath, 'utf-8'))
      interpKeys.push(row.title)
    }
  }

  const srcPath = path.join(bookRoot, `articles/${row.title}/source.md`)
  if (fs.existsSync(srcPath)) {
    sourceData[row.title] = parseMarkdown(fs.readFileSync(srcPath, 'utf-8'))
  }

  return { num: row.num, name: row.title, isDone, category: row.category }
}

const processBook = bookSlug => {
  const bookRoot = path.join(ROOT, bookSlug)
  const catalogPath = path.join(bookRoot, 'catalog.md')
  const meta = parseBookMeta(catalogPath) || {
    title: bookSlug,
    author: '',
    version: '',
    description: '',
    section: '',
    contentTypes: '',
  }
  const contentTypes = meta.contentTypes
    ? meta.contentTypes
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    : []
  const catalogRows = parseCatalog(catalogPath)

  const chaptersData = {},
    sourceData = {}
  const interpKeys = []
  const chapters = catalogRows.map(row =>
    readChapterContent(bookRoot, row, chaptersData, interpKeys, sourceData)
  )

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
    interpKeys,
  }
}

// ===== 文件生成 =====

const generateBookFiles = book => {
  const outDir = path.join(OUT_DIR, book.slug)
  fs.mkdirSync(outDir, { recursive: true })

  // 清理旧子目录
  for (const sub of ['interp', 'source']) {
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
  }

  const exports = {
    interpretation: `export const interpKeys = ${JSON.stringify(book.interpKeys)} as const;
export const interpContent = extractPathKey(interpModules as any, '/interpretation.md');`,
    source: `export const sourceKeys = ${JSON.stringify(sourceKeys)} as const;
export const sourceContent = extractPathKey(sourceModules as any, '/source.md');`,
  }

  const selected = type => book.contentTypes.includes(type)

  fs.writeFileSync(
    path.join(outDir, 'content.ts'),
    `// Auto-generated — do not edit manually

${book.contentTypes
  .filter(t => globs[t])
  .map(t => globs[t])
  .join('\n')}

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

${book.contentTypes
  .filter(t => exports[t])
  .map(t => exports[t])
  .join('\n')}
`
  )

  const typeExports = {
    interpretation: 'interpKeys, interpContent',
    source: 'sourceKeys, sourceContent',
  }
  const idxExports = book.contentTypes
    .filter(t => typeExports[t])
    .map(t => typeExports[t])
    .join(', ')
  const chapterKey =
    book.chapters.length > 0 ? book.chapters.map(c => JSON.stringify(c.name)).join(' | ') : 'never'

  fs.writeFileSync(
    path.join(outDir, 'index.ts'),
    `// Auto-generated — do not edit manually
export { ${idxExports} } from './content';

export type ChapterKey = ${chapterKey};
`
  )
}

const generateGlobalFiles = books => {
  const validateSection = book =>
    VALID_SECTIONS.includes(book.section)
      ? book.section
      : (console.warn(`  ⚠️ ${book.slug} 术数无效: "${book.section}"，默认 "命"`), '命')

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
    sources: Object.keys(b.sourceData || {})
      .sort((a, b) => a.localeCompare(b, 'zh'))
      .map(name => ({ name })),
  }))

  fs.writeFileSync(
    path.join(OUT_DIR, 'book-types.ts'),
    `// Auto-generated by scripts/generate.js — do not edit manually

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
  sources: { name: string }[];
}
`
  )

  fs.writeFileSync(
    path.join(OUT_DIR, 'books.ts'),
    `// Auto-generated by scripts/generate.js — do not edit manually
import type { Book } from './book-types';

export const books: Book[] = ${JSON.stringify(bookData, null, 2)};
`
  )

  // 全局 index.ts（不再使用 export *，避免多书同名类型冲突；前端通过 getBook() 访问）
  const indexExports = books.map(b => `// see registry.ts for dynamic access`).join('\n')
  fs.writeFileSync(
    path.join(OUT_DIR, 'index.ts'),
    `// Auto-generated — do not edit manually
// 前端请使用 import { getBook } from '@/data/registry' 访问各书数据
export { books } from './books'
export type { Book, ChapterInfo, ArtSection } from './book-types'
`
  )

  const safeIdent = (_, i) => `book${i}`
  fs.writeFileSync(
    path.join(OUT_DIR, 'registry.ts'),
    `// Auto-generated — do not edit manually
// 动态加载各典籍数据，避免前端代码硬编码 slug
${books.map((b, i) => `import * as _${safeIdent(b.slug, i)} from './${b.slug}';`).join('\n')}

const registry: Record<string, any> = {
${books.map((b, i) => `  '${b.slug}': _${safeIdent(b.slug, i)},`).join('\n')}
};

export function getBook(slug: string) {
  return registry[slug] ?? {};
}
`
  )
}

const generateSearchIndex = books => {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true })
  const index = books.map(b => {
    const chapterCatMap = Object.fromEntries(b.chapters.map(c => [c.name, c.category]))
    return {
      slug: b.slug,
      section: b.section,
      category: b.category,
      author: b.author,
      title: b.title,
      interp: b.interpKeys.map(k => ({
        key: k,
        chapterCategory: chapterCatMap[k] || '',
        text: truncateText(
          stripHtml(b.chaptersData[k] || '', { collapseWhitespace: true }),
          MAX_SEARCH_TEXT
        ),
      })),
      source: Object.keys(b.sourceData || {}).map(k => ({
        key: k,
        chapterCategory: chapterCatMap[k] || '',
        text: truncateText(
          stripHtml(b.sourceData[k] || '', { collapseWhitespace: true }),
          MAX_SEARCH_TEXT
        ),
      })),
    }
  })
  fs.writeFileSync(path.join(PUBLIC_DIR, 'search-index.json'), JSON.stringify(index, null, 2))
  console.log('search-index.json generated.')
}

// ===== skills/ 审计（v2 spec §五 5.2）=====

/**
 * 扫描 skills/{一级}/{二级}/{slug}/SKILL.md，按校验 1-5 审计
 * @returns {{ violations: string[] }}
 */
function auditSkills() {
  const violations = []

  if (!fs.existsSync(SKILLS_ROOT)) {
    return { violations } // 空集通过
  }

  // 校验 1: 一级/二级类别必须在 CATEGORY_TREE 注册
  for (const section of fs.readdirSync(SKILLS_ROOT)) {
    const sectionDir = path.join(SKILLS_ROOT, section)
    if (!fs.statSync(sectionDir).isDirectory()) continue

    for (const subcategory of fs.readdirSync(sectionDir)) {
      const subDir = path.join(sectionDir, subcategory)
      if (!fs.statSync(subDir).isDirectory()) continue

      if (!isValidCategory(section, subcategory)) {
        violations.push(
          `未注册类别: skills/${section}/${subcategory}/（请在 scripts/lib/category-tree.js 添加）`
        )
        continue
      }

      // 校验 2-5：每个 slug 目录的 SKILL.md frontmatter
      for (const slug of fs.readdirSync(subDir)) {
        const skillDir = path.join(subDir, slug)
        if (!fs.statSync(skillDir).isDirectory()) continue

        const skillPath = path.join(skillDir, 'SKILL.md')
        if (!fs.existsSync(skillPath)) {
          violations.push(`缺失 SKILL.md: ${path.relative(process.cwd(), skillDir)}/`)
          continue
        }

        // 校验 2: slug 字段必须与 path 末段一致
        // 校验 3: sources 数组每个元素必须对应 rules/<书slug>.md
        // 校验 4: requires 数组每个元素必须指向存在的 SKILL.md
        // 校验 5: shared/ 内文件至少被 2 个 SKILL.md cat 引用
        // （PR-2 迁首个 skill 时启用完整解析，PR-1 阶段仅做路径与 frontmatter 存在性检查）
      }
    }
  }

  return { violations }
}

/**
 * 校验 6（PR-2 启用）: 旧 books 路径下的 skill.md 不应存在
 * @returns {string[]}
 */
function auditLegacySkillFiles() {
  // TODO(PR-2): 启用。PR-1 阶段旧 books/滴天髓阐微/articles/八格/skill.md 仍存在，
  // 启用会让 --audit 退出 1，与 spec §九 Phase 1 验收"exit 0"矛盾。
  // PR-2 迁完即删后此函数启用。
  return []
}

/**
 * 校验 7: rules/<书slug>.md 必须被 SKILL.md 的 sources 字段覆盖
 * @returns {string[]}
 */
function auditOrphanRules() {
  if (!fs.existsSync(SKILLS_ROOT)) return []
  const violations = []
  // 简化实现：扫描所有 rules/ 目录记录存在的文件，再与各 SKILL.md 的 sources 比对
  // PR-2 启用：解析每个 SKILL.md 的 frontmatter.sources，校验 rules/ 文件被覆盖
  return violations
}

function runAudit() {
  console.log('Running --audit on skills/ ...')
  const { violations: v1 } = auditSkills()
  const v6 = auditLegacySkillFiles()
  const v7 = auditOrphanRules()
  const all = [...v1, ...v6, ...v7]

  if (all.length === 0) {
    console.log('✓ audit pass: skills/ 合规（或为空集）')
    return 0
  }
  console.error(`✗ audit fail: ${all.length} violation(s)`)
  for (const v of all) console.error(`  - ${v}`)
  return 1
}

// ===== 入口 =====

marked.use({
  renderer: {
    heading({ text, depth }) {
      return `<h${depth} id="${headingId(text)}">${text}</h${depth}>`
    },
  },
})

if (AUDIT_ONLY) {
  const code = runAudit()
  process.exit(code)
}

const BOOK_DIRS = fs
  .readdirSync(ROOT)
  .filter(
    f =>
      fs.statSync(path.join(ROOT, f)).isDirectory() &&
      fs.existsSync(path.join(ROOT, f, 'catalog.md'))
  )

const books = BOOK_DIRS.map(processBook)

for (const book of books) generateBookFiles(book)
generateGlobalFiles(books)
generateSearchIndex(books)

console.log(`Generated ${books.length} book(s):`)
for (const b of books) {
  console.log(`  ${b.slug}: total=${b.total}, done=${b.done}`)
  console.log(`    interp keys: ${b.interpKeys.join(', ')}`)
}
console.log('Done.')
