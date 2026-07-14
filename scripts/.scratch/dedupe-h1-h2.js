// scripts/.scratch/dedupe-h1-h2.js
// 一次性: 删除每篇 L2 的 `## 篇章名`（与 H1 重复）

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..', '..')
const ARTICLES = path.join(ROOT, 'books', '兰台妙选', 'articles')

let n = 0
for (const vol of ['上篇', '中篇', '下篇']) {
  const volDir = path.join(ARTICLES, vol)
  for (const chap of fs.readdirSync(volDir)) {
    const file = path.join(volDir, chap, 'source.md')
    if (!fs.existsSync(file)) continue
    let lines = fs.readFileSync(file, 'utf-8').split('\n')
    // 期望: L1 = "# 篇章名", L2 = "## 篇章名", L3 = 空行
    if (lines[0]?.startsWith('# ') && lines[1]?.startsWith('## ')) {
      const h1 = lines[0].slice(2).trim()
      const h2 = lines[1].slice(3).trim()
      if (h1 === h2) {
        // 删除 L2
        lines.splice(1, 1)
        // 若 L2 原为空行则无需再处理；否则 L2 被替换为 L3（原 L3 现在是空行则保留）
        fs.writeFileSync(file, lines.join('\n'), 'utf-8')
        n++
      }
    }
  }
}
console.log(`✅ 删除 ${n} 处 H1/H2 重复`)
