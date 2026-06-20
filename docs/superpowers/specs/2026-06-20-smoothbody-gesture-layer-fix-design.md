# SmoothBody 真机手势失效修复 — Design

**日期**：2026-06-20
**状态**：设计中
**作者**：Claude + 高志鹏
**问题诊断起点**：`src/components/ModalReader/reader-mode/SmoothBody.tsx` 在真机无法左右滑动翻页，但 `FlipBody`（同一项目，同一手势封装）正常。浏览器 h5 模式正常。

---

## 1. 背景与目标

### 1.1 问题

移动端 `<= 640px` 切到 SmoothBody（CSS scroll-snap 风格的横向翻页）后：

- ❌ 真机：左右滑动不翻页，但 viewport 会"自由横向滚"（无吸附）
- ❌ 真机：连点击左/右 1/3 区域的 tap 翻页都不工作
- ✅ 真机 FlipBody：滑动 + tap 翻页均正常
- ✅ 浏览器 h5 模式（Chrome devtools mobile emulation）：SmoothBody 正常

### 1.2 目标

让 SmoothBody 在真机（iOS Safari、Android WebView、微信内置 X5）上的手势翻页行为与 FlipBody 对齐：

1. 滑动翻页正常触发（左右各方向）
2. tap 左/右 1/3 翻页正常
3. tap 中央切换 header 正常
4. 不破坏页内纵向滚动（`.smooth-page` 内 `overflow-y: auto` 仍可滚）
5. 不改变 ScrollBody / FlipBody / PaginatedReader 接口

### 1.3 非目标

- 不回归 CSS scroll-snap 原生方案（方案 C）—— 改动太大，单独一个 spec 处理
- 不修 measure-dom 撑大滚动范围的现象（修完手势层后该现象会一并消失，无需额外处理）
- 不动 usePageGesture（与 FlipBody 共用，行为对齐收益大）
- 不增加自动端到端测试（项目 e2e 体系尚未稳定运行）

---

## 2. 根因分析

### 2.1 根因（按决定性排序）

**根因 1：`.smooth-page` 的 `touch-action: pan-y` 覆盖了 hammer 的 `touch-action: none`**

`src/components/ModalReader/ModalReader.less:58`：

```less
.smooth-page {
  width: 100vw; min-width: 100vw; max-width: 100vw;
  height: 100%;
  overflow-y: auto;
  scroll-snap-align: start;
  flex-shrink: 0;
  padding: 1rem;
  box-sizing: border-box;
  touch-action: pan-y;          ← 关键
}
```

`src/components/ModalReader/reader-mode/usePageGesture.ts:73`：

```ts
const hammer = new Hammer.Manager(el, { touchAction: 'none' })
```

hammer 把 `el.style.touchAction = 'none'` 设在 `.smooth-viewport` 上。但 **iOS Safari / Android WebView 决策 touch 行为时，采纳 touch path 上第一个非 `auto` 的 touch-action 祖先**——这里就是 `.smooth-page` 的 `pan-y`，比 viewport 的 `none` 更靠近手指，浏览器优先选它。

`touch-action: pan-y` 的语义：垂直 pan 交给浏览器，水平 pan **也默认交给浏览器**（除非有祖先声明其他）。

结果：
- 浏览器接管水平 pan → 直接滚动 `.smooth-viewport` 的 `overflow-x: auto`
- hammer 的 `panmove`/`panend` 完全不触发（touch 没到 JS 层）
- 用户感觉 viewport 在"自由横向滚"——这正是"还有横向滚动条"的体感
- tap 也不触发（hammer 收不到 pointerdown/touchstart）

**为什么浏览器 h5 模拟器正常**：
- Chrome devtools mobile emulation 在某些情况下 `SUPPORT_ONLY_TOUCH = false`，走 PointerEventInput 路径
- PointerEventInput 在模拟器上对 `touch-action` 的处理与真机有差异
- 模拟器布局阶段 `visibility: hidden + absolute` 元素可能未真正撑大滚动范围

