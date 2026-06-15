# Mobile Reader Modes — Design

**Date:** 2026-06-15
**Scope:** ModalReader 移动端阅读模式可切换(滚动 / 平滑 / 仿真翻页)
**Status:** Approved (pending final review)

---

## 1. 目标

ModalReader 当前只有"滚动"一种内容查看方式。本设计为移动端新增 3 种可切换模式:

1. **滚动**(默认, 现状零改动)
2. **平滑翻页**(横向 slide, 零依赖 CSS scroll-snap)
3. **仿真翻页**(3D curl, 动态 import page-flip 库)

桌面端不受影响。模式与位置记忆到 sessionStorage / localStorage。

---

## 2. 现状约束

- 技术栈:React 19 + Vite + Tailwind 4 + less, 已装 `gsap` / `framer-motion`(未装, 可选)、`@/components/ui`(Button / ButtonGroup)。
- 渲染管线:`ModalReader.tsx` 用 `ReactMarkdown` + 多个 rehype 插件把 markdown 字符串渲染成单一长流, 注入 `.modal-body` 滚动容器。
- 现有依赖滚动坐标系的功能:TocSidebar 锚点、AnnotationToolbar 选区(走 `modalBodyRef.textContent` 字符偏移)、scrollToText 闪黄、ReadingProgress 滚动条、BackToTop。
- J/K 切章不变, 与分页无关。
- 桌面端走 GlobalModal, 不受本设计影响(若 isMobile 走 Reader 路由, 见 src/pages/Reader.tsx)。

---

## 3. 设计决策一览

| 决策 | 选择 | 备选 |
|------|------|------|
| 分页粒度 | 顶级 block(remark AST 边界)贪心装页 | 段落 / 按可视高度切 |
| 分页时机 | 渲染后测量(measure DOM) | 渲染前 AST 切 |
| 平滑翻页 | CSS `scroll-snap-type: x mandatory` | Swiper / 自写 |
| 仿真翻页 | page-flip 库, **dynamic import** | 自研 Canvas curl / 伪 rotateY |
| 模式默认 | 滚动 | 仿真 |
| 翻页手势 | 全屏可拖, 阈值 24px, 长按 300ms 锁选区 | 边缘 24px |
| 跨篇导航 | 末页→下篇第 1 页;首页→上篇已读末页 / 未读首页 | 一律首页 / 仅篇内 |
| 模式持久化 | `localStorage['reader:mode']` 全局 | sessionStorage |
| 位置持久化 | `sessionStorage` 按 mode 分键, 不互通 | localStorage / 互通 |
| annotation 注入 | 走 markdown 字符串层, 不变(measure DOM 只测高) | 切块后重新对齐 |
| TocSidebar 跳转 | `goToAnchor(id)`: measure DOM 定位 → 二分查 page → goToPage | scrollIntoView |
| scrollToText 闪黄 | 二段式: 先定位 page 翻页, 再在当前页 DOM 闪黄 | 单步 scrollTo |

---

## 4. 组件边界

新增目录:`src/components/ModalReader/reader-mode/`

```
reader-mode/
  types.ts                    类型 (ReaderMode, PaginatedPage)
  constants.ts                阈值 / localStorage keys / 时长
  useReaderMode.ts            (放 src/hooks/) 跨组件复用, 此目录仅 re-export
  persistence.ts              scroll/page key 读写
  splitMarkdownByBlocks.ts    remark AST 切字符串
  findTextInContainer.ts      measure DOM 字符偏移
  usePaginatedBlocks.ts       分页 hook
  PaginatedLayout.tsx         装配 measure DOM + pages track
  ReaderToolbar.tsx           移动端 mode radio
  ReaderBody.tsx              按 mode 分发
  ScrollBody.tsx              现状 .modal-body, 不动渲染, 仅加 ref
  SmoothBody.tsx              transform 横向位移 + scroll-snap CSS
  FlipBody.tsx                lazy + dynamic import page-flip
  index.ts                    barrel
  __tests__/                  单测
```

**ModalReader.tsx 改动 ≤ 50 行**:替换 `.modal-body` 块为 `<ReaderBody>`,加 `readerMode` 状态, 持久化读恢复, 透传 `initialPage`。

---

## 5. 数据流

