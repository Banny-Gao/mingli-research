// scripts/.scratch/normalize-lantai.js
// 一次性: 修 19 个 source.md
// 1. H1 由"兰台妙选原文-{上,中,下}篇"改为篇章裸名
// 2. 删除 "## 一、总论根基" 等序号前缀，改为 "## 总论根基"

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..', '..')
const ARTICLES = path.join(ROOT, 'books', '兰台妙选', 'articles')

for (const vol of ['上篇', '中篇', '下篇']) {
  const volDir = path.join(ARTICLES, vol)
  for (const chap of fs.readdirSync(volDir)) {
    const file = path.join(volDir, chap, 'source.md')
    if (!fs.existsSync(file)) continue
    let text = fs.readFileSync(file, 'utf-8')
    const before = text

    // 1. H1: "# 兰台妙选原文-{vol}" -> "# {chap}"
    text = text.replace(/^# 兰台妙选原文-[上中下]篇\s*$/m, `# ${chap}`)

    // 2. 去掉 ## 序数前缀 "一、" / "二、" / ... / "十、"
    text = text.replace(/^##\s+[一二三四五六七八九十]+[、．.]\s*/m, '## ')

    if (text !== before) {
      fs.writeFileSync(file, text, 'utf-8')
      console.log(`✓ ${vol}/${chap}/source.md`)
    }
  }
}

console.log('\n✅ 规范化完成')
