# 样式层规范

适用于 CSS / Less / Tailwind / 主题样式。聚焦样式组织、设计系统化和可维护性的审查要点。

## 1. CSS 架构与组织

### 1.1 样式方案选择

> 级别：Suggestion

项目启动时选择的 CSS 方案决定后续的约束。不混用方案：

```css
/* 方案 A：CSS Modules（默认推荐） */
/* 组件级作用域，避免命名冲突 */
/* styles.module.css */
.card { /* 自动编译为 .card_hash */ }

/* 方案 B：Tailwind CSS（组件密集场景） */
/* 适合 UI 一致性强、快速迭代的项目 */

/* 方案 C：BEM + 全局 CSS（传统项目） */
/* .block__element--modifier */
```

| 方案 | 作用域 | 类型安全 | 学习成本 | 维护成本 |
|------|--------|----------|----------|----------|
| CSS Modules | ✅ 自动 | 中等 | 低 | 低 |
| Tailwind | ❌ 无 | 有插件 | 中 | 中（配置集中） |
| BEM | 手动 | 无 | 低 | 中（命名管理） |
| CSS-in-JS | ✅ 自动 | 高 | 中 | 中 |
| Scoped（Vue） | ✅ 自动 | 低 | 低 | 低 |

**审查要点：** 同一个文件内不要混用多种方案（如 Tailwind class + CSS Modules + 内联 style）。

### 1.2 !important 的管理

> 级别：Warning

```css
/* ❌ 随意使用 */
.error { color: red !important; }

/* ✅ 仅在无法通过优先级控制的场景 */
/* 覆盖第三方库的内联样式 */
.toast-override { color: red !important; }  /* 需加注释说明 */
```

**检测信号：** 项目中 `!important` 数量与使用频率正相关 → 说明选择器结构设计不合理。

### 1.3 选择器优先级管理

> 级别：Warning

```css
/* 选择器优先级应该扁平化 */

/* ❌ 过高优先级（0, 2, 1）*/
div.container .header .title {}

/* ❌ 更高（0, 3, 0）*/
.nav .item .link {}

/* ✅ 扁平（0, 1, 0）*/
.title {}
.link {}

/* 检测标准：一个选择器超过 3 个层级 → 建议重构 */
```

**选择器优先级的计算：**

| 选择器 | 优先级（id，class，tag） |
|--------|------------------------|
| `.title` | (0, 1, 0) |
| `.card .title` | (0, 2, 0) |
| `div.card .title` | (0, 2, 1) |
| `#header .title` | (1, 1, 0) |

**经验法则：始终尽量使用 single class selector，不使用 ID 选择器，不超过 2 层组合。**

## 2. 布局决策

### 2.1 Flexbox vs Grid

> 级别：Suggestion

| 布局需求 | 用 flexbox | 用 grid |
|----------|------------|---------|
| 一维排列（行或列） | ✅ | — |
| 二维排列（行和列） | — | ✅ |
| 元素大小自适应 | ✅ | ✅（更精确） |
| 对齐单个元素 | ✅ | — |
| 整体页面布局 | — | ✅ |
| 内容决定了大小 | ✅ | — |
| 网格大小固定 | — | ✅ |

```css
/* Flexbox：一维，内容驱动 */
.navbar { display: flex; justify-content: space-between; align-items: center; }

/* Grid：二维，容器驱动 */
.dashboard { display: grid; grid-template-columns: 240px 1fr; grid-template-rows: auto 1fr auto; }
```

### 2.2 定位方式选择

> 级别：Suggestion

| 方案 | 场景 | 副作用 |
|------|------|--------|
| `position: relative` + margin | 微调元素位置 | 文档流不受影响 |
| `position: absolute` | 叠加层、图标标记 | 脱离文档流，父元素需非 static |
| `position: fixed` | 导航栏、弹窗遮罩 | iOS Safari 下与输入框交互时有问题 |
| `position: sticky` | 吸顶标题、侧边栏 | 需要在滚动容器内，浏览器兼容性 |
| `transform: translate()` | 动画居中 | GPU 加速，不触发重排 |

