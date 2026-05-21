# 架构问题清单

> 生成时间：2026-05-18
> 项目定位：国学古籍静态知识库（PC + H5 共用一套代码）
> 小程序：独立产品，不在当前项目内
> 背景：即将扩展"山/医/命/相/卜"五术模块，当前仅有命理板块的《滴天髓阐微》

---

## 核心结论：当前架构没有为五术扩展预留模型

原有的 4 个问题（内容耦合、响应式、路由扁平、CI/CD）都是**表层症状**，真正的根因是：

> **数据模型从设计之初就没有为多术数扩展预留结构。**

所有书平铺在 `books[]` 数组里，没有"术数类别"的概念。这导致后续的内容 schema、路由结构、搜索索引、渲染层改造都缺乏正确的锚点。

---

## 🔴 问题一：没有 Section/Arts 数据模型（根因）

**现状：**

```ts
// src/data/books.ts — 扁平结构
export const books: Book[] = [
  { slug: "ditiansui-site", title: "滴天髓阐微", ... }, // 无归属关系
  { slug: "another-book", title: "...", ... },           // 也无归属
]
```

`books[]` 是平铺的，没有 `section` 字段。"山/医/命/相/卜" 五个术数类别完全没有建模。

**影响：**

- Landing 页无法按术数分组展示
- 没有 `/山` / `/医` / `/命` / `/相` / `/卜` 的路由概念
- 无法按术数做 SEO meta 标签
- 未来山/医/相/卜 各有不同的内容结构，但数据模型无法区分它们

**建议方案：**

```ts
export type ArtSection = '山' | '医' | '命' | '相' | '卜'

export interface Book {
  slug: string
  section: ArtSection // 新增：所属术数
  title: string
  author: string
  // ...
}
```

```ts
// Landing 页按 section 分组
const booksBySection = groupBy(books, 'section')
// { '命': [Book, ...], '医': [...], '山': [...] }
```

**待确认：**

- [ ] 五术分类是否准确？有无其他分类维度？
- [ ] Section 层级是否需要独立路由（`/命/ditiansui` vs `/ditiansui`）？

---

## 🔴 问题二：内容 Schema 耦合在 generate.js 里（扩展阻塞点）

**现状：**
`scripts/generate.js` 硬编码了 6 列 markdown 格式，假设每本书的目录结构为：

```
[num, title, sourcePath, interpPath, status, skills]
```

这意味着：

- 命理：source + interp + skill（三层内容）
- 医学：可能是病理 + 药方 + 医案（不同结构）
- 相术：部位 + 解读 + 图示（不同结构）
- 山/卜：各有不同的内容类型

当前系统**无法容纳**不同的内容 schema。增加第二本书就必须改 `generate.js` 的 parser。

**建议方案：**
每个书目录下的 `catalog.md` 声明自己的 schema：

```markdown
> 内容类型：interp, skill, source
> 解读格式：standard
> 技能格式：yaml-frontmatter

| 编号 | 篇名 | 原文 | 解读 | 状态 |
| ... | ... | ... | ... | ... |
```

generate.js 读取元信息，动态生成该书的加载器和类型定义，不再硬编码列格式。

**待确认：**

- [ ] 各类书籍的内容类型是否可以用统一接口抽象（`ContentProvider`）？
- [ ] 是否允许不同书有完全不同的内容类型？优先级如何？

---

## 🟡 问题三：内容与代码耦合（迁移优先级：高）

**现状：**

- `src/data/ditiansui-site/` 下 201 个 `.ts` 文件（64 source + 64 interp + 73 skill）
- 每个文件内容以内联 HTML 字符串导出：`export default \`<p>天道</p>...\`
- `index.ts` 标注 "Auto-generated — do not edit manually"，动态 `import()` 做 lazy loading

**实际影响：**

- lazy loading 已缓解首屏和编译速度问题，**严重程度低于问题一**
- 核心问题是：内容不可被外部工具编辑，Git diff 不可读，非技术人员无法贡献

**建议方案：**

```
books/ditiansui-site/
  interp/天道.md         ← 直接存 markdown，不再转 HTML
  source/天道.md
  articles/天道/skill.md

src/data/ditiansui-site.ts  ← 纯索引，元数据 + 动态加载路径
```

generate.js 改为只输出元数据（chapters 列表、关联关系），内容文件用标准 `.md` 管理。

运行时通过 Vite 的 `import.meta.glob` 加载：

```ts
const interpModules = import.meta.glob('../../books/*/interp/*.md', {
  query: '?raw',
  import: 'default',
  eager: false,
})
```

**待确认：**

- [ ] 是否接受内容迁移的一次性工作？
- [ ] 内容管理流程（谁来维护、怎么更新）？

---

## 🟡 问题四：H5 响应式未验证（抖音用户风险）

**现状：**

- `tailwind.config.js` 只有 `content` 路径，**零响应式配置**
- 样式目录中无任何 `@media` 查询或 mobile 断点
- 无 hamburger menu / drawer 组件
- 无 Playwright mobile viewport 测试

抖音用户 100% 是移动端，体验不达标则直接流失。

**H5 目标定位（需确认）：**

| 级别          | 说明                                     | 改造量 |
| ------------- | ---------------------------------------- | ------ |
| L1 轻量落地页 | 标题 + 引导语 + 跳小程序按钮             | 小     |
| L2 基础阅读   | L1 + 文章列表 + 单篇阅读（无笔记/搜索）  | 中     |
| L3 完整体验   | L2 + 导航/搜索/笔记/收藏全功能移动端适配 | 大     |

**待确认：**

- [ ] H5 目标定位是 L1 / L2 / L3 中的哪一级？
- [ ] 是否接受阶段性改造（先 L1，后续迭代）？

---

## 🟡 问题五：路由结构与 URL 设计（扩展前提）

**现状：**

```
/                   Landing
/notes              笔记系统
/:slug              BookApp（所有板块共用一个组件）
```

`BookApp` 一个组件承载所有内容类型，内部靠 slug 判断走不同分支。路由过于扁平，无法支撑五术扩展的 SEO 需求。

**建议方案（待与问题一联动）：**

```
/                        Landing（网站首页，按术数分组）
/books                   古籍知识库总览
  /books/命理              命理典籍列表
    /books/命理/ditiansui  滴天髓专区
      /books/命理/ditiansui/天道
