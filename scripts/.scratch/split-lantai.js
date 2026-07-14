// scripts/.scratch/split-lantai.js
// 一次性脚本: 把 books/兰台妙选/articles/{上,中,下}篇/source.md 拆成 19 篇章 source.md
// 每篇以 ## 为边界,篇名为 ## 后第二个字符起的字符串（去掉 "一、" 序数）

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..', '..')
const ARTICLES = path.join(ROOT, 'books', '兰台妙选', 'articles')

const mapping = [
  { vol: '上篇', srcFile: '兰台妙选原文-上篇/source.md' },
  { vol: '中篇', srcFile: '兰台妙选原文-中篇/source.md' },
  { vol: '下篇', srcFile: '兰台妙选原文-下篇/source.md' },
]

for (const { vol, srcFile } of mapping) {
  const src = path.join(ARTICLES, srcFile)
  const text = fs.readFileSync(src, 'utf-8')

  // 切出 H1 标题 (首行)
  const lines = text.split('\n')
  const h1 = lines[0] // e.g. "# 兰台妙选原文-上篇"

  // 找到所有 ## 边界
  const sections = [] // [{name, body: string[]}]
  let cur = null
  let started = false
  for (let i = 1; i < lines.length; i++) {
    const m = lines[i].match(/^##\s+(.+)$/)
    if (m) {
      if (cur) sections.push(cur)
      // 提取篇名: "一、总论根基" -> "总论根基"
      const raw = m[1].trim()
      const bare = raw.replace(/^[一二三四五六七八九十]+[、．.]\s*/, '').trim()
      cur = { name: bare, body: [h1, '', `## ${raw}`] } // 每个篇章用 H1 + 自己的 ## 标题
      started = true
    } else if (started) {
      cur.body.push(lines[i])
    }
  }
  if (cur) sections.push(cur)

  // 写入每篇 source.md
  const volDir = path.join(ARTICLES, vol)
  fs.mkdirSync(volDir, { recursive: true })
  for (const sec of sections) {
    const dir = path.join(volDir, sec.name)
    fs.mkdirSync(dir, { recursive: true })
    const out = path.join(dir, 'source.md')
    fs.writeFileSync(out, sec.body.join('\n'), 'utf-8')
    console.log(`✓ ${vol}/${sec.name}/source.md (${sec.body.length} lines)`)
  }

  // 移除旧 source.md 文件 (但保留 .gitkeep)
  fs.unlinkSync(src)
  console.log(`  删除旧文件: ${srcFile}`)
}

console.log('\n✅ 拆分完成')