```
[用户选择 mode] → useReaderMode.setMode
                            ↓
                   localStorage['reader:mode'] = mode
                            ↓
                 ReaderBody 重新挂载对应 body 组件
                            ↓
[挂载时] ScrollBody: scrollTo(loadScroll)
        SmoothBody / FlipBody: goToPage(loadPage)
                            ↓
[翻页/滚动时] ScrollBody: scroll 事件 → debounce 300ms → saveScroll
              SmoothBody / FlipBody: currentPage 变化 → savePage
                            ↓
[末页右滑 / 首页左滑] ReaderBody.crossChapter() → onNavigate(type, key, { initialPage })
                            ↓
                  useReader.openReader 转发 initialPage
                            ↓
                  下次挂载 ScrollBody/SmoothBody/FlipBody 读 initialPage
```

---

## 6. 模块细节

### 6.1 分页 hook `usePaginatedBlocks`

```ts
type PaginatedPage = {
  index: number
  startBlockIdx: number   // 顶级 block 在 measure DOM children 中下标
  endBlockIdx: number     // 含
  blockCount: number
}

function usePaginatedBlocks(
  measureRef: RefObject<HTMLElement>,
  pageSize: { width: number; height: number }
): {
  pages: PaginatedPage[]
  totalPages: number
  currentPage: number
  goToPage: (idx: number, opts?: { behavior?: 'auto' | 'smooth' }) => void
  getPageOf: (el: HTMLElement) => number
}
```

**算法**:
1. `useLayoutEffect` 初次测, `ResizeObserver` 监听 `width × height` 变化 + 容器 children 数变化(mermaid 异步完成触发重测)。
2. 遍历 `measureRef.current.children`, 累加 `offsetTop + offsetHeight`, 超过 `pageHeight` 开新页;**block 整块装, 绝不断裂**。
3. 二分装页结果得到 `pages[]`。
4. `currentPage`:内部用 `IntersectionObserver` 监听每个"首页 block", 进入视口的即当前页(供 FlipBody / SmoothBody 显示进度)。
5. 防抖 100ms 避免重测风暴。

### 6.2 markdown 字符串切分 `splitMarkdownByBlocks`

- 入参:`annotatedBody: string`(`injectAnnotations` 之后)、`blockBoundaries: number[]`(从 measure DOM 读 `offsetTop` 时同步记录的字符偏移)。
- 实现:用 `remark-parse` 把 annotatedBody 解析成 mdast, 遍历 top-level nodes, 按 boundary 切片;**`remark-stringify` 回字符串**。
- 失败兜底:超过 1s 预算时, 退化为按字符数硬切(每页固定 4000 字符), 标注 mark 仍按原字符偏移在 sub-md 中保留。

**为什么不在 AST 阶段预切分页**: mermaid 高度不可预知, AST 阶段按字符估高必崩。改为"渲染后测量 + 字符串层切"绕开这个雷。

### 6.3 跨篇导航规则

| 当前状态 | 手势 | 行为 |
|---------|------|------|
| 末页 | 右滑 / 点击下一篇 | → 下一篇第 1 页(无论已读/未读) |
| 首页 | 左滑 / 点击上一篇 | → 上一篇**已读 → 末页** / **未读 → 第 1 页** |

`useReader.openReader` 接受 `initialPage?: number`;`onNavigate` 转发到 ReaderBody, ReaderBody 挂载时若 `initialPage` 有效, 跳过 `loadPage` 直接 `goToPage(initialPage)`。

### 6.4 手势规则

参考国内主流 App(微信读书 / iReader / ReadEra):

| 触发 | 条件 | 行为 |
|------|------|------|
| 水平翻页 | `\|Δx\| > 24px` 且 `\|Δx\| > \|Δy\| × 2` 且总时长 `< 500ms` | 翻页 |
| 垂直滑动 | `\|Δy\| > \|Δx\|` | 不翻页, 让给系统滚动/选区 |
| 长按 | `touchstart` 起 300ms | 锁定选区, 翻页判定失效 |
| 点击中央 | 单击 | 唤出 ReaderToolbar |
| 边缘 tap | 左右各 80px 区域单击 | 翻页(无障碍兜底) |
| 抽屉打开 | TocSidebar / AnnotationPanel 打开 | 禁用翻页手势 |

### 6.5 兼容性改造

