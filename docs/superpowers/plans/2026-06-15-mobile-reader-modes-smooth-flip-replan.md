# Smooth & Flip 模式重规划

**Date:** 2026-06-16
**Context:** 对原计划 Task 12 (SmoothBody) 和 Task 13 (FlipBody) 的评审暴露了多项架构缺陷。同时，平滑与仿真的核心逻辑（分页管理、手势、持久化、跨篇检测）重合 ~80%，仅过渡动画不同，应提取共享层。

---

## 1. 原计划的缺陷

### 1.1 致命缺陷

| # | 问题 | 影响 |
|---|------|------|
| 1 | **分页渲染流水线断裂** | `splitMarkdownByBlocks` 按顶级 block 切分（1 block = 1 sub-md），但 `usePaginatedBlocks` 贪心装页把多个 block 装入同一 page。渲染层 `subMds[i]` → `page[i]` 的映射把 block-index 当 page-index，丢掉同页其他 block 的内容 |
| 2 | **IntersectionObserver 挂在 hidden DOM** | `usePaginatedBlocks` 在 `measureRef`（`visibility: hidden`）上创建 IO 推导 `currentPage`。IO 不对不可见元素触发 → `currentPage` 永远为 0 |
| 3 | **pageSize 用 window 尺寸** | `window.innerWidth/innerHeight` 不等于内容区可用空间（有 header/toolbar/related-section），装页计算结果偏大 |
| 4 | **page-flip 是 Canvas 库** | 文本不可选中、链接/mermaid/`<mark>` 不可交互 — 与标注、搜索定位、TOC 跳转矛盾 |
| 5 | **Smooth + Flip 重复代码 ~80%** | 分页管理、`currentPage` 跟踪、持久化、跨篇检测、手势检测在两个组件中各自实现 |

### 1.2 非致命但需修正

- SmoothBody 未使用 CSS scroll-snap（设计 doc 说要用，代码却手动 `translateX`）
- SmoothBody 手势只有 `touchend` 无 `touchmove`（无跟手反馈）
- FlipBody 的 `page-flip` 是静态 import（spec 要求 dynamic import）
- FlipBody `gestureEnabled` prop 传入但未使用
- 缺少 `prefers-reduced-motion` 支持

---

## 2. 架构决策：手势库 vs 自定义 vs CSS 原生

### 2.1 关键洞察

> 平滑与仿真翻页的核心逻辑重合 ~80%：分页管理、`currentPage` 跟踪、持久化、跨篇检测、次级手势（长按锁选区、边缘 tap、中央点击唤出工具条）。**唯一差异是主手势的过渡动画** — 平滑是横向 slide，仿真是 3D curl。

### 2.2 三种手势方案对比

| 方案 | 主手势覆盖 | 次级手势 | bundle | 物理手感 | 推荐 |
|------|-----------|---------|--------|---------|------|
| **CSS scroll-snap** | 翻页（浏览器原生惯性+吸附） | 需 JS 补充 | 0 KB | ★★★★★ | SmoothBody 首选 |
| **hammerjs** | 翻页（swipe 事件 + 自写动画） | tap / press / swipe 全覆盖 | ~8 KB gzip | ★★★ | FlipBody 主手势 + 共享次级手势 |
| **纯自定义 touch** | 翻页（touchstart/move/end） | 需全自写 | 0 KB | ★★ | 不推荐：边缘情况太多 |

### 2.3 决策

| 模式 | 主手势方案 | 理由 |
|------|-----------|------|
| **SmoothBody** | CSS `scroll-snap-type: x mandatory` | 浏览器原生物理引擎（iOS 橡皮筋、惯性衰减）远好于任何 JS 模拟。零依赖、零代码处理翻页手势 |
| **FlipBody** | **hammerjs**（项目已有 `@types/hammerjs` 在 devDeps） | 3D curl 动画需要实时跟踪手指位置（`panmove` 事件驱动 `rotateY` 角度），CSS scroll-snap 做不到 |
| **共享次级手势** | hammerjs（pan/tap/press 事件） | 长按锁选区(300ms press)、边缘 tap(swipe 方向判定)、中央点击(普通 tap)、跨篇边界检测。两个模式共用同一个 `useReaderGestures` hook |