## 3. 响应式设计

### 3.1 媒体查询组织

> 级别：Suggestion

```css
/* ✅ 移动优先（推荐）*/
.card {
  width: 100%;                    /* 移动端默认 */
}
@media (min-width: 768px) {       /* 平板+ */
  .card { width: 50%; }
}
@media (min-width: 1024px) {      /* 桌面+ */
  .card { width: 33.33%; }
}

/* ❌ 桌面优先（仅特定场景需要）*/
.card {
  width: 33.33%;                  /* 桌面默认 */
}
@media (max-width: 1023px) {
  .card { width: 50%; }
}
```

**为什么建议移动优先：** 移动优先的 `min-width` 更自然，且所有设备都有基础样式。桌面优先需要为每个旧设备写覆盖。

### 3.2 容器查询（Container Queries）

> 级别：Suggestion

```css
/* 当组件需要在不同容器宽度下自适应时，容器查询优于媒体查询 */
.card-container {
  container-type: inline-size;
}

@container (max-width: 400px) {
  .card { flex-direction: column; }
}
@container (min-width: 401px) {
  .card { flex-direction: row; }
}
```

**适用场景：** 侧边栏和主内容区使用同一组件时，容器查询比媒体查询更合理（不需要知道整体视口尺寸）。

### 3.3 图片响应式

> 级别：Warning

```html
<!-- ✅ 响应式图片 -->
<img
  src="photo-400.jpg"
  srcset="photo-400.jpg 400w, photo-800.jpg 800w, photo-1200.jpg 1200w"
  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
  loading="lazy"
  alt="description"
/>

<!-- ❌ 大图无缩放 -->
<img src="photo-4000.jpg" style="width: 100%" />
<!-- 视觉上宽度 100%，但仍然要下载 4000px 图片 -->
```

## 4. 主题与设计令牌

### 4.1 颜色管理

> 级别：Warning

```css
/* ❌ 硬编码颜色 */
.button-primary { background: #409eff; }
.button-success { background: #67c23a; }

/* ✅ CSS 变量 */
:root {
  --color-primary: #409eff;
  --color-success: #67c23a;
}
.button-primary { background: var(--color-primary); }
.button-success { background: var(--color-success); }

/* ✅ 支持暗色模式 */
.dark {
  --color-primary: #66b1ff;   /* 深色背景下更亮 */
}
```

**检测信号：** 样式文件中的 `#` 开头或 `rgb()` 值 → 应有对应的 CSS 变量或主题令牌。

### 4.2 设计令牌的一致性

> 级别：Suggestion

```
CSS 变量应该形成一套系统，而不是散乱的值：

✅ 好的系统：
  --color-primary          // 品牌色
  --color-primary-hover    // 悬浮态
  --spacing-xs (4px)
  --spacing-sm (8px)       // 4 的倍数间距
  --spacing-md (16px)
  --spacing-lg (24px)
  --font-size-body (14px)
  --font-size-h1 (24px)

❌ 散乱：
  --blue: #409eff
  --margin: 10px
  --font: 16px
```

**判断标准：** CSS 变量命名的模式反映系统设计。相邻含义的值应该有倍数关系（如间距 4/8/16/24/32）。

### 4.3 暗色模式实施策略

> 级别：Suggestion

```css
/* 方案 A：CSS 变量覆盖（推荐）*/
:root {
  --bg-primary: #fff;
  --text-primary: #333;
}
[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --text-primary: #e0e0e0;
}

/* 方案 B：媒体查询（跟随系统偏好）*/
@media (prefers-color-scheme: dark) {
  :root { /* 暗色变量 */ }
}

/* 审查要点：方案 A 支持手动切换，方案 B 不支持。通常两者结合。*/
```

## 5. Less 规范

### 5.1 嵌套深度

> 级别：Warning

```less
// ✅ 不超过 3 层
.card {
  &__header {
    .title { font-size: 16px; }
  }
}

// ❌ 超过 4 层
.nav {
  .list {
    .item {
      .link {
        .icon { }  // 生成的 CSS：.nav .list .item .link .icon {}
      }
    }
  }
}
```

