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
const ROOT = path.join(__dirname, '../books')
const OUT_DIR = path.join(__dirname, '../src/data')
const PUBLIC_DIR = path.join(__dirname, '../public')

marked.setOptions({ gfm: true, breaks: false })

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
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
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    if (/^#{1,6}\s/.test(trimmed)) continue
    if (trimmed.match(/^\|[-\s:|]+\|$/)) continue
    const cells = trimmed
      .split('|')
      .map(c => c.trim())
      .filter(c => c !== '')
    if (cells.length < 3) continue
    const num = cells[0]
    if (!/^\d+$/.test(num)) continue
    const status = cells.length > 3 ? cells[3] : ''
    // cells: [num, title, path, status, skills?] — skills is 2nd-last when present
    const skillsRaw = cells.length >= 5 ? cells[cells.length - 1] : ''
    const skills = skillsRaw
      ? skillsRaw.split(',').map(s => s.trim()).filter(Boolean)
      : []
    rows.push({
      num,
      title: cells[1],
      filePath: cells.length > 2 ? cells[2] : '',
      status,
      skills,
    })
  }
  return rows
}

function getBookTitle(metaPath) {
  if (!fs.existsSync(metaPath)) return null
  const content = fs.readFileSync(metaPath, 'utf-8')
  const m = content.match(/《([^》]+)》/)
  return m ? m[1] : null
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
    fs.existsSync(path.join(p, 'catalog.md')) &&
    fs.existsSync(path.join(p, 'skills'))
  )
})

const books = []

