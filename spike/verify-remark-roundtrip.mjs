/**
 * Spike: 验证 remark-parse → remark-stringify 往返后
 * annotation <mark> 标签、mermaid、table 的保真度
 *
 * 模拟 injectAnnotations() 之后的 annotatedBody 字符串
 */
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'

const sample = `# 论用神

<mark class="ann-emphasis" data-ann-id="a1">用神者，日主所喜</mark>，使全局之枢纽也。

## 扶抑之法

凡日主<mark class="ann-question" data-ann-id="a2">强者抑之，弱者扶之</mark>，此常法也。
更有<mark class="ann-reference" data-ann-id="a3">通关、调候、病药</mark>诸法，各随所宜。

\`\`\`mermaid
graph TD
    A[日主] -->|强| B[抑]
    A -->|弱| C[扶]
\`\`\`

| 格局 | 用神 | 忌神 |
|------|------|------|
| 正官 | 财星 | 伤官 |
| 七杀 | 食神 | 财星 |

> **注**：以上<mark class="ann-emphasis" data-ann-id="a4">皆以月令为主</mark>，不可拘执。

- 第一要义：看月令
- 第二要义：<mark class="ann-question" data-ann-id="a5">看日主强弱</mark>
- 第三要义：看组合

普通段落，没有任何标注。`

console.log('='.repeat(60))
console.log('STEP 1: AST 结构分析')
console.log('='.repeat(60))

const tree = unified().use(remarkParse).parse(sample)
const topLevel = tree.children

console.log(`Top-level block 总数: ${topLevel.length}\n`)

topLevel.forEach((child, i) => {
  const type = child.type
  let detail = ''
  if (type === 'paragraph') {
    const children = child.children || []
    const htmlNodes = children.filter(c => c.type === 'html')
    const textNodes = children.filter(c => c.type === 'text')
    detail = `children: ${children.length} (html: ${htmlNodes.length}, text: ${textNodes.length})`
    if (htmlNodes.length > 0) {
      detail += ` | HTML: ${htmlNodes.map(h => JSON.stringify(h.value).slice(0, 50)).join(', ')}`
    }
  } else if (type === 'code') {
    detail = `lang: ${child.lang || 'none'}`
  } else if (type === 'table') {
    detail = `rows: ${child.children?.length}`
  } else if (type === 'blockquote') {
    detail = `children: ${child.children?.length}`
  } else if (type === 'list') {
    detail = `items: ${child.children?.length}`
  }
  console.log(`  [${i}] type="${type}" ${detail}`)
})

console.log('\n' + '='.repeat(60))
console.log('STEP 2: 拆分 → remark-stringify 回串')
console.log('='.repeat(60))

const processor = unified().use(remarkStringify)
const blocks = topLevel.map(child => {
  const subTree = { type: 'root', children: [child] }
  return processor.stringify(subTree)
})

console.log('\n' + '='.repeat(60))
console.log('STEP 3: 拼回验证')
console.log('='.repeat(60))

const rejoined = blocks.join('\n\n')

let allPass = true

const check = (label, pass, detail) => {
  const icon = pass ? '✅' : '❌'
  console.log(`${icon} ${label}`)
  if (detail) console.log(`   ${detail}`)
  if (!pass) allPass = false
}

// <mark> 标签
const origOpen = [...sample.matchAll(/<mark[^>]*>/g)].map(m => m[0])
const rejoinedOpen = [...rejoined.matchAll(/<mark[^>]*>/g)].map(m => m[0])
check(
  '<mark> 标签数量一致',
  rejoinedOpen.length === origOpen.length,
  `原始: ${origOpen.length}, 回串后: ${rejoinedOpen.length}`
)
check(
  '<mark> 标签完整保留',
  origOpen.every(m => rejoined.includes(m)),
  origOpen.every(m => rejoined.includes(m)) ? '全部匹配' : '有丢失'
)
check(
  '</mark> 闭合标签一致',
  (rejoined.match(/<\/mark>/g) || []).length === (sample.match(/<\/mark>/g) || []).length
)

// 内容完整性
check('mermaid code block', rejoined.includes('```mermaid') && rejoined.includes('graph TD'))
check('table', rejoined.includes('| 格局 |') && rejoined.includes('| 正官 |'))
check('heading', rejoined.includes('# 论用神') && rejoined.includes('## 扶抑之法'))
check('list', rejoined.includes('第一要义') && rejoined.includes('第三要义'))
check('blockquote', rejoined.includes('> **注**'))

// 文本内容一致（忽略 - vs * 列表标记符差异，ReactMarkdown 均渲染为 <ul>）
const norm = s => s.replace(/\s+/g, ' ').trim()
const a = norm(sample),
  b = norm(rejoined)

const listMarkersOnly = (x, y) => {
  if (x.length !== y.length) return false
  for (let i = 0; i < x.length; i++) {
    if (x[i] === y[i]) continue
    if ((x[i] === '-' || x[i] === '*') && (y[i] === '-' || y[i] === '*')) continue
    return false
  }
  return true
}
const textMatch = a === b || listMarkersOnly(a, b)
const diffReason =
  a === b
    ? '完全一致'
    : listMarkersOnly(a, b)
      ? '仅列表标记符差异(- vs *)，渲染结果等价(均为<ul>)'
      : `实质差异`

check('拼回文本内容一致', textMatch, diffReason)

// 打印一个回串 block 样例
console.log('\n' + '='.repeat(60))
console.log('STEP 4: 回串后的含 mark block 样例')
console.log('='.repeat(60))
const markBlocks = blocks.filter(b => b.includes('<mark'))
if (markBlocks.length > 0) console.log(markBlocks[0])
else console.log('(无含 mark 的 block)')

console.log('\n' + '='.repeat(60))
if (allPass) {
  console.log('✅ 全部通过 — remark 往返保真度验证通过，可以放心使用')
} else {
  console.log('❌ 存在失败 — remark 往返有保真度问题，建议换 DOM 提取方案')
}
console.log('='.repeat(60))
process.exit(allPass ? 0 : 1)