**检测标准：** 嵌套超过 3 层（含父选择器）→ 应使用子组件拆分或扁平化选择器。

### 5.2 变量与 Mixin

> 级别：Warning

```less
// ✅ 语义化变量名
@color-primary: #409eff;
@spacing-base: 16px;
@font-size-body: 14px;

// ✅ 参数化 mixin
.text-ellipsis(@lines: 1) when (@lines = 1) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.text-ellipsis(@lines) when (@lines > 1) {
  display: -webkit-box;
  -webkit-line-clamp: @lines;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// ❌ 无参数 mixin（用 %placeholder 替代）
.no-params-mixin() {
  color: red;
}
```

## 6. Tailwind 规范

### 6.1 工具类优先

> 级别：Suggestion

```html
<!-- ✅ OK：直接用工具类 -->
<div class="flex items-center gap-4 p-4 bg-white rounded-lg">

<!-- ✅ 重复 3 次以上 → 提取为组件 -->
<Card>提取后的组件</Card>

<!-- ❌ 不要轻易写自定义 CSS 覆盖工具类 -->
<div class="p-4" style="padding: 12px">  <!-- 既然覆盖了还用什么 tailwind -->
```

### 6.2 自定义类名的边界

> 级别：Suggestion

```html
<!-- 写自定义类的正当理由 -->
<!-- 1. 复杂的 CSS 无法用工具类表达（动画、渐变、网格）-->
<!-- 2. 需要伪类/伪元素 ::before, ::after -->
<!-- 3. @apply 不应该用来消除重复的工具类字符串（用组件替代）-->

<!-- ❌ @apply 滥用 -->
<div class="btn-primary">  <!-- @apply 只是语法糖，不减体积 -->
  <!-- @apply bg-blue-500 text-white px-4 py-2 rounded -->
</div>
```

## 7. 性能

### 7.1 动画性能

> 级别：Warning

```css
/* ✅ 只触发 composite（GPU 加速）*/
.element {
  transform: translateX(100px);
  opacity: 0.5;
}

/* ❌ 触发 layout + paint（重排重绘）*/
.element {
  left: 100px;
  width: 200px;
  height: 200px;
}
```

**动画检测要点：**
- ❌ 动画 `left`/`top`/`width`/`height` → 触发重排
- ❌ 动画 `box-shadow` → 触发重绘
- ✅ 只用 `transform` + `opacity` → 仅 composite

### 7.2 选择器性能

> 级别：Suggestion

```css
/* 现代浏览器选择器性能差异极小，以下主要关注维护性而非实际性能 */

/* ❌ 低效的通配选择器 */
.container > * { }

/* ❌ 过长的选择器链 */
body div.wrapper main.content section.list div.item span.text { }

/* 经验：选择器越长，继承越弱，特异性越高 → 维护成本高 */
```

### 7.3 contain 属性

> 级别：Suggestion

```css
/* 用 contain 隔离子树的重排/重绘范围 */
.widget {
  contain: layout style paint;  /* 这个组件的布局变化不影响外部 */
}
```

## 8. 维护性

### 8.1 魔术数值

> 级别：Warning

```css
/* ❌ 6px, 7px, 8px 散布在多个文件中 */
.title { margin-bottom: 7px; }
.body { gap: 6px; }
.footer { padding: 8px; }

/* ✅ 系统化的间距 */
.title { margin-bottom: var(--spacing-sm); }
.body { gap: var(--spacing-xs); }
.footer { padding: var(--spacing-sm); }
```

### 8.2 覆盖第三方样式

> 级别：Suggestion

```css
/* ✅ 覆盖第三方组件库样式时，明确标记 */
/* stylelint-disable-next-line */
.ant-modal-body {
  padding: 24px;  /* 覆盖 antd 默认 padding */
}
```

**审查要点：** 第三方样式覆盖应隔离在单独的文件或区域，不污染全局样式。