| 现有功能 | 风险 | 改造 |
|---------|------|------|
| Annotation 选区 | 翻页后 `textContent` 是当前页的, 字符偏移断裂 | **不改**:`injectAnnotations` 仍走 annotatedBody 字符串; 可见 DOM 是 sub-md 渲染, mark 标签由 sub-md 自带 |
| TocSidebar 锚点 | 平滑/仿真模式下锚点可能在不可见页 | 改造:onItemClick 改 `goToAnchor(id)`, measure DOM 定位 → 二分 page → goToPage |
| ReadingProgress | 翻页后 scrollTop 离散, 进度条阶梯 | 改造:滚动模式保留, 平滑/仿真用 `currentPage / totalPages` |
| BackToTop | 仿真模式 scrollTop 不存在 | 改造:仿真/平滑 = `goToPage(0)`, 滚动 = `scrollTo(0)` |
| scrollToText 闪黄 | 目标页可能不是当前页 | 改造:二段式, measure DOM 定位 blockIdx → 翻页 → 当前页 DOM 闪黄 |
| J/K 切章 | 与分页无关 | 不动 |
| Mermaid 重渲染 | 触发 ResizeObserver 重测 | 不动, 自动跟随 |

**measure DOM 设计**:
- 永远存在(`display: none` 即可, 不卸载), ReactMarkdown 渲染一次。
- 渲染管线与可见 DOM 完全一致, 只是隐藏。`injectAnnotations` 仍注入 measure DOM 一份完整 annotatedBody(可见 DOM 是 sub-md 字符串, 也自带 mark, 不需要二次注入)。
- ResizeObserver / IntersectionObserver 全挂 measure DOM。

### 6.6 持久化

```ts
// src/hooks/useReaderMode.ts
const KEY = 'reader:mode'
type ReaderMode = 'scroll' | 'smooth' | 'flip'

export function useReaderMode(): [ReaderMode, (m: ReaderMode) => void] {
  // localStorage 持久化
}

// src/components/ModalReader/reader-mode/persistence.ts
const scrollKey = (b, t, k) => `scroll:${b}:${t}:${k}`
const pageKey   = (b, t, k) => `page:${b}:${t}:${k}`

export function saveScroll(b, t, k, top)  { sessionStorage.setItem(scrollKey(b,t,k), String(top)) }
export function loadScroll(b, t, k): number { ... }
export function savePage(b, t, k, idx)    { sessionStorage.setItem(pageKey(b,t,k), String(idx)) }
export function loadPage(b, t, k): number { ... }
```

- **模式** = `localStorage`(全局, 跨篇章)。
- **位置** = `sessionStorage`(关 tab 即重置, 避免"永远停在某页")。
- 切模式**不迁移位置**(调研结论)。
- 写入时机:滚动 = debounce 300ms scroll 事件;平滑/仿真 = `currentPage` 变化;跨篇 = 切换前一刻。

### 6.7 性能与回退

| 风险 | 缓解 |
|------|------|
| page-flip iOS Safari 崩溃 | try/catch 包 import, 失败回退 smooth |
| remark 切 md 卡顿(>1MB) | 1s 预算, 超时按字符硬切 |
| measure DOM 二次渲染 | `display:none` 而非 unmount, 只渲染一次 |
| ResizeObserver 重测风暴 | 防抖 100ms |
| 仿真与 TocSidebar 抽屉冲突 | 抽屉打开时 `gestureEnabled=false` |
| 仿真包大小 | dynamic import, 默认 main bundle 不含 |

---

## 7. 错误处理

| 场景 | 行为 |
|------|------|
| page-flip 动态 import 失败 | 退化为 smooth, console.warn, 不抛 |
| localStorage 写入失败(隐私模式) | 静默, 内存态仍生效 |
| measure DOM 找不到 block | pages = [{ index: 0, startBlockIdx: 0, endBlockIdx: -1, blockCount: 0 }], ScrollBody 兜底显示 |
| mermaid 渲染失败 | measure 不会卡, block 占位高度, ResizeObserver 不重测 |
| 旋转屏幕 | ResizeObserver 触发, pages 重算, 位置按 mode 重读 |
| 跨篇跳转时目标篇章不存在 | onNavigate 失败, UI 保持当前页, console.error |

---

## 8. 测试

### 8.1 单元(vitest, `__tests__/`)

| 文件 | 覆盖 |
|------|------|
| `usePaginatedBlocks.test.ts` | 5 block 装页、旋转/字号触发重测、mermaid 异步触发重测 |
| `useReaderMode.test.ts` | localStorage 读写、初始值兜底、非法值兜底 |
| `persistence.test.ts` | key 拼接、读写、清空、sessionStorage 不可用兜底 |
| `splitMarkdownByBlocks.test.ts` | 普通 md、含 code/mermaid/table、拼回原串、超时兜底 |
| `findTextInContainer.test.ts` | 目标在不同 block, 返回 `{ blockIdx, offset }` |
| `crossChapter.test.ts` | 已读/未读判定、initialPage 透传 |