**为什么 FlipBody 正常**：
- `src/components/ModalReader/reader-mode/FlipPages.tsx:178-179` 注释明确：
  ```tsx
  {/* 手势层：覆盖在 page-flip 内部元素之上，确保 Hammer.js 能收到触摸事件 */}
  <div ref={gestureRef} className="flip-gesture-layer" />
  ```
- `.flip-gesture-layer`（`ModalReader.less:89-94`）`position: absolute; inset: 0; z-index: 20; touch-action: none`
- 手势绑在 gesture-layer，**gesture-layer 覆盖所有 flip-book-page 之上**——touch path 上第一个非 `auto` 的 touch-action 祖先就是 gesture-layer 自己的 `none`，浏览器把全部控制权交给 JS
- 翻页由 page-flip 库自己驱动 3D 卷页，**根本不靠 scrollLeft**

### 2.2 次要现象（不需修）

`.measure-dom` 用了 `position: absolute; left: -99999px; visibility: hidden;`，在 `.smooth-viewport` 是 `overflow-x: auto` 的情况下，`scrollWidth` 会撑到约 100000px。这是"还有横向滚动条"的另一个解释。

但**根因不在此**——即使不撑大滚动范围，只要浏览器接管水平 pan，hammer 就收不到事件，tween 就不会被触发。修完手势层后，GSAP 写到 `currentPage * vp.clientWidth`（如 0、500、1000...）都在合法范围内，浏览器自然会响应。

---

## 3. 修复设计

### 3.1 架构

**当前（坏）**：
```
PaginatedReader
├─ measure-dom
└─ SmoothPages
   └─ .smooth-viewport ← usePageGesture 绑这里（viewport 自己就是滚动容器）
      └─ .smooth-track
         └─ .smooth-page × N（touch-action: pan-y 干扰）
```

**修复后**：
```
PaginatedReader
├─ measure-dom
└─ SmoothPages
   └─ .smooth-viewport（纯滚动容器，hammer 不再绑这里）
      └─ .smooth-track
         └─ .smooth-page × N（保持 overflow-y: auto，纵向滚动不被劫持）
   └─ .smooth-gesture-layer ← usePageGesture 绑这里
                                position absolute inset 0
                                z-index 20
                                touch-action: none
```

### 3.2 关键改动

#### 改动 1：`src/components/ModalReader/reader-mode/SmoothPages.tsx`

- 新增 `gestureRef = useRef<HTMLDivElement>(null)`
- `usePageGesture` 的 `containerRef` 由 `viewportRef` 改为 `gestureRef`
- `onPanMove` 回调里继续写 `viewportRef.current.scrollLeft`（跟手逻辑不变）
- JSX 末尾追加 `<div ref={gestureRef} className="smooth-gesture-layer" />`，**放在 `.smooth-viewport` 之内**（z-index 20 > 默认，确保覆盖在 .smooth-track 之上）
- 保留 `viewportRef` 用于 scrollLeft 写入和 GSAP tween

#### 改动 2：`src/components/ModalReader/ModalReader.less`

在 `@media (max-width: @mobile-breakpoint)` 块中追加：

```less
.smooth-gesture-layer {
  position: absolute;
  inset: 0;
  z-index: 20;
  touch-action: none;          /* 关键：覆盖 .smooth-page 的 pan-y */
}
```

样式与 `.flip-gesture-layer` 对齐（架构对称）。

### 3.3 不改的部分

- `usePageGesture.ts`：不动（与 FlipBody 共用，行为对齐）
- `usePageNavigation.ts`：不动（goToPage 逻辑不变）
- `PaginatedReader.tsx` 内的 measure-dom：**不动**（修完手势层后撑大滚动范围的副作用无感）
- `FlipPages.tsx` / `FlipBody.tsx`：不动
- `ScrollBody.tsx`：不动
- `ReaderBody.tsx`：不动

### 3.4 数据流（不变）

```
用户触摸 .smooth-gesture-layer
  → hammer.PanMove → onPanMove(deltaX)
    → vp.scrollLeft = currentPage * vp.clientWidth - deltaX     // 跟手
  → hammer.PanEnd (|deltaX| > 25% 宽度 或 |velocityX| > 0.3)
    → goToPage(target) → currentPage 变化
      → useEffect 触发
        → GSAP tween vp.scrollLeft → currentPage * vp.clientWidth  // 吸附
```

