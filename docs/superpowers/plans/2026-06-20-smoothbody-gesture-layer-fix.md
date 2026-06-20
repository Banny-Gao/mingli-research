# SmoothBody Gesture Layer Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复真机 SmoothBody 无法左右滑动翻页的问题，让其与 FlipBody 在手势层架构上对齐。

**Architecture:** 仿照 FlipBody 已有的 `.flip-gesture-layer` 模式，在 `.smooth-viewport` 内叠加一个独立的 `.smooth-gesture-layer`（`position: absolute; inset: 0; z-index: 20; touch-action: none`），把 hammer.js 的手势从 `.smooth-viewport` 改绑到这个 gesture layer，让 `.smooth-page` 上的 `touch-action: pan-y` 不再覆盖 hammer 的 `touch-action: none`。

**Tech Stack:** React 18 + TypeScript + Hammer.js 2.0.8（已存在）+ GSAP（已存在）+ Less

---

## File Structure

**修改文件：**

- `src/components/ModalReader/ModalReader.less` — 追加 `.smooth-gesture-layer` 样式块（与 `.flip-gesture-layer` 对齐）
- `src/components/ModalReader/reader-mode/SmoothPages.tsx` — 新增 `gestureRef`，`usePageGesture` 改绑 gestureRef，JSX 末尾追加 gesture-layer 元素

**不修改文件：**

- `src/components/ModalReader/reader-mode/usePageGesture.ts` — 共享手势 hook，行为不变
- `src/components/ModalReader/reader-mode/PaginatedReader.tsx` — measure-dom 防御性改动已 spec 决策为不加
- `src/components/ModalReader/reader-mode/FlipBody.tsx` / `FlipPages.tsx` — 独立路径
- `src/components/ModalReader/reader-mode/ScrollBody.tsx` — 独立路径
- `src/components/ModalReader/reader-mode/usePageNavigation.ts` — 翻页逻辑不变
- `src/components/ModalReader/reader-mode/ReaderBody.tsx` — 模式分发不变

---

## Task 1: 在 ModalReader.less 追加 `.smooth-gesture-layer` 样式

**Files:**
- Modify: `src/components/ModalReader/ModalReader.less:24-60`（移动端平滑翻页 `@media` 块内）

- [ ] **Step 1: 打开 `src/components/ModalReader/ModalReader.less` 定位插入点**

读文件确认当前 `.smooth-page` 样式块结构（应位于第 48-59 行）。

- [ ] **Step 2: 在 `.smooth-page` 块之后追加 `.smooth-gesture-layer` 样式**

在 `@media (max-width: @mobile-breakpoint) { ... }` 块内、`.smooth-page { ... }` 闭合大括号之后、`}`（媒体查询结束）之前，插入：

```less
  .smooth-gesture-layer {
    position: absolute;
    inset: 0;
    z-index: 20;
    touch-action: none;
  }
```

> 缩进 2 空格，与 `.smooth-page` 块对齐；与 `.flip-gesture-layer`（同文件第 89-94 行）属性一致，仅少一个 `background`（gesture-layer 是透明覆盖层）。

- [ ] **Step 3: 验证 less 编译通过**

Run: `pnpm build:less` 或项目等价命令（视 `package.json` 中的 scripts）
Expected: 编译无错误，输出 css 文件正常生成。

若项目无独立 `build:less`，改用 `pnpm lint` 或 `pnpm build` 验证。

- [ ] **Step 4: 提交**

```bash
git add src/components/ModalReader/ModalReader.less
git commit -m "fix(smooth-mode): add .smooth-gesture-layer CSS to prevent touch-action conflict"
```

---

## Task 2: 在 SmoothPages.tsx 拆出手势层

**Files:**
- Modify: `src/components/ModalReader/reader-mode/SmoothPages.tsx:1-77`（整个文件）

- [ ] **Step 1: 新增 `gestureRef`**

修改 `SmoothPages.tsx` 第 14-15 行（`useRef` 声明区），把：

```tsx
  const viewportRef = useRef<HTMLDivElement>(null)
  const pendingScrollRef = useRef(false)
```

改为：

```tsx
  const viewportRef = useRef<HTMLDivElement>(null)
  const gestureRef = useRef<HTMLDivElement>(null)
  const pendingScrollRef = useRef(false)
```

- [ ] **Step 2: `usePageGesture` 的 `containerRef` 改用 `gestureRef`**

修改第 17-29 行（`usePageGesture` 调用），把：

```tsx
  usePageGesture({
    containerRef: viewportRef,
    currentPage,
    totalPages: pageMds.length,
    goToPage,
    onCenterTap,
    onPanMove: deltaX => {
      const vp = viewportRef.current
      if (!vp) return
      vp.scrollLeft = currentPage * vp.clientWidth - deltaX
    },
  })
```