**hammerjs 已在项目中**：
```
package.json devDependencies:
  "@types/hammerjs": "^2.0.46"
```
只需 `pnpm add hammerjs`（运行时依赖，~8KB gzip）。

---

## 3. 新架构总览

```
ReaderBody (分发层，不变)
  │
  ├─ scroll → ScrollBody (不变，现状 .modal-body 滚动容器)
  │
  └─ smooth / flip → PaginatedReader (新，共享层)
                        │
                        ├── usePaginatedBlocks (修复: 容器尺寸 + 移除 IO)
                        ├── groupBlocksIntoPages (新: blocks[] + pages[] → pageMds[])
                        ├── useReaderGestures  (新: hammerjs 长按/tap/边缘)
                        ├── usePageNavigation  (新: currentPage/goToPage/持久化/跨篇)
                        │
                        └── renderPages 插槽
                              ├── SmoothPages (CSS scroll-snap 容器)
                              └── FlipPages   (hammerjs 驱动 3D curl 动画)
```

**消除的重复**：
- `currentPage` 管理：2 处 → 1 处
- 持久化：2 处 → 1 处
- 跨篇检测：2 处 → 1 处
- 次级手势：2 处 → 1 处

---

## 4. 流水线修复

### 4.1 正确的分页组装

```
annotatedBody
    │
    ├─→ splitMarkdownByBlocks(md) → blocks[]  (每个顶级 block 一个 sub-md)
    │
    └─→ measure DOM (1 次 ReactMarkdown)
          │
          └─→ usePaginatedBlocks(ref, pageSize)
                │
                └─→ pages[]: [
                      { index: 0, startBlockIdx: 0, endBlockIdx: 2 },
                      { index: 1, startBlockIdx: 3, endBlockIdx: 5 },
                    ]
                    │
                    └─→ groupBlocksIntoPages(blocks, pages) → pageMds[]
                          [
                            blocks[0] + "\n\n" + blocks[1] + "\n\n" + blocks[2],  // page 0
                            blocks[3] + "\n\n" + blocks[4] + "\n\n" + blocks[5],  // page 1
                          ]
```

### 4.2 pageSize 改为从容器 ResizeObserver 测量

```ts
// 在 PaginatedReader 中
const containerRef = useRef<HTMLDivElement>(null)
const [pageSize, setPageSize] = useState({ width: 0, height: 0 })

useEffect(() => {
  const el = containerRef.current
  if (!el) return
  const ro = new ResizeObserver(([entry]) => {
    setPageSize({
      width: entry.contentBoxSize[0]?.inlineSize ?? el.clientWidth,
      height: entry.contentBoxSize[0]?.blockSize ?? el.clientHeight,
    })
  })
  ro.observe(el)
  return () => ro.disconnect()
}, [])
```

### 4.3 currentPage 推导（替代 IO）

| 模式 | 推导方式 |
|------|---------|
| smooth | `Math.round(scrollLeft / pageWidth)`，来源：viewport 的 `scroll` 事件 |
| flip  | hammerjs `panend` 方向判断 + page-flip `flip` 事件回调 |

`usePaginatedBlocks` 中移除 `IntersectionObserver` 相关代码，不再维护 `currentPage`（该职责上移到 `usePageNavigation`）。

---

## 5. 组件详细设计

### 5.1 `usePageNavigation` hook（新）