for (const bookSlug of BOOK_DIRS) {
  const bookRoot = path.join(ROOT, bookSlug)
  const catalogPath = path.join(bookRoot, 'catalog.md')
  const metaPath = path.join(bookRoot, 'meta/index.md')
  const skillsDir = path.join(bookRoot, 'skills')

  const title = getBookTitle(metaPath) || bookSlug
  const catalogRows = parseCatalog(catalogPath)

  const chapters = []
  const chaptersData = {}
  const interpKeys = []
  const skillKeys = []

  for (const row of catalogRows) {
    const isDone = row.status === '已解读' && row.filePath && row.filePath.length > 0
    chapters.push({ num: row.num, name: row.title, isDone })

    if (isDone) {
      const fullPath = path.join(bookRoot, row.filePath)
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8')
        const html = parseMarkdown(content)
        chaptersData[row.title] = html
        interpKeys.push(row.title)
      } else {
        console.warn(`  ⚠️ 跳过缺失文件: ${fullPath}`)
      }
    }
  }

  const skillsData = {}
  if (fs.existsSync(skillsDir)) {
    for (const entry of fs.readdirSync(skillsDir)) {
      const skillPath = path.join(skillsDir, entry, 'SKILL.md')
      if (fs.existsSync(skillPath)) {
        const content = fs.readFileSync(skillPath, 'utf-8')
        skillsData[entry] = parseMarkdown(content)
        skillKeys.push(entry)
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
    total: chapters.length,
    done: doneCount,
    chapters,
    chaptersData,
    skillsData,
    interpKeys,
    skillKeys,
  })

  // ===== 多文件输出 =====
  const bookOutDir = path.join(OUT_DIR, bookSlug)
  const interpDir = path.join(bookOutDir, 'interp')
  const skillDir = path.join(bookOutDir, 'skill')

  ensureDir(interpDir)
  ensureDir(skillDir)

  // 写入每个篇目文件
  for (const [key, html] of Object.entries(chaptersData)) {
    const escaped = html.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')
    // 每个文件只导出一个 default（避免 export * 冲突）
    const content = `// Auto-generated — do not edit manually
export default \`${escaped}\`;
`
    fs.writeFileSync(path.join(interpDir, `${key}.ts`), content)
  }

  // 写入 interp/index.ts（用 Record 聚合，避免 export * 冲突）
  const interpMap = interpKeys
    .map(k => `  '${k}': () => import('./${k}').then(m => m.default as string),`)
    .join('\n')
  const interpIndex = `// Auto-generated — do not edit manually
import type { InterpKey } from '../index';

const modules = {
${interpMap}
} as const;

export const interpKeys = ${JSON.stringify(interpKeys)} as const;
export const interpContent: Record<InterpKey, () => Promise<string>> = modules as any;
`
  fs.writeFileSync(path.join(interpDir, 'index.ts'), interpIndex)

  // 写入每个技能文件
  for (const [key, html] of Object.entries(skillsData)) {
    const escaped = html.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')
    const content = `// Auto-generated — do not edit manually
export default \`${escaped}\`;
`
    fs.writeFileSync(path.join(skillDir, `${key}.ts`), content)
  }

  // 写入 skill/index.ts
  const skillMap = skillKeys
    .map(k => `  '${k}': () => import('./${k}').then(m => m.default as string),`)
    .join('\n')
  const skillIndex = `// Auto-generated — do not edit manually
import type { SkillKey } from '../index';

const modules = {
${skillMap}
} as const;

export const skillKeys = ${JSON.stringify(skillKeys)} as const;
export const skillContent: Record<SkillKey, () => Promise<string>> = modules as any;
`
  fs.writeFileSync(path.join(skillDir, 'index.ts'), skillIndex)

  // 生成 assoc.ts
  if (Object.keys(interpToSkill).length > 0 || Object.keys(skillToInterp).length > 0) {
    const assocContent = `// Auto-generated — do not edit manually
export const interpToSkill: Record<string, string[]> = ${JSON.stringify(interpToSkill, null, 2)};
export const skillToInterp: Record<string, string[]> = ${JSON.stringify(skillToInterp, null, 2)};
`
    fs.writeFileSync(path.join(bookOutDir, 'assoc.ts'), assocContent)
  }

  // 生成 index.ts
  const interpType = interpKeys.map(k => `'${k.replace(/'/g, "\\'")}'`).join(' | ')
  const skillType = skillKeys.map(k => `'${k}'`).join(' | ')

  const indexContent = `// Auto-generated — do not edit manually
export * as interp from './interp';
export * as skill from './skill';

// 类型定义
export type InterpKey = ${interpType || 'never'};
export type SkillKey = ${skillType || 'never'};
`
  fs.writeFileSync(path.join(bookOutDir, 'index.ts'), indexContent)

  // 保留 compat layer（旧消费者兼容）
  const interpJson = JSON.stringify(chaptersData, null, 2)
  const skillJson = JSON.stringify(skillsData, null, 2)
  const compatContent = `// Auto-generated — compat layer — do not edit manually
// 旧消费者使用此文件，新消费者应从 './${bookSlug}/interp' 和 './${bookSlug}/skill' 导入
export const interpContent: Record<string, string> = ${interpJson};
export const skillContent: Record<string, string> = ${skillJson};
export type { InterpKey, SkillKey } from './${bookSlug}/index';
`
  fs.writeFileSync(path.join(OUT_DIR, `${bookSlug}.ts`), compatContent)
}

// 生成 books.ts
const bookData = books.map(b => ({
  slug: b.slug,
  title: b.title,
  total: b.total,
  done: b.done,
  chapters: b.chapters,
  skills: Object.keys(b.skillsData)
    .sort((a, bb) => a.localeCompare(bb, 'zh'))
    .map(name => ({ name })),
}))

const booksTs = `// Auto-generated by scripts/generate.js — do not edit manually
export interface ChapterInfo {
  num: string;
  name: string;
  isDone: boolean;
}

export interface Book {
  slug: string;
  title: string;
  total: number;
  done: number;
  chapters: ChapterInfo[];
  skills: { name: string }[];
}

export const books: Book[] = ${JSON.stringify(bookData, null, 2)};
`

fs.writeFileSync(path.join(OUT_DIR, 'books.ts'), booksTs)

// 更新 index.ts
let indexExports = '// Auto-generated — do not edit manually\n'
for (const book of books) {
  indexExports += `export * from './${book.slug}';\n`
}
fs.writeFileSync(path.join(OUT_DIR, 'index.ts'), indexExports)

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
    text: stripHtml(b.skillsData[k] || ''),
  })),
}))
fs.writeFileSync(
  path.join(PUBLIC_DIR, 'search-index.json'),
  JSON.stringify(searchIndex, null, 2),
)
console.log('search-index.json generated.')
console.log('Done.')
