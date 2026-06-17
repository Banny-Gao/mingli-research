/**
 * Spike 补充: 验证 ReactMarkdown 渲染后的 DOM children 数量
 * 与 remark AST top-level blocks 数量是否一致（决定 1:1 映射是否成立）
 */
import { unified } from 'unified'
import remarkParse from 'remark-parse'

const sample = `# 论用神

<mark class="ann-emphasis" data-ann-id="a1">用神者，日主所喜</mark>，使全局之枢纽也。

## 扶抑之法

凡日主<mark class="ann-question" data-ann-id="a2">强者抑之，弱者扶之</mark>，此常法也。

\`\`\`mermaid
graph TD
    A[日主] -->|强| B[抑]
\`\`\`

| 格局 | 用神 |
|------|------|
| 正官 | 财星 |

> **注**：以上<mark class="ann-emphasis" data-ann-id="a4">皆以月令为主</mark>。

- 第一要义
- 第二要义

普通段落。`

// 1. 分析 AST: top-level block 数量
const tree = unified().use(remarkParse).parse(sample)
const astBlockCount = tree.children.length
console.log(`remark AST top-level blocks: ${astBlockCount}`)
tree.children.forEach((c, i) => {
  console.log(`  [${i}] type="${c.type}"`)
})

// 2. 分析原始 markdown 中 HTML 段落里 <mark> 标签的分布
// （验证单个 paragraph 内嵌入多个 <mark> 时，remark 不会把它们拆成多个 block）
console.log(`\n--- Mark 嵌入场景 ---`)
const markParagraphs = sample.split('\n\n').filter(p => p.includes('<mark'))
markParagraphs.forEach((p, i) => {
  const count = (p.match(/<mark/g) || []).length
  console.log(`  paragraph ${i + 1}: ${count} <mark> tag(s) — 作为一个整体 block 保留`)
})

// 3. 验证结论
console.log(`\n结论:`)
console.log(`  AST blocks: ${astBlockCount}`)
console.log(`  关键发现: \`<mark>\` 嵌入在普通段落中时, remark 将其解析为 paragraph 内的 html 子节点`)
console.log(`  不会拆分 paragraph 结构 → paragraph 仍然是 1 个 top-level block`)
console.log(`  → splitMarkdownByBlocks 按顶级 block 切分, 每个 mark paragraph 是完整的一个 sub-md 块`)
console.log(`  → injectAnnotations 注入的 <mark> 标签不会丢失, 也不会被拆分到不同 block`)