```ts
// 职责：currentPage 状态、goToPage、持久化读写、跨篇边界检测
function usePageNavigation(opts: {
  bookSlug: string
  modalType: string
  modalKey: string
  totalPages: number
  initialPage?: number
  onCrossChapter?: (dir: 'prev' | 'next') => void
}) {
  const [currentPage, setCurrentPage] = useState(() =>
    opts.initialPage ?? loadPage(opts.bookSlug, opts.modalType, opts.modalKey)
  )

  // 持久化 currentPage
  useEffect(() => {
    savePage(opts.bookSlug, opts.modalType, opts.modalKey, currentPage)
  }, [currentPage])

  const goToPage = useCallback((idx: number) => {
    setCurrentPage(Math.max(0, Math.min(idx, opts.totalPages - 1)))
  }, [opts.totalPages])

  // 跨篇：到达边界时触发
  const checkBoundary = useCallback((dir: 'prev' | 'next') => {
    if (dir === 'next' && currentPage >= opts.totalPages - 1) {
      opts.onCrossChapter?.('next')
    } else if (dir === 'prev' && currentPage <= 0) {
      opts.onCrossChapter?.('prev')
    }
  }, [currentPage, opts.totalPages, opts.onCrossChapter])

  return { currentPage, setCurrentPage, goToPage, checkBoundary }
}
```

### 5.2 `useReaderGestures` hook（新，基于 hammerjs）

```ts
// 职责：统一处理 Smooth + Flip 共有的次级手势
// 主翻页手势：Smooth 由 CSS scroll-snap 处理，Flip 由自己的 pan 处理
// 此处仅处理：长按锁选区、边缘 tap 翻页、中央点击唤出工具条

interface GestureCallbacks {
  onEdgeTap: (dir: 'prev' | 'next') => void
  onCenterTap: () => void                    // 唤出 ReaderToolbar
  onLongPress: () => void                    // 锁选区（翻页判定失效）
  onSwipeLeft: () => void                    // Flip 模式主手势
  onSwipeRight: () => void                   // Flip 模式主手势
  enabled: boolean                           // 抽屉打开时禁用
}

function useReaderGestures(
  containerRef: RefObject<HTMLElement>,
  callbacks: GestureCallbacks
) {
  useEffect(() => {
    const el = containerRef.current
    if (!el || !callbacks.enabled) return

    const hammer = new Hammer.Manager(el, {
      touchAction: 'pan-x',  // 允许横向 pan，纵向留给滚动/选区
    })

    // Pan: 翻页方向判定（Flip 模式主手势，Smooth 模式仅做边缘 tap 检测）
    const pan = new Hammer.Pan({ direction: Hammer.DIRECTION_HORIZONTAL, threshold: 24 })
    hammer.add(pan)

    // Tap: 中央点击 / 边缘 tap
    const tap = new Hammer.Tap()
    hammer.add(tap)

    // Press: 长按 300ms 锁选区
    const press = new Hammer.Press({ time: 300 })
    hammer.add(press)

    hammer.on('panend', (e) => {
      if (e.deltaX < -24) callbacks.onSwipeLeft?.()
      else if (e.deltaX > 24) callbacks.onSwipeRight?.()
    })

    hammer.on('tap', (e) => {
      const rect = el.getBoundingClientRect()
      const x = e.center.x - rect.left
      if (x < 80) callbacks.onEdgeTap('prev')        // 左边缘
      else if (x > rect.width - 80) callbacks.onEdgeTap('next')  // 右边缘
      else callbacks.onCenterTap()                    // 中央
    })

    hammer.on('press', () => callbacks.onLongPress?.())

    hammer.get('pan').recognizeWith(hammer.get('tap'))  // pan 优先于 tap

    return () => hammer.destroy()
  }, [callbacks.enabled /* callbacks 引用需稳定 */])
}
```

**SmoothBody 使用方式**：主翻页由 CSS scroll-snap 处理，`useReaderGestures` 仅处理边缘 tap / 中央点击 / 长按。不传 `onSwipeLeft/Right`。

**FlipBody 使用方式**：主翻页由 `onSwipeLeft/Right` 驱动动画。hammerjs 的 `panmove` 需要额外监听以提供实时跟手反馈。

### 5.3 `PaginatedReader` 共享组件（新）