改为：

```tsx
  usePageGesture({
    containerRef: gestureRef,
    currentPage,
    totalPages: pageMds.length,
    goToPage,
    onCenterTap,
    onPanMove: deltaX => {
      const vp = viewportRef.current
      if (!vp) return
      vp.scrollLeft = currentPage * vp.clientWidth - deltaX
    },
  })
```

> `onPanMove` 仍写 `viewportRef.current.scrollLeft`（跟手目标仍是滚动容器，gesture layer 仅承担事件捕获职责）。

- [ ] **Step 3: 在 JSX 末尾追加 gesture-layer 元素**

修改第 60-76 行（JSX return），把：

```tsx
  return (
    <div ref={viewportRef} className="smooth-viewport">
      <div className="smooth-track">
        {pageMds.map((md, i) => (
          <div key={i} className={`smooth-page ${proseClass || ''}`} data-page={i}>
            <ReactMarkdown
              remarkPlugins={remarkPlugins}
              rehypePlugins={rehypePlugins}
              components={markdownComponents}
            >
              {md}
            </ReactMarkdown>
          </div>
        ))}
      </div>
    </div>
  )
```

改为：

```tsx
  return (
    <div ref={viewportRef} className="smooth-viewport">
      <div className="smooth-track">
        {pageMds.map((md, i) => (
          <div key={i} className={`smooth-page ${proseClass || ''}`} data-page={i}>
            <ReactMarkdown
              remarkPlugins={remarkPlugins}
              rehypePlugins={rehypePlugins}
              components={markdownComponents}
            >
              {md}
            </ReactMarkdown>
          </div>
        ))}
      </div>
      {/* 手势层：覆盖在 .smooth-track 之上，确保 Hammer.js 能收到触摸事件。
          与 FlipBody 的 .flip-gesture-layer 架构对称。
          关键属性：touch-action: none 覆盖 .smooth-page 的 touch-action: pan-y，
          让浏览器在真机上不会接管水平 pan（iOS Safari / Android WebView 决策顺序
          是 touch path 上第一个非 auto 的 touch-action 祖先，gesture layer 离手指更近）。 */}
      <div ref={gestureRef} className="smooth-gesture-layer" />
    </div>
  )
```

> gesture-layer 元素放在 `.smooth-viewport` 内（不是同级），是 `.smooth-viewport` 的子元素，CSS `position: absolute; inset: 0` 让其铺满整个 viewport 区域并叠加在 `.smooth-track` 之上。

- [ ] **Step 4: 类型检查**

Run: `pnpm tsc --noEmit` 或 `pnpm build`
Expected: 0 类型错误。`gestureRef` 是 `RefObject<HTMLDivElement | null>`，与 `usePageGesture` 的 `containerRef: React.RefObject<HTMLElement | null>` 参数类型兼容（HTMLDivElement extends HTMLElement）。

- [ ] **Step 5: 提交**

```bash
git add src/components/ModalReader/reader-mode/SmoothPages.tsx
git commit -m "fix(smooth-mode): bind hammer gesture to dedicated .smooth-gesture-layer"
```

---

## Task 3: 浏览器 h5 模式回归

**Files:**
- 不改文件，仅运行 dev server 人工验收

- [ ] **Step 1: 启动开发服务器**

Run: `pnpm dev`（或项目等价命令）
Expected: dev server 启动成功，终端打印 local URL（如 `http://localhost:5173`）。

- [ ] **Step 2: Chrome devtools 切到 mobile emulation（<= 640px）**

访问任一 interp 页 → 切到 SmoothBody 模式（如果默认不是）。

- [ ] **Step 3: 验收清单（h5 模式）**

- [ ] 左右滑动翻页：手势层没影响 devtools 模拟下的翻页行为
- [ ] 点击左/右 1/3 区域翻页：tap 仍触发
- [ ] 中央 tap 切换 header：仍触发
- [ ] 页内纵向滚动：仍可滚（gesture-layer 是绝对定位覆盖，不拦截 page 内部 div 的 touch，因为 page 本身 `overflow-y: auto` 处理）

- [ ] **Step 4: 验收 FlipBody / ScrollBody 路径不受影响**

- [ ] FlipBody：翻页正常（独立手势层，无相互依赖）
- [ ] ScrollBody：滚动正常（未触碰该路径代码）

- [ ] **Step 5: 验收结束关闭 dev server**

按 `Ctrl+C` 或 `Cmd+C` 结束 dev server 进程。

---

## Task 4: 真机验收（人工）

**Files:**
- 不改文件，需要用户在真机手动验证

