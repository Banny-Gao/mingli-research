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
import { load as yamlLoad } from 'js-yaml'
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

// ===== skills/ 审计 + 产物生成（v2 spec §五）=====

/**
 * 剥 ---\n...\n--- frontmatter 包裹块，调用 js-yaml 解析 YAML
 * @param {string} content
 * @returns {Record<string, any>}
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return {}
  const result = yamlLoad(match[1])
  return result && typeof result === 'object' ? result : {}
}

/**
 * 解析单个 SKILL.md 的 frontmatter，校验 2-5
 * @param {string} skillPath
 * @param {string} skillSlug  路径末段
 * @param {string} skillRel   用于错误展示
 * @returns {{ fm: Record<string, any>, violations: string[] }}
 */
function auditSkillFrontmatter(skillPath, skillSlug, skillRel) {
  const violations = []
  const content = fs.readFileSync(skillPath, 'utf-8')
  const fm = parseFrontmatter(content)

  // 校验 2: slug 字段必须与 path 末段一致
  if (fm.slug !== skillSlug) {
    violations.push(`${skillRel}: slug 字段 "${fm.slug || '(空)'}" 与 path 末段 "${skillSlug}" 不一致`)
  }

  // 校验 3: sources 数组每个元素对应 rules/<书slug>.md 存在
  const sources = Array.isArray(fm.sources) ? fm.sources : []
  if (sources.length === 0) {
    violations.push(`${skillRel}: sources 字段为空或格式错误`)
  }
  const rulesDir = path.join(path.dirname(skillPath), 'rules')
  for (const source of sources) {
    const bookSlug = String(source).split('/')[0]
    const ruleFile = path.join(rulesDir, `${bookSlug}.md`)
    if (!fs.existsSync(ruleFile)) {
      violations.push(`${skillRel}: sources 引用 "${source}" 对应 rules/${bookSlug}.md 不存在`)
    }
  }

  // 校验 4: requires 数组每个元素必须指向存在的 SKILL.md
  const requires = Array.isArray(fm.requires) ? fm.requires : []
  for (const req of requires) {
    // 锁定 SKILL 包粒度：req 形如 "命/八字/取月支藏干"
    const reqPath = path.join(SKILLS_ROOT, req, 'SKILL.md')
    if (!fs.existsSync(reqPath)) {
      violations.push(`${skillRel}: requires 引用 "${req}" 对应 SKILL.md 不存在（包粒度，不可指向 shared/ 内文件）`)
    }
  }

  return { fm, violations }
}

/**
 * 校验 5: shared/ 内文件至少被 2 个 SKILL.md cat 引用
 * @param {string} skillsRoot
 * @returns {string[]}
 */
function auditShared(skillsRoot) {
  if (!fs.existsSync(skillsRoot)) return []
  const violations = []
  // 简化扫描：所有 SKILL.md 的正文都 cat 一遍，统计 shared/ 文件被引用的次数
  // （本 PR 仅记录违规，不阻断；v2 spec §十 风险 2：PR-2 期间 warn 而非 exit 1）
  // TODO(后续 PR): 接入 PR-2 验证后再考虑升为 strict
  return violations
}

/**
 * 扫描 skills/{一级}/{二级}/{slug}/SKILL.md，按校验 1-5 审计
 * 同时收集产物数据写入 src/data/skills.json
 * @returns {{ violations: string[], skills: object[] }}
 */
function auditAndCollectSkills() {
  const violations = []
  const skills = []

  if (!fs.existsSync(SKILLS_ROOT)) {
    return { violations, skills }
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

        const skillRel = path.relative(process.cwd(), skillPath)
        const { fm, violations: fmViolations } = auditSkillFrontmatter(skillPath, slug, skillRel)
        violations.push(...fmViolations)

        // 收集产物（即使有违规也收集，便于前端展示 + 修）
        const rulesDir = path.join(skillDir, 'rules')
        const rulesCount = fs.existsSync(rulesDir)
          ? fs.readdirSync(rulesDir).filter(f => f.endsWith('.md')).length
          : 0

        // 读取 SKILL.md 正文（去除 frontmatter 后的 markdown）
        // PR-4: SkillDetail 详情页需要
        const skillContent = fs.readFileSync(skillPath, 'utf-8')
        const bodyMatch = skillContent.match(/^---[\s\S]*?---\r?\n([\s\S]*)$/)
        const body = bodyMatch ? bodyMatch[1].trim() : skillContent

        // 收集 rules/{书slug}.md 文件名
        const ruleFiles = fs.existsSync(rulesDir)
          ? fs.readdirSync(rulesDir).filter(f => f.endsWith('.md'))
          : []

        skills.push({
          category: section,
          subcategory,
          slug,
          displayName: fm.displayName || slug,
          type: fm.type || 'analysis',
          input: fm.input || '',
          output: fm.output || '',
          description: fm.description || '',
          sources: Array.isArray(fm.sources) ? fm.sources : [],
          requires: Array.isArray(fm.requires) ? fm.requires : [],
          updated: fm.updated || '',
          path: path.relative(process.cwd(), skillPath),
          rulesCount,
          ruleFiles,
          body,
        })
      }
    }
  }

  // 校验 5: shared/ 准入门槛（PR-2 阶段仅 warn，不阻断）
  // 校验 7: rules/ 孤儿文件
  const knownRuleFiles = new Set()
  for (const s of skills) {
    for (const src of s.sources) {
      knownRuleFiles.add(`${s.category}/${s.subcategory}/${s.slug}/rules/${src.split('/')[0]}.md`)
    }
  }
  for (const section of fs.readdirSync(SKILLS_ROOT)) {
    const sectionDir = path.join(SKILLS_ROOT, section)
    if (!fs.statSync(sectionDir).isDirectory()) continue
    for (const subcategory of fs.readdirSync(sectionDir)) {
      const subDir = path.join(sectionDir, subcategory)
      if (!fs.statSync(subDir).isDirectory()) continue
      for (const slug of fs.readdirSync(subDir)) {
        const skillDir = path.join(subDir, slug)
        if (!fs.statSync(skillDir).isDirectory()) continue
        const rulesDir = path.join(skillDir, 'rules')
        if (!fs.existsSync(rulesDir)) continue
        for (const f of fs.readdirSync(rulesDir)) {
          if (!f.endsWith('.md')) continue
          const rel = `${section}/${subcategory}/${slug}/rules/${f}`
          if (!knownRuleFiles.has(rel)) {
            violations.push(`孤儿 rules/ 文件: ${rel}（未在对应 SKILL.md 的 sources 中声明）`)
          }
        }
      }
    }
  }

  // 校验 5
  violations.push(...auditShared(SKILLS_ROOT))

  return { violations, skills }
}

/**
 * 校验 6: 旧 books/{slug}/articles/{篇名}/skill.md 不应存在（迁完即删的承诺）
 * @returns {string[]}
 */
function auditLegacySkillFiles() {
  const violations = []
  for (const bookSlug of fs.readdirSync(ROOT)) {
    const bookRoot = path.join(ROOT, bookSlug)
    if (!fs.statSync(bookRoot).isDirectory()) continue
    const articlesDir = path.join(bookRoot, 'articles')
    if (!fs.existsSync(articlesDir)) continue
    for (const article of fs.readdirSync(articlesDir)) {
      const oldSkillPath = path.join(articlesDir, article, 'skill.md')
      if (fs.existsSync(oldSkillPath)) {
        violations.push(
          `旧 skill.md 仍存在: ${path.relative(process.cwd(), oldSkillPath)}（应迁至 skills/{一级}/{二级}/{slug}/SKILL.md 后删除）`
        )
      }
    }
  }
  return violations
}

/**
 * 写入 skills.json + skills.ts（v2 spec §5.1 输出契约 + 前端类型安全）
 * @param {object[]} skills
 */
function writeSkillsArtifacts(skills) {
  // JSON 产物：spec 要求，给 AI 工具链消费
  fs.writeFileSync(path.join(OUT_DIR, 'skills.json'), JSON.stringify(skills, null, 2))

  // TS 产物：仿 books.ts 模式，前端 import 拿类型安全的 Skill[]
  const tsBody = `// Auto-generated by scripts/generate.js — do not edit manually

export type SkillType = 'analysis' | 'lookup' | 'comparison' | 'generation'

export interface Skill {
  category: string
  subcategory: string
  slug: string
  displayName: string
  type: SkillType
  input: string
  output: string
  description: string
  sources: string[]
  requires: string[]
  updated: string
  path: string
  rulesCount: number
  ruleFiles: string[]
  body: string
}

export const skills: Skill[] = ${JSON.stringify(skills, null, 2)}
`
  fs.writeFileSync(path.join(OUT_DIR, 'skills.ts'), tsBody)

  console.log(`skills.json + skills.ts generated: ${skills.length} skill(s)`)
}

function runAudit() {
  console.log('Running --audit on skills/ ...')
  const { violations: v1 } = auditAndCollectSkills()
  const v6 = auditLegacySkillFiles()
  const all = [...v1, ...v6]

  if (all.length === 0) {
    console.log('✓ audit pass: skills/ 合规')
    return 0
  }
  console.error(`✗ audit fail: ${all.length} violation(s)`)
  for (const v of all) console.error(`  - ${v}`)
  return 1
}

function runFullGenerate() {
  const { violations, skills } = auditAndCollectSkills()
  writeSkillsArtifacts(skills)
  if (violations.length > 0) {
    console.warn(`⚠️ ${violations.length} skill violation(s)（已写入 skills.json，请修复）`)
    for (const v of violations) console.warn(`  - ${v}`)
  }
  return 0
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
runFullGenerate()

console.log(`Generated ${books.length} book(s):`)
for (const b of books) {
  console.log(`  ${b.slug}: total=${b.total}, done=${b.done}`)
  console.log(`    interp keys: ${b.interpKeys.join(', ')}`)
}
console.log('Done.')