```tsx
function PaginatedReader(props: {
  annotatedBody: string
  pageSize: PageSize
  bookSlug: string
  modalType: string
  modalKey: string
  initialPage?: number
  onCrossChapter?: (dir: 'prev' | 'next') => void
  gestureEnabled: boolean
  renderPages: (opts: {
    pageMds: string[]
    currentPage: number
    goToPage: (idx: number) => void
    containerRef: RefObject<HTMLDivElement>
  }) => ReactNode
}) {
  const { annotatedBody, pageSize, renderPages, ...navProps } = props

  // 1. split blocks
  const blocks = useMemo(() => splitMarkdownByBlocks(annotatedBody), [annotatedBody])

  // 2. measure DOM + 装页
  // ... PaginatedLayout 的 measure DOM 逻辑，但不渲染可见内容

  // 3. 组装 pageMds
  const pageMds = useMemo(
    () => groupBlocksIntoPages(blocks, pages),
    [blocks, pages]
  )

  // 4. 页面导航
  const nav = usePageNavigation({
    totalPages: pageMds.length,
    bookSlug: props.bookSlug,
    modalType: props.modalType,
    modalKey: props.modalKey,
    initialPage: props.initialPage,
    onCrossChapter: props.onCrossChapter,
  })

  const containerRef = useRef<HTMLDivElement>(null)

  return renderPages({ pageMds, currentPage: nav.currentPage, goToPage: nav.goToPage, containerRef })
}
```

### 5.4 SmoothPages 渲染器（CSS scroll-snap）

```tsx
// SmoothBody 调用 PaginatedReader + SmoothPages
function SmoothPages({ pageMds, currentPage, goToPage, containerRef }: RenderPagesOpts) {
  // scroll 事件 → setCurrentPage（通知 PaginatedReader 的 usePageNavigation）
  // goToPage → programmatic scrollLeft

  const viewportRef = useRef<HTMLDivElement>(null)

  // 外部 goToPage 调用 → 同步 scrollLeft
  useEffect(() => {
    const vp = viewportRef.current
    if (vp) vp.scrollLeft = currentPage * vp.clientWidth
  }, [currentPage])

  // scroll 事件 → 反向通知 currentPage
  // 跨篇边界检测 → onCrossChapter

  return (
    <div className="smooth-viewport" ref={viewportRef}>
      <div className="smooth-track">
        {pageMds.map((md, i) => (
          <div key={i} className="smooth-page">
            <ReactMarkdown ...>{md}</ReactMarkdown>
          </div>
        ))}
      </div>
    </div>
  )
}
```

**CSS**（ModalReader.less 追加）：

```less
@media (max-width: 640px) {
  .smooth-viewport {
    width: 100%; height: 100%;
    overflow-x: auto; overflow-y: hidden;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    &::-webkit-scrollbar { display: none; }
    scrollbar-width: none;
  }
  .smooth-track {
    display: flex; height: 100%;
  }
  .smooth-page {
    width: 100vw; min-width: 100vw; max-width: 100vw;
    height: 100%; overflow-y: auto;
    scroll-snap-align: start; flex-shrink: 0;
    padding: 1rem; box-sizing: border-box;
  }
}
@media (prefers-reduced-motion: reduce) {
  .smooth-viewport { scroll-behavior: auto; }
}
```

### 5.5 FlipPages 渲染器（hammerjs + CSS 3D transform）

**放弃 `page-flip` Canvas 库**，改用 hammerjs + CSS 3D `perspective`/`rotateY`：

**理由**：
1. Canvas 渲染导致文本不可选中、mermaid/annotation 不可交互 — 与核心功能矛盾
2. hammerjs 已在项目 devDeps 中，主包增量仅 ~8KB
3. CSS 3D `rotateY` 的翻页效果在体验上可接受（对比微信读书）
4. 内置 fallback：无 3D 支持的设备（如部分旧 Android）退化为 slide 动画

**核心实现思路**：