> 本任务不提交代码。验收清单如下，发现问题先记录再决定是否进入 Task 5 修复。

- [ ] **Step 1: 真机部署最新代码**

- [ ] iOS Safari 真机：构建并部署（H5 / PWA / 嵌入壳，按项目实际情况）
- [ ] Android Chrome 真机：同上
- [ ] Android 微信内置浏览器（X5 内核）：同上（若项目有微信端）

- [ ] **Step 2: iOS Safari 验收（≤ 640px 视口）**

进入任一 interp 页 → 切到 SmoothBody → 验收：

- [ ] 横向左滑：翻到下一页
- [ ] 横向右滑：翻到上一页
- [ ] 点击左 1/3：翻到上一页
- [ ] 点击右 1/3：翻到下一页
- [ ] 点击中央 1/3：切换 header 显隐
- [ ] 页内纵向滚动（长页面）：不被劫持
- [ ] 翻到边界（首页左滑 / 末页右滑）：不跨章节

- [ ] **Step 3: Android Chrome 验收（同上 7 项）**

- [ ] **Step 4: Android 微信内置浏览器验收（若有，同上 7 项）**

- [ ] **Step 5: 验收结果记录**

- [ ] 全通过：关闭 issue，无需 Task 5
- [ ] 部分失败：在 issue 中记录失败场景，决定是否需要进一步修复（可能涉及 hammer 自身兼容性问题，需要新 spec 单独处理）

---

## Task 5 (可选): 验收失败时的修复

仅在 Task 4 任何项目失败时执行。本任务的步骤根据实际失败场景决定——不在 plan 中预定义具体改动（避免在没有失败证据的情况下瞎改）。

若进入本任务：

- [ ] **Step 1: 收集失败场景证据**

- 真机型号 + 系统版本
- 浏览器 + 版本
- 失败现象描述（手势不响应 / 翻页乱跳 / 滚动条异常 / 其他）
- 控制台日志（若项目有远程日志）

- [ ] **Step 2: 决定修复方案**

- 若是 hammer 在某浏览器兼容性问题：考虑换用 Pointer Events 直接封装（去掉 hammer 依赖）
- 若是 GSAP tween 在某浏览器失效：考虑用 `el.scrollTo({ left, behavior: 'smooth' })` 原生 API 替代
- 若是 `.smooth-page` 内 `overflow-y: auto` 干扰 gesture-layer：在 gesture-layer 加 `pointer-events: auto` 显式声明（确保事件穿透到 gesture-layer 而非 .smooth-page）
- 若是 measure-dom 撑大滚动范围影响 GSAP：将 measure-dom 加 `display: none`（在测量完成后切换），彻底离开布局树

- [ ] **Step 3: 实施 + 重新走 Task 4 验收**

---

## Self-Review

1. **Spec coverage** — 检查每个 spec section：
   - §1.1 问题：Task 4 覆盖真机验收 ✓
   - §1.2 目标 1-5：Task 2 + Task 4 覆盖 ✓
   - §2.1 根因 1：Task 1（CSS 改 touch-action）+ Task 2（gesture layer）共同解决 ✓
   - §2.2 次要现象（measure-dom）：spec §3.3 决策为不动，Task 1+2 修完后此现象无感 ✓
   - §3.2 改动 1：Task 2 完整覆盖 ✓
   - §3.2 改动 2：Task 1 完整覆盖 ✓
   - §3.3 不改的部分：所有未列在 Task 1/2 中的文件保持原样 ✓
   - §4.2 边界情况：Task 4 验收清单覆盖（边界、章节切换、tap 区域） ✓
   - §5 测试：spec §5.1 决策为不新增单测，Task 1+2+3+4 覆盖人工验收 ✓

2. **Placeholder scan** — 全文搜索：
   - TBD / TODO / "fill in" / "implement later"：未发现 ✓
   - "Add appropriate error handling" 等抽象指令：未发现 ✓
   - "Similar to Task N"：未发现（每步代码完整）✓

3. **Type consistency**：
   - `gestureRef` 在 Task 2 Step 1 声明为 `useRef<HTMLDivElement>(null)`，Step 2 用作 `containerRef`，与 `usePageGesture` 签名 `containerRef: React.RefObject<HTMLElement | null>` 兼容（HTMLDivElement ⊆ HTMLElement）✓
   - `viewportRef` 仍是 `useRef<HTMLDivElement>(null)`，Step 2 的 `onPanMove` 继续用其 `.current.scrollLeft` ✓
   - CSS 类名 `.smooth-gesture-layer` 在 Task 1 CSS 和 Task 2 JSX 中一致 ✓

无 spec 遗漏，无 placeholder，类型一致。