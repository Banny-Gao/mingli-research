# 性能优化实施计划

> 基于 `issues/04-性能优化无基线.md` 分析结果
> 实际验证结论见底部「勘误」部分

---

## 目标

首页 FCP < 1.5s，主 bundle gzipped < 200KB（当前 412KB）。

---

## 阶段一：路由级代码分割（预期收益最大）

### 1.1 页面组件懒加载

**文件：** `src/main.tsx`

**改动：**
- 将 3 个页面组件的同步 import 改为 `React.lazy`
- 用 `Suspense` 包裹 `<Routes>`
- Loading 组件：`<div className="page-wrapper"><div className="page-container"><div className="loading-center">加载中...</div></div></div>`

```tsx
import { lazy, Suspense, StrictMode } from 'react'

const Landing = lazy(() => import('./pages/Landing'))
const BookApp = lazy(() => import('./pages/BookApp'))
const Notes = lazy(() => import('./pages/Notes'))
```

### 1.2 highlight.js CSS 延迟加载

**文件：** `src/main.tsx` → 移除，改为在 ModalReader 中按需加载

**当前：** `import 'highlight.js/styles/atom-one-dark.css'` 在 `main.tsx` 同步加载

**目标：** 只在使用 `ReactMarkdown` + `rehypeHighlight` 时加载（ModalReader），而非首页

### 1.3 ModalReader 惰性加载（GlobalModal 中的 `useReader`）

**文件：** `src/main.tsx` 中 `GlobalModal` 组件

**当前：** 同步 `import ModalReader from './components/ModalReader'`

**改动：** 在 GlobalModal 中用 `React.lazy` 延迟加载 ModalReader

```tsx
const ModalReader = lazy(() => import('./components/ModalReader'))
```

**原理：** ModalReader 是 react-markdown + mermaid + highlight.js 等重型依赖的汇聚点，用户可能不打开阅读器就离开，不应强制加载。

**验证：** 构建后 `index-CRisDCfn.js` gzip 大小从 412KB 降至预期 200KB 左右。

---

## 阶段二：细粒度优化

### 2.1 mermaid 动态加载

**文件：** `src/components/Mermaid/Mermaid.tsx`

**当前：** `import mermaid from 'mermaid'` 是顶层同步 import。Mermaid 被 ModalReader 引用，即使页面只有一个 mermaid 图表也加载全部 diagram parser

**改动（可选）：** 在 `useEffect` 中用动态 `import('mermaid')` 加载。

```tsx
const [mermaid, setMermaid] = useState<typeof import('mermaid') | null>(null)

useEffect(() => {
  import('mermaid').then(mod => {
    mod.default.initialize({ ... })
    setMermaid(mod.default)
  })
}, [])
```

**注意：** Vite 已自动将 mermaid 拆分为数十个 diagram chunk（`flowDiagram-xxx.js`、`sequenceDiagram-xxx.js` 等），仅在首次渲染 mermaid 图表时加载。此项优化边际收益较小。

### 2.2 预连接 CDN

**文件：** `index.html`

**改动：** 在 `<head>` 中添加：

```html
<link rel="dns-prefetch" href="https://banny-gao.github.io" />
<link rel="preconnect" href="https://banny-gao.github.io" />
```

**说明：** 当前站点无外部 CDN 资源，此项收益可忽略。保留用于未来可能的外链资源。

### 2.3 CSS 提取优化

**文件：** `vite.config.ts`

**改动：** 在 `build` 配置中：

```ts
build: {
  cssCodeSplit: false,  // 保持单个 CSS 文件
  // ...
}
```

**当前：** Vite 默认行为是每个异步 chunk 提取内联 CSS，但 tailwind CSS 已全局唯一。

---

## 阶段三：基线建立

### 3.1 构建时输出 bundle 报告

**文件：** `package.json`

```json
"scripts": {
  "build:analyze": "tsc && vite build && pnpm dlx vite-bundle-analyzer",
  "build": "tsc && vite build && node -e \"require('fs').copyFileSync('dist/index.html', 'dist/404.html')\""
}
```

### 3.2 建立 Lighthouse 基线

```bash
# 本地测试
npx serve dist
npx lighthouse http://localhost:3000 --output=json --output-path=./lighthouse-report.json
```

### 3.3 手动验证 checklist

- [ ] `pnpm run build` 成功
- [ ] `dist/404.html` 存在
- [ ] 首页 JS gzip < 200KB
- [ ] 访问 `/notes` 路由后代码加载，而非首页预加载
- [ ] Chunk 命名清晰（`Landing-xxx.js`, `BookApp-xxx.js`, `Notes-xxx.js`）
- [ ] ModalReader chunk 在点击章节目录时才加载

---

## 影响范围

| 文件 | 阶段 | 风险 |
|------|------|------|
| `src/main.tsx` | 一 | 中 — 路由懒加载改变初始加载顺序，需确认不破坏 FOUC 主题 |
| `src/pages/*` | 一 | 低 — 仅改为 lazy import，组件本身无变化 |
| `src/components/Mermaid/Mermaid.tsx` | 二 | 低 — mermaid 改为动态加载，渲染前多一个异步步骤 |
| `index.html` | 二 | 低 — 仅加 DNS 预连接 |
| `vite.config.ts` | 二 | 极低 — CSS 分割策略 |
| `package.json` | 三 | 无 — 仅加脚本 |
| `public/robots.txt` | 无影响 | |
| `public/sitemap.xml` | 无影响 | |

---

## 勘误（与原始 issue 对比）

原始 `issues/04-性能优化无基线.md` 中有以下误判：

| 原始断言 | 实际结论 |
|---------|---------|
| "内容全部内联 TS → bundle 膨胀" | ❌ 不成立。`import.meta.glob` + `eager: false` 已将 63 篇解读拆为独立 chunk，按需加载 |
| "64篇内容打包成一个大 JS" | ❌ 不成立。每个解读/技能/原文均为独立 chunk（12-21KB） |
| "字体全量加载" | ❌ 不成立。`@fontsource-variable/geist` 虽在依赖中但**从未被 import**，实际使用系统字体 |
| "无图片懒加载" | ❌ 不成立。src 内无任何图片文件（`*.png`/`*.jpg`/`*.webp` 均为 0） |
| "无资源压缩" | ⚠️ 部分成立。GitHub Pages 自动 gzip 响应，但构建时不预压缩 |
| "JS bundle < 200KB gzipped 目标" | ❌ 实际 412KB（主入口需优化） |
| "无代码分割" | ⚠️ 部分成立。Vite 自动分割了 mermaid 和 content chunk，但**页面组件是同步加载的** |