```tsx
function FlipPages({ pageMds, currentPage, goToPage, containerRef }: RenderPagesOpts) {
  const [flipProgress, setFlipProgress] = useState(0)     // -1(left) ~ 0(center) ~ 1(right)
  const [isFlipping, setIsFlipping] = useState(false)
  const frontRef = useRef<HTMLDivElement>(null)            // 当前页（左页）
  const backRef = useRef<HTMLDivElement>(null)             // 下一页（右页）

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const hammer = new Hammer.Manager(el)
    const pan = new Hammer.Pan({ direction: Hammer.DIRECTION_HORIZONTAL })
    hammer.add(pan)

    hammer.on('panmove', (e) => {
      // 手指拖动时实时更新 rotateY（跟手翻页）
      const progress = Math.max(-1, Math.min(1, e.deltaX / el.clientWidth))
      setFlipProgress(progress)
    })

    hammer.on('panend', (e) => {
      if (Math.abs(e.deltaX) > el.clientWidth * 0.3) {
        // 超过阈值：完成翻页
        const dir = e.deltaX < 0 ? 1 : -1
        setIsFlipping(true)
        setFlipProgress(dir)
        setTimeout(() => {
          goToPage(currentPage + (dir > 0 ? 1 : -1))
          setFlipProgress(0)
          setIsFlipping(false)
        }, 300)
      } else {
        // 未达阈值：回弹
        setFlipProgress(0)
      }
    })

    return () => hammer.destroy()
  }, [currentPage])

  // 渲染当前页 + 下一页（翻页动画用）
  const currentMd = pageMds[currentPage]
  const nextMd = pageMds[currentPage + 1]

  return (
    <div ref={containerRef} className="flip-stage" style={{ perspective: '1200px' }}>
      {/* 左页：当前页，翻页时沿左边缘 rotateY */}
      <div
        ref={frontRef}
        className="flip-page flip-front"
        style={{
          transformOrigin: 'right center',
          transform: flipProgress < 0
            ? `rotateY(${flipProgress * -180}deg)`
            : 'rotateY(0deg)',
          transition: isFlipping ? 'transform 300ms ease' : 'none',
        }}
      >
        <ReactMarkdown ...>{currentMd}</ReactMarkdown>
      </div>
      {/* 右页：下一页（翻页时出现） */}
      {nextMd && (
        <div
          ref={backRef}
          className="flip-page flip-back"
          style={{ /* 镜像动画 */ }}
        >
          <ReactMarkdown ...>{nextMd}</ReactMarkdown>
        </div>
      )}
    </div>
  )
}
```

**Fallback 路径**：
1. 动态 import 失败（离线/低端机）→ 退化为 SmoothPages（无 hammerjs 时用 CSS slide transition）
2. `prefers-reduced-motion` → `transition: none`，瞬切
3. `@supports (transform-style: preserve-3d)` 不支持 → 退化为 slide

### 5.6 `groupBlocksIntoPages` 工具函数（新）

```ts
// src/components/ModalReader/reader-mode/groupBlocksIntoPages.ts
import type { PaginatedPage } from './types'

export function groupBlocksIntoPages(
  blocks: string[],
  pages: PaginatedPage[]
): string[] {
  return pages.map(page => {
    const pageBlocks = blocks.slice(page.startBlockIdx, page.endBlockIdx + 1)
    return pageBlocks.join('\n\n')
  })
}
```

---

## 6. 文件变更清单

### 新增

| 文件 | 说明 |
|------|------|
| `reader-mode/usePageNavigation.ts` | currentPage 状态、持久化、跨篇检测 |
| `reader-mode/useReaderGestures.ts` | hammerjs 次级手势：长按、tap、边缘 |
| `reader-mode/PaginatedReader.tsx` | Smooth + Flip 共享容器：measure DOM + 装页 + 组装 pageMds |
| `reader-mode/groupBlocksIntoPages.ts` | blocks[] + pages[] → pageMds[] |
| `reader-mode/SmoothPages.tsx` | CSS scroll-snap 渲染器（从 SmoothBody 拆出） |
| `reader-mode/FlipPages.tsx` | hammerjs + CSS 3D transform 渲染器（从 FlipBody 拆出） |

### 修改