### 8.2 E2E(playwright, `tests/reader-mode/`)

| 用例 | 断言 |
|------|------|
| `mode-switcher.spec.ts` | 3 mode 切换视觉正确;flip 触发 page-flip network 请求 |
| `mode-persistence.spec.ts` | 选 flip 翻到第 3 页, 刷新仍第 3 页;scroll→flip 不迁移位置 |
| `cross-chapter-flip.spec.ts` | 末页右滑到下篇首页;已读上篇末页;未读上篇首页 |
| `annotation-flip.spec.ts` | 标注在正确 page 出现;点 AnnotationPanel 跳转可定位 |
| `toc-flip.spec.ts` | TocSidebar 跳转到对应 page(非 page 0) |
| `gesture-threshold.spec.ts` | 拖 < 24px 不翻页(可选区);> 24px < 500ms 翻页;长按 350ms 锁选区 |
| `search-flash-flip.spec.ts` | 目标在第 5 页, 自动翻页 + 闪黄 4s |

### 8.3 性能 / 可访问性

- Lighthouse 移动端仿真模式 FCP 不退化 > 100ms(库是 lazy import)。
- axe: 工具条 radio 键盘可操作(← → 切换)。
- prefers-reduced-motion: 平滑/仿真禁用 transition, 瞬切。

---

## 9. YAGNI(不在本次范围)

- 仿真模式字号 / 行距设置(用全局)
- 仿真模式夜间模式翻页阴影调色(default)
- 翻页音效
- 跨书跳页
- 仿真竖排 / RTL
- 模式快捷键(留 v2, 桌面 j/k 已覆盖切章)

---

## 10. 文件落地清单

新增:
- `src/hooks/useReaderMode.ts`
- `src/components/ModalReader/reader-mode/types.ts`
- `src/components/ModalReader/reader-mode/constants.ts`
- `src/components/ModalReader/reader-mode/persistence.ts`
- `src/components/ModalReader/reader-mode/splitMarkdownByBlocks.ts`
- `src/components/ModalReader/reader-mode/findTextInContainer.ts`
- `src/components/ModalReader/reader-mode/usePaginatedBlocks.ts`
- `src/components/ModalReader/reader-mode/PaginatedLayout.tsx`
- `src/components/ModalReader/reader-mode/ReaderToolbar.tsx`
- `src/components/ModalReader/reader-mode/ReaderBody.tsx`
- `src/components/ModalReader/reader-mode/ScrollBody.tsx`
- `src/components/ModalReader/reader-mode/SmoothBody.tsx`
- `src/components/ModalReader/reader-mode/FlipBody.tsx`
- `src/components/ModalReader/reader-mode/index.ts`
- `src/components/ModalReader/reader-mode/__tests__/*` (6 文件)
- `tests/reader-mode/*.spec.ts` (7 文件)

修改:
- `src/components/ModalReader/ModalReader.tsx`(< 50 行)
- `src/hooks/useReader.tsx`(加 `initialPage` 透传)
- `src/components/ModalReader/ModalReader.less`(scroll-snap CSS)
- `package.json`(加 page-flip 依赖)

---

## 11. 实施顺序(writing-plans 输入)

1. 骨架 + 类型 + 持久化(3 文件)
2. `useReaderMode` hook + 单测
3. `splitMarkdownByBlocks` + `findTextInContainer` + 单测
4. `usePaginatedBlocks` + 单测
5. `PaginatedLayout` + 3 Body 组件
6. `ReaderToolbar` + `ReaderBody` 分发
7. ModalReader 接入(50 行)
8. useReader.tsx 透传 `initialPage`
9. TocSidebar `goToAnchor` 改造
10. scrollToText 闪黄二段式
11. ReadingProgress / BackToTop 模式分支
12. e2e + 跑通

---

## 12. 风险登记

| 风险 | 等级 | 缓解 |
|------|------|------|
| page-flip 库活跃度 | 中 | 评估替代; 真不行自研 Canvas curl(调研: ~150 LOC) |
| remark AST 对超长 md 卡顿 | 低 | 1s 预算 + 字符硬切兜底 |
| measure DOM 拖累首屏 | 低 | `display:none` 不挂样式, 不影响布局 |
| 仿真与 TocSidebar 抽屉冲突 | 中 | gestureEnabled 状态切换 |
| 仿真模式在低端机掉帧 | 中 | `prefers-reduced-motion` 检测 + 阴影开关降级 |
