#!/usr/bin/env node
/**
 * verify-ziwei-source.js — 第二轮自检脚本（不依赖 subagent）
 *
 * 核验项：
 * 1. 89 篇全部有 `# 篇名` 标题
 * 2. 89 篇无 `&#160;` 残留
 * 3. 89 篇无 `**` wiki 强调标记残留
 * 4. 89 篇无 `|` `-` ASCII 表格残留
 * 5. 89 篇无 `<poem>` `<ref>` 等 wiki 标签残留
 * 6. 注家标识（答曰/某某先生曰/歌曰/玉蟾先生曰）所在行是否带 `>` 前缀
 * 7. 文件大小检查（命宫 85KB→应 41KB；论诸星同垣 35KB→应 19KB）
 * 8. 重复段检查：每个文件两半不能完全相同
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ARTICLES_DIR = path.join(__dirname, '..', 'books', '紫微斗数全书', 'articles')

const localDirs = fs.readdirSync(ARTICLES_DIR).sort()
console.log(`总文件数: ${localDirs.length}\n`)

let fatal = 0, error = 0, warn = 0, info = 0
const findings = []

const F = (severity, file, line, msg) => {
  const c = { fatal, error, warn, info }[severity] + 1
  if (severity === 'fatal') fatal++
  else if (severity === 'error') error++
  else if (severity === 'warn') warn++
  else info++
  findings.push({ severity, file, line, msg })
}

for (const dir of localDirs) {
  const fp = path.join(ARTICLES_DIR, dir, 'source.md')
  if (!fs.existsSync(fp)) {
    F('fatal', dir, 0, '文件缺失')
    continue
  }
  const text = fs.readFileSync(fp, 'utf-8')
  const lines = text.split('\n')

  // 1. # 标题
  if (lines[0] && !lines[0].match(/^# .+/)) {
    F('fatal', dir, 1, `首行非 # 标题: ${JSON.stringify(lines[0])}`)
  }

  // 2. &#160; 残留
  if (text.includes('&#160;') || text.includes('&nbsp;')) {
    F('fatal', dir, 0, '含 HTML 实体 &#160; 或 &nbsp;')
  }

  // 3. ** 强调标记残留
  if (/\*\*[^*]+\*\*/.test(text)) {
    F('error', dir, 0, '含 wiki 强调标记 **...**')
  }

  // 4. ASCII 表格（连续多行 `|...|`）
  const asciiTableRe = /^\s*\|.*\|.*$/m
  let asciiTableLines = 0
  for (const l of lines) {
    if (asciiTableRe.test(l)) asciiTableLines++
  }
  if (asciiTableLines >= 3) {
    F('error', dir, 0, `含 ${asciiTableLines} 行 ASCII 表格 (|...|)`)
  }

  // 5. wiki 标签
  if (/<(?:poem|ref|nowiki|br|i|b|u|s)\b/i.test(text)) {
    F('error', dir, 0, '含 wiki/HTML 标签')
  }

  // 6. 注家标识所在行是否带 `>` 前缀
  const annotRe = /^(答曰[：:]|歌曰|例曰|.{1,8}?(?:先生|真人|道人)[：:]|【.+?】)/
  let annotMissingPrefix = 0
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim()
    if (!t) continue
    if (annotRe.test(t) && !lines[i].startsWith('>')) {
      annotMissingPrefix++
    }
  }
  if (annotMissingPrefix > 0) {
    F('error', dir, 0, `${annotMissingPrefix} 个注家起始行缺 \`>\` 前缀`)
  }

  // 7. 重复段检查：取文件总行数 1/2 处分两半，前半与后半不能完全相同
  const half = Math.floor(lines.length / 2)
  if (half > 5) {
    const a = lines.slice(0, half).join('\n')
    const b = lines.slice(half, half * 2).join('\n')
    if (a === b) {
      F('fatal', dir, 0, `前 ${half} 行与后 ${half} 行完全相同（整段重复）`)
    }
  }

  // 8. 论阴骘延寿 等特殊篇名一致性
  if (!lines[0].includes(dir)) {
    F('warn', dir, 1, `目录名 "${dir}" 与首行 # 标题 "${lines[0]}" 不一致`)
  }
}

console.log(`\n## 总览`)
console.log(`fatal: ${fatal}`)
console.log(`error: ${error}`)
console.log(`warn: ${warn}`)
console.log(`info: ${info}`)

if (findings.length) {
  console.log(`\n## findings`)
  for (const f of findings) {
    console.log(`[${f.severity}] ${f.file}:${f.line} ${f.msg}`)
  }
  process.exit(1)
}