| 文件 | 变更 |
|------|------|
| `reader-mode/SmoothBody.tsx` | 瘦身为 `<PaginatedReader renderPages={SmoothPages} />` |
| `reader-mode/FlipBody.tsx` | 瘦身为 `<PaginatedReader renderPages={FlipPages} />` |
| `reader-mode/usePaginatedBlocks.ts` | 移除 IO currentPage 跟踪，移除 `currentPage` 输出 |
| `reader-mode/PaginatedLayout.tsx` | 内容合并到 PaginatedReader，可删除或保留为简单 wrapper |
| `reader-mode/types.ts` | 新增 `PageRenderProps` 类型 |
| `ModalReader.less` | 追加 `.smooth-*` / `.flip-*` CSS |
| `package.json` | `pnpm add hammerjs`（运行时依赖） |

### 删除

| 文件 | 理由 |
|------|------|
| 无 | 都不需要删除，但 `PaginatedLayout.tsx` 功能被 `PaginatedReader.tsx` 替代后可标记 deprecated |

---

## 7. 与原计划 Task 12/13 的对比

| 维度 | 原计划 | 重规划 |
|------|--------|--------|
| Smooth 翻页机制 | 手动 `translateX` + touch 事件 | CSS scroll-snap（浏览器原生） |
| Flip 翻页机制 | `page-flip` Canvas 库 | hammerjs + CSS 3D `rotateY` |
| currentPage 跟踪 | IO on hidden DOM（不可用） | scroll 事件 / hammerjs panend 推导 |
| 次级手势 | 各自重复实现 | `useReaderGestures` 统一 hook |
| 分页组装 | block-index = page-index（错） | `groupBlocksIntoPages` 正确拼接 |
| 代码重复 | SmoothBody 180 行 + FlipBody 180 行 | SmoothBody 30 行 + FlipBody 30 行 + PaginatedReader 120 行 |
| bundle 增量 | page-flip ~45KB（Canvas 引擎） | hammerjs ~8KB + CSS 3D（零额外 JS） |
| 内容交互性 | Flip 模式零交互 | 所有模式文本可选、标注可点击 |
| 回退策略 | try/catch → 静态提示 | 无 hammerjs → CSS slide；无 3D → slide；reduced-motion → 瞬切 |

---

## 8. 风险

| 风险 | 等级 | 缓解 |
|------|------|------|
| CSS 3D `rotateY` 翻页效果不够真实 | 中 | hammerjs `panmove` 实时跟手 + 阴影 overlay + 页面纹理 CSS，体验接近微信读书；降级路径：纯 slide |
| hammerjs 与 React 19 兼容性 | 低 | hammerjs 是纯 DOM 库（无 React 依赖），通过 ref + useEffect 集成，与 React 版本无关 |
| `groupBlocksIntoPages` 拼接后的 markdown 空白/格式 | 低 | 用 `\n\n` 连接，remark 输出的 block 都以换行结尾；单测覆盖 |
| iOS Safari scroll-snap 的 `-webkit-overflow-scrolling` 废弃警告 | 低 | iOS 13+ 原生支持 scroll-snap，`-webkit-overflow-scrolling` 作为降级保留 |

---

## 9. 实施建议

推荐实施顺序（与原计划 Task 依赖对齐）：

1. 完成 Shared layer：`usePageNavigation` → `useReaderGestures` → `PaginatedReader` → `groupBlocksIntoPages`
2. 改造 `usePaginatedBlocks`：移除 IO + currentPage
3. 实现 `SmoothPages` + `FlipPages` 渲染器
4. 瘦身 `SmoothBody` / `FlipBody` 为 PaginatedReader wrapper
5. 追加 CSS + `pnpm add hammerjs`
6. 更新单测 + e2e

**注意**：`PaginatedReader` 替代了原 `PaginatedLayout` 的角色。如果不想改动 Task 8 已完成的工作，可以让 `PaginatedLayout` 保留但只做 measure DOM + 装页，`PaginatedReader` 在其之上做组装 + 导航。