/notes                   笔记系统
/tools                   工具集（未来）
```

**待确认：**

- [ ] 是否接受 URL 结构变化（可能影响外链/SEO）？
- [ ] 各术数板块是否有不同的页面交互需求（目前先按相同处理）？

---

## 🟢 问题六：Search Index 扁平（扩展后问题）

**现状：**
`public/search-index.json` 是全量 flat 数组，按书分隔但没有按术数分组。

**影响：**

- 无法按"只看医学类"过滤搜索结果
- 无法做跨书交叉搜索
- Landing 页面无法做 section 级别的搜索

**待确认：**

- [ ] 搜索是否需要按术数分组过滤？
- [ ] 跨书搜索的需求程度？

---

## 🟢 问题七：缺少 CI/CD

**现状：**

- 没有 dev/staging/prod 环境区分
- 没有自动化构建发布流程
- 构建依赖本地机器

**建议方案：**

```
GitHub Actions:
  - PR → 自动运行 TypeScript 编译 + Vitest + E2E
  - main merge → 自动构建 + 部署到 Vercel/Netlify
  - 移动端验证：Playwright mobile viewport 测试
```

**待确认：**

- [ ] 是否有协作需求（多人编辑）？
- [ ] 部署目标是 Vercel / Netlify / 其他？

---

## 已排除的问题（澄清）

| 问题                 | 排除理由                                     |
| -------------------- | -------------------------------------------- |
| 需要后端减轻前端负担 | 静态站点 + 公开内容，不需要后端              |
| 需要数据库           | 内容免费公开，数据所有权不是问题             |
| 需要内容管理系统     | 内容迁移到 md 文件后，不需要 CMS             |
| 性能瓶颈             | lazy loading + Vite 编译，体量下暂无性能问题 |

---

## react-markdown 改造方案（对应问题三）

### 现状痛点

当前内容以 HTML 字符串内嵌在 `.ts` 文件中（`generate.js` 在 build 时用 `marked` 转换），无法：

- 给标题/代码块等挂载 React 组件
- 接入 rehype 插件生态（如代码高亮、emoji）
- 在 skill 文档内支持子级 markdown 渲染

### 改造路径

**步骤 1：generate.js 重构——从"生成内容"变为"生成索引"**

```js
// generate.js 职责变更：
// 旧：解析 catalog.md → 生成 201 个 .ts 内容文件（HTML字符串内联）
// 新：解析 catalog.md → 生成纯元数据 + 内容迁移脚本

// books/ditiansui-site/interp/天道.md   ← 直接存 markdown（内容作者视角）
// src/data/ditiansui-site.ts           ← 纯索引（代码视角）
```

运行时加载：

```ts
// src/data/ditiansui-site.ts
const interpModules = import.meta.glob('../../books/ditiansui-site/interp/*.md', {
  query: '?raw',
  import: 'default',
  eager: false,
})
export const interpLoadable: Record<string, () => Promise<string>> = interpModules
```

**步骤 2：ModalReader 渲染层切换**

```tsx
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

// 替换
// <div dangerouslySetInnerHTML={{ __html: annotatedBody }} />

// 改为
;<ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} className={proseClass}>
  {annotatedBody}
</ReactMarkdown>
```

**关键：为什么无缝兼容**

annotation 的 `rangeStart/rangeEnd` 基于 **DOM character offset**（`innerText` walk），scroll-to-text 也是遍历 DOM 节点计数。只要 `rehype-raw` 保持 DOM 结构不变（它直接传递 HTML 节点），所有逻辑完全兼容。

**步骤 3：内容迁移脚本**

将现有 201 个 `.ts` 文件内容批量转为 `.md` 文件（一个 sed 命令或简单 Node 脚本即可）。

### 安装依赖

```
pnpm add react-markdown remark-gfm rehype-raw
pnpm add -D @types/react-markdown
```

---

## 当前优先级建议

```
🔴 问题一：引入 Section 数据模型          ← 五术扩展的根基，先做
🔴 问题三（改造）：react-markdown + 内容迁移 ← 一次迁移，长期受益
🟡 问题二：抽象 ContentSchema 接口         ← 第二本书上线前做
🟡 问题四：H5 响应式改造                    ← 抖音用户强依赖，同步做
🟡 问题五：路由结构设计                    ← 与问题一联动
🟢 问题六：Search Index 分层               ← 扩展后处理
🟢 问题七：CI/CD                           ← 迭代效率工具，后续引入
```

---

## 下一步

1. **确认 Section 数据模型** — 五术分类是否准确，路由是否需要独立层级
2. **确认 H5 目标定位** — L1 / L2 / L3
3. **确认内容迁移方案** — 是否接受一次性迁移工作
4. **制定 SPEC 文件** — 将决策落地为可执行规范

---

_本文件于 2026-05-18 由架构评估更新，涵盖五术扩展前提下的系统性问题与 react-markdown 改造路径。_
