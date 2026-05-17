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

function parseBookMeta(filePath) {
  if (!fs.existsSync(filePath)) return null
  const content = fs.readFileSync(filePath, 'utf-8')
  const m = content.match(/# 《([^》]+)》/)
  const title = m ? m[1] : null

  let author = ''
  let version = ''
  let description = ''
  for (const line of content.split('\n')) {
    const t = line.trim()
    if (/^>\s*作者[：:]/.test(t)) author = t.replace(/^>\s*作者[：:]\s*/, '').trim()
    else if (/^>\s*版本[：:]/.test(t)) version = t.replace(/^>\s*版本[：:]\s*/, '').trim()
    else if (/^>\s*简介[：:]/.test(t)) description = t.replace(/^>\s*简介[：:]\s*/, '').trim()
  }

  return { title, author, version, description }
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

  const meta = parseBookMeta(catalogPath) || { title: bookSlug, author: '', version: '', description: '' }
  const title = meta.title
  const author = meta.author
  const version = meta.version
  const description = meta.description
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
  for (const row of catalogRows) {
    if (row.skills && row.skills.length > 0) {
      for (const skillName of row.skills) {
        const skillPath = path.join(bookRoot, 'articles', row.title, 'skill.md')
        if (fs.existsSync(skillPath)) {
          const content = fs.readFileSync(skillPath, 'utf-8')
          skillsData[skillName] = parseMarkdown(content)
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
    total: chapters.length,
    done: doneCount,
    chapters,
    chaptersData,
    skillsData,
    sourceData,
    interpKeys,
    skillKeys,
  })

  // ===== 多文件输出 =====
  const bookOutDir = path.join(OUT_DIR, bookSlug)
  const interpDir = path.join(bookOutDir, 'interp')
  const skillDir = path.join(bookOutDir, 'skill')

  ensureDir(interpDir)
  ensureDir(skillDir)
  ensureDir(path.join(bookOutDir, 'source'))

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

  // 写入 source 目录文件
  const sourceDirOut = path.join(bookOutDir, 'source')
  for (const [key, html] of Object.entries(sourceData)) {
    const escaped = html.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')
    const content = `// Auto-generated — do not edit manually
export default \`${escaped}\`;
`
    const safeKey = key.replace(/[/\\:*?"<>|]/g, '_')
    fs.writeFileSync(path.join(sourceDirOut, `${safeKey}.ts`), content)
  }

  // 写入 source/index.ts
  const sourceKeys = Object.keys(sourceData)
  const sourceMap = sourceKeys
    .map(k => {
      const safeKey = k.replace(/[/\\:*?"<>|]/g, '_')
      return `  '${k.replace(/'/g, "\\'")}': () => import('./${safeKey}').then(m => m.default as string),`
    })
    .join('\n')
  const sourceIndex = `// Auto-generated — do not edit manually
import type { SourceKey } from '../index';

const modules = {
${sourceMap}
} as const;

export const sourceKeys = ${JSON.stringify(sourceKeys)} as const;
export const sourceContent: Record<string, () => Promise<string>> = modules as any;
`
  fs.writeFileSync(path.join(sourceDirOut, 'index.ts'), sourceIndex)

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
  const sourceType =
    sourceKeys.length > 0 ? sourceKeys.map(k => `'${k.replace(/'/g, "\\'")}'`).join(' | ') : 'never'

  const indexContent = `// Auto-generated — do not edit manually
export * as interp from './interp';
export * as skill from './skill';
export * as source from './source';

// 类型定义
export type InterpKey = ${interpType || 'never'};
export type SkillKey = ${skillType || 'never'};
export type SourceKey = ${sourceType || 'never'};
`
  fs.writeFileSync(path.join(bookOutDir, 'index.ts'), indexContent)

  // 保留 compat layer（旧消费者兼容）
  const interpJson = JSON.stringify(chaptersData, null, 2)
  const skillJson = JSON.stringify(skillsData, null, 2)
  const sourceJson = JSON.stringify(sourceData, null, 2)
  const compatContent = `// Auto-generated — compat layer — do not edit manually
// 旧消费者使用此文件，新消费者应从 './${bookSlug}/interp' 和 './${bookSlug}/skill' 导入
export const interpContent: Record<string, string> = ${interpJson};
export const skillContent: Record<string, string> = ${skillJson};
export const sourceContent: Record<string, string> = ${sourceJson};
export type { InterpKey, SkillKey } from './${bookSlug}/index';
`
  fs.writeFileSync(path.join(OUT_DIR, `${bookSlug}.ts`), compatContent)
}

// 生成 books.ts
const bookData = books.map(b => ({
  slug: b.slug,
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
export interface ChapterInfo {
  num: string;
  name: string;
  isDone: boolean;
  category: string;
}

export interface Book {
  slug: string;
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
  source: Object.keys(b.sourceData || {}).map(k => ({
    key: k,
    text: stripHtml(b.sourceData[k] || ''),
  })),
}))
fs.writeFileSync(path.join(PUBLIC_DIR, 'search-index.json'), JSON.stringify(searchIndex, null, 2))
console.log('search-index.json generated.')
console.log('Done.')