---

## 4. 风险与边界

### 4.1 风险等级

LOW。改动局限在两个文件：SmoothPages.tsx（约 +5 行）、ModalReader.less（约 +6 行）。无接口变更。

### 4.2 边界情况

| 场景 | 行为 | 验证方式 |
|------|------|----------|
| 章节切换（modalKey 变） | usePageNavigation 重置 currentPage → useEffect GSAP tween 到 0 | 人工 |
| 第一次挂载（currentPage > 0） | 现有 useEffect 写 scrollLeft → 仍工作 | 人工 |
| 翻到最后一页右滑 | panend 算 target = totalPages → clampPage 截断 → 不变 | 人工 |
| 翻到首页左滑 | 类似 | 人工 |
| 页内纵向滚动 | `.smooth-page` 内 `overflow-y: auto` 不变 → 仍可滚 | 人工 |
| 中央 tap | gesture-layer 全覆盖 → hammer 收到 tap → onCenterTap 触发 | 人工 |
| 触屏左/右 1/3 tap | gesture-layer 全覆盖 → hammer 收到 tap → goToPage 触发 | 人工 |

### 4.3 兼容性

- iOS Safari 13+（PointerEvent）
- iOS Safari 12 及以下（TouchEvent）
- Android Chrome 60+（PointerEvent）
- Android 微信内置 X5（Blink 内核，PointerEvent）
- 浏览器 h5 模拟器（保留原行为，不退化）

---

## 5. 测试

### 5.1 不新增单测

手势层是 useEffect 副作用，纯单测难覆盖。SmoothPages 当前也没有单测（项目里只有 `usePageNavigation` / `isPaginatedMode` / `groupBlocksIntoPages` 等纯函数单测）。**保持现状，不引入新测试模式**。

### 5.2 人工验收清单（真机）

在真机（iOS Safari / Android Chrome / Android 微信）`<= 640px` 视口下，进入 SmoothBody 模式：

- [ ] 横向左滑：翻到下一页
- [ ] 横向右滑：翻到上一页
- [ ] 点击左 1/3 区域：翻到上一页
- [ ] 点击右 1/3 区域：翻到下一页
- [ ] 点击中间 1/3 区域：切换 header 显隐
- [ ] 章节切换：从第 0 页开始
- [ ] 页内纵向滚动：不被手势层拦截
- [ ] 翻到边界（首页/末页）：不跨章节
- [ ] 反复左右滑动：连续翻页无残留滚动

### 5.3 浏览器 h5 模式回归

- [ ] Chrome devtools mobile emulation `<= 640px` 切 SmoothBody：翻页行为不变
- [ ] FlipBody 行为不变（独立路径）
- [ ] ScrollBody 行为不变（独立路径）

---

## 6. 实现计划

按 superpowers:writing-plans 流程生成，落到 `docs/superpowers/plans/2026-06-20-smoothbody-gesture-layer-fix.md`。

预计步骤：

1. `ModalReader.less` 追加 `.smooth-gesture-layer` 样式（6 行）
2. `SmoothPages.tsx`：
   - 新增 `gestureRef`
   - `usePageGesture` 的 `containerRef` 改 `gestureRef`
   - JSX 末尾追加 `<div ref={gestureRef} className="smooth-gesture-layer" />`
3. 浏览器 h5 模式回归
4. 真机验收

---

## 7. 决策记录

| 选项 | 选择 | 理由 |
|------|------|------|
| A: 最小修 touch-action | ❌ | 不解决 measure-dom 撑大滚动范围 |
| **B: 拆独立手势层** | ✅ | 与 FlipBody 架构对齐，根因彻底 |
| C: 回归 scroll-snap + transform | ❌ | 改动大（100+ 行），独立 spec 处理 |
| measure-dom 加 pointer-events: none | ❌ | 修完手势层后该问题不需额外处理（用户确认） |
| 加 usePageGesture 单测 | ❌ | 手势层是副作用，纯单测难覆盖（用户偏好与项目现状一致） |
