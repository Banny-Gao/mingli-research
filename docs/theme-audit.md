# 主题审查问题清单 — mingli-research

> **dev server**：`http://localhost:5173/mingli-research/`
> **截图**：`C:/Users/Administrator/Desktop/mingli-research/screenshot/r2-*.png`

---

## 🔴 P0 必修（5 条）

### P0-1：`Notes.tsx` 用原生 `<select>` 而不是 shadcn `Select`

- **位置**：`src/pages/Notes.tsx:192-217`
- **现象**：两处原生 HTML `<select>`（典籍筛选、类型筛选）。外部容器应用站点 token（`bg-card` / `border-border` / `text-foreground`），但**展开后的 option 项由浏览器原生渲染**，dark 主题下用系统深色、light 主题下用系统浅色，与站点紫底/米底风格完全脱节。
- **截图证据**：`screenshot/r2-notes-select-dark.png`、`screenshot/r2-notes-light.png`（select 展开后弹出层颜色与背景断层）
- **修复（部分）**：完整迁移到 shadcn `Select` 工作量较大（5 个组件 + popover + listbox + 键盘 + 滚动 + 异步数据），作为最小代价方案采用 `color-scheme: dark/light`（`src/styles/base.less`）让浏览器原生控件自动跟主题切换。**`<option>` 项的 palette 仍是浏览器默认**，未完全脱离站点 token——遗留项。

### P0-2：Tailwind 任意值 `xxx-[var(--yyy)]` 散布 4 个文件共 21 处

| 文件 | 处数 | 示例 |
|------|----|------|
| `src/pages/Notes.tsx` | 14 | `bg-[var(--color-bg-card)]` / `text-[var(--color-text-dim)]` / `border-[var(--color-border)]` |
| `src/pages/BookApp.tsx` | 3 | `text-[var(--color-gold)]`（行 98）/ `text-[var(--color-text-dim)]`（行 102, 105） |
| `src/components/ActionBar/ActionBar.tsx` | 3 | `border-[var(--color-border)]` / `bg-[var(--color-bg-card)]` / `text-[var(--color-text-dim)]` |
| `src/components/ui/drawer.tsx` | 1 | `bg-[var(--scrim)]` |

- **根因**：`index.css` `@theme inline` 块只把 shadcn 语义色（`--primary` / `--card` / `--accent` 等）暴露成 Tailwind utility namespace，**业务别名（`--color-gold` / `--color-purple` / `--color-text-body` 等）没有暴露**，导致 Tailwind 不生成对应的 `text-gold` / `bg-card-name` 等类，迫使作者只能用任意值语法。
- **次生影响**：Tailwind 任意值每个类都是 unique 编译输出，**无法被 purge 优化**（`@source` 扫描对 `[var()]` 不识别）。
- **截图证据**：`screenshot/r2-bookapp-light.png`（BookApp.tsx 任意值）、`screenshot/r2-modal-actionbar-light.png`（ActionBar 任意值）

### P0-3：`Notes.tsx` 的 Badge `ann-type-X` 覆盖与 shadcn `secondary` 双重定义

- **位置**：`src/pages/Notes.tsx:409`
- **代码**：
  ```tsx
  <Badge variant="secondary" className={`ann-type-${ann.type}`}>
  ```
- **冲突**：`Badge variant="secondary"` 由 cva 生成 `bg-secondary text-secondary-foreground`；`AnnotationPanel.less:59-81` 的 `.ann-type-emphasis` 等类用 `background: color-mix(...var(--color-gold) 20%, ...)` 和 `color: var(--color-gold)` 重新定义背景与文字。两套 CSS 都会生成，less 类因 specificity 胜出——视觉上 OK 但**维护性差**（删 `variant="secondary"` 不会改变视觉、但删 less 类会改变）。
- **截图证据**：`screenshot/r2-notes-light.png`（Badge 视觉 OK，但 CSS 双重定义）

### P0-4：`ReaderSettingsDrawer.tsx` 硬编码三种主题色

- **位置**：`src/components/ModalReader/reader-mode/ReaderSettingsDrawer.tsx:75`
- **代码**：
  ```tsx
  {['#fff', '#f5f0e8', '#1a1a2e'].map((color, i) => (
    <div ... style={{ background: color }} />
  ))}
  ```
- **现象**：整段 UI 标记「即将上线」，但三个色块 hex 是项目色板的浅/中/深代表值。**与 token 体系完全脱节**——切换主题时色块不会跟随。
- **截图证据**：`screenshot/r2-modal-settings-dark.png`、`screenshot/r2-modal-settings-light.png`（色块颜色不随主题变化）

### P0-5：`components.json` 配置过时

- **位置**：`components.json`
- **错误**：
  - `"style": "base-nova"` —— **shadcn 不存在的 style**（合法值：`default` / `new-york`）；
  - `"tailwind.css": "src/styles/tailwind.css"` —— **文件不存在**（实际是 `src/styles/index.css`）；
  - `"baseColor": "neutral"` —— 项目实际不用 shadcn base palette，而是 `:root` 直接持业务 hex。
- **影响**：`pnpm dlx shadcn add` 会读 components.json 写入错误位置。

---

## 🟠 P1 应修（5 条）

### P1-1：`AnnotationPanel.less:143` 混入 shadcn 原始 token

```less
.ann-note-save {
  background: var(--color-purple);   /* 业务别名 ✅ */
  color: var(--primary-foreground);  /* shadcn 原始 token ❌ */
}
```

文件其它 30 处都用 `var(--color-*)`，唯独这一处直接引用 shadcn 原始 token。`index.css:37` 已定义 `--color-primary-foreground: var(--primary-foreground);` 但全文零引用——孤立代码 + 与本文件风格不一致。

### P1-2：`AiAssistant.less:26` 混入 shadcn 原始 token

```less
.ai-assistant-body {
  background: color-mix(in srgb, var(--accent) 8%, transparent);  /* shadcn 原始 ❌ */
  border: 1px dashed var(--color-purple);  /* 业务别名 ✅ */
  ...
}
```

文件其它 11 处都用业务别名，唯独这一处用 shadcn 原始 token。**且 AiAssistant 整个目录是 dead code**（grep 0 引用，无任何页面挂载）。

### P1-3：Tabs Trigger active 在 light 主题下视觉对比丢失

- **位置**：`src/components/ui/tabs.tsx:56`
- **实测**：
  - dark 下 active tab：`bg = #0a0a14`（= `--background`），容器 `bg-muted = #141e30`，对比明显 ✅。
  - **light 下 active tab：`bg = #f5f0e8`（= `--background`），容器 `bg-muted = #f0ebe0`——两者仅差 5 个灰阶，几乎同色** ❌。
- **根因**：`data-active:bg-background dark:data-active:bg-input/30`——`bg-input/30` 在 dark 下提供"略亮"对位，light 下没有对应的"略暗"对位。
- **截图证据**：`screenshot/r2-notes-tab-bookmark-light.png`（active tab 几乎看不见）

### P1-4：`drawer.tsx:38` 的 Tailwind 任意值 `bg-[var(--scrim)]`

```tsx
"mingli-drawer-overlay fixed inset-0 z-50 bg-[var(--scrim)] ..."
```

shadcn/ui 原子组件本应是 token 抽象最干净的一层——`drawer.tsx` 内其它部分用 `bg-popover` / `text-popover-foreground` 语义类，唯独这一行用任意值。修复：在 `@theme inline` 补 `--color-scrim: var(--scrim)`，class 用 `bg-scrim`。

### P1-5：原生 `<select>` 展开层与站点主题脱节（同 P0-1 的次生）

dev 实测：select 容器外观 OK（用站点 token），但展开后的 option 项用浏览器原生，dark/light 切换不联动。

---

## 🟡 P2 清理/可选（5 条）

### P2-1：`AiAssistant/*` 整个目录是 dead code

```
src/components/AiAssistant/AiAssistant.less
src/components/AiAssistant/AiAssistant.tsx
src/components/AiAssistant/index.ts
```

grep `AiAssistant` 在 `src/` 内 0 引用（仅自身目录）。无任何页面挂载。

### P2-2：`useNotesData.ts` `TYPE_COLORS` 常量 0 引用

```ts
export const TYPE_COLORS: Record<AnnotationType, string> = {
  emphasis: 'var(--color-gold)',
  question: 'var(--color-danger)',
  quote: 'var(--color-quote)',
}
```

`AnnotationPanel.less` 用 `ann-type-emphasis` 等 CSS 类实现颜色，而非读此常量——常量定义但无人引用。

### P2-3：`index.css:30-39` 6 个 `--color-X-foreground` 别名（修复后已被 `@theme inline` 引用）

```css
--color-destructive: var(--destructive);
--color-accent-foreground: var(--accent-foreground);
--color-muted-foreground: var(--muted-foreground);
--color-secondary-foreground: var(--secondary-foreground);
--color-primary-foreground: var(--primary-foreground);  /* AnnotationPanel.less:143 现在改用本别名（修复 P1-1） */
--color-popover-foreground: var(--popover-foreground);
```

- **修复**：原审计认为「0 引用」是 dead token——但实际上这些别名**已被 `@theme inline` 块通过 `--color-X-Y: var(--color-X-Y)` 映射为 Tailwind utility namespace**（如 `--color-primary-foreground` 暴露成 `text-primary-foreground` 等），是 Tailwind v4 推荐的「late-binding via var」模式。所以**不再 dead，保留**。
- **变更验证**：`src/styles/index.css` `@theme inline` 块中 `--color-destructive` / `--color-accent-foreground` / `--color-muted-foreground` / `--color-secondary-foreground` / `--color-primary-foreground` / `--color-popover-foreground` 已存在映射。

### P2-4：`index.css:238-239` `--color-prose-body/quote`（同上，已被 `@theme inline` 引用）

`prose.less` 直接用 `var(--color-text-body)`（= `--foreground`），没有走 prose 别名层。原审计认为是 dead token。**修复后**：`@theme inline` 块已加 `--color-prose-body: var(--color-prose-body)` 等映射，保留作为 prose 主题差异化的扩展点（如未来想让 prose 与正文不同色阶）。**不再 dead**。

### P2-5：Landing `UserStar` SVG 作为 dropdown trigger — Base UI a11y warning

- **位置**：`src/pages/Landing.tsx:82-85`
- **代码**：
  ```tsx
  <DropdownMenuTrigger
    render={<UserStar color="var(--color-purple-light)" size={20} />}
    aria-label="笔记与技能菜单"
  />
  ```
- **现象**：Base UI 控制台 warning："A component that acts as a button expected a native `<button>` ... Rendering a non-`<button>` removes native button semantics, which can impact forms and accessibility."
- **截图证据**：`screenshot/r2-landing-dropdown-light.png`（dropdown 触发正常但 console error）

### P2-6：BookCard 列表滚动后 hero-glow 漏在视口顶部（用户报告）

- **用户截图**：`screenshot\书籍卡片显示问题.png`（414px 视口宽，light 主题）
- **实测复现**：
  - `.page-wrapper` 在 `base.less:5` 设了 `height: 100%; overflow: hidden`；
  - `.page-container` 在 `layout.less:13` 设了 `flex: 1; overflow: auto`；
  - 因此 `page-container` 是**内部滚动容器**（scrollHeight 3388px > clientHeight 787px）；
  - 但 `.hero-glow`（`hero-section.less:22`）是 `position: absolute; top: -5rem; left: 50%; transform: translateX(-50%); width: 100%; height: 18.75rem; pointer-events: none`——绝对定位**挂在 page-wrapper 上**，不在 page-container 内；
  - 加上 hero-glow 在 less 里写的是 `z-index: 0`（默认），实际计算值是 `z-index: auto`；
  - top-actions 是 `position: sticky; z-index: 100; backdrop-filter: blur(14px)`。
- **结果**：用户滚动 page-container 内 BookCard 列表到任意位置，**hero-glow 紫色椭圆始终停留在视口顶部 top-actions 下方漏出**（不跟内容滚），且 z-index=auto 不够高，会被 top-actions 半透模糊部分覆盖、但依然漏在内容上方——视觉上"hero 区域残影"。
- **截图证据**：`screenshot/r2-landing-light-container-scrolled.png`（page-container scrollTop=280 后的状态——能看到 top-actions 下方残影 + 内容直接跳到 BookCard 起始，hero-section 已滚出视口但 hero-glow 残留在顶部）
- **根因总结**：
  1. `page-wrapper` + `page-container` 形成嵌套滚动层；
  2. `hero-glow` 是 page-wrapper 的兄弟节点，不跟 page-container 滚动；
  3. `hero-glow` 没有 `pointer-events: none` 配合 z-index 处理，被内容遮挡时只遮一半。
- **修复方向**：
  - 把 `.hero-glow` 移到 `.hero-section` 内部，让它跟着 hero-section 一起被滚走；或
  - 用 CSS `clip-path` 让 hero-glow 限制在 page-container 视口内；或
  - 把 page-wrapper 改成不嵌套滚动（body 直接滚），让 hero-glow 在 page-content 顶部自然消失。

### P2-7：用户截图中 BookCard 之间视觉间距过大

- **用户截图**：`screenshot\书籍卡片显示问题.png`
- **实测**：mobile (414px) BookCard 高度 ≈ 210px；card padding=15.456px、gap=13.248px（来自 `book-card { padding: 1.25rem; gap: 1rem; }` 在 14px root fontSize 下被缩放）；`.book-grid { gap: 1.25rem }` 20px——间距数值本身不异常。
- **用户感受"间距大"的根因**：与 P2-6 的滚动状态叠加——`page-container { padding: 1.5rem 1rem 4rem }` 顶部 24px + hero-section `marginBottom: 2.5rem` 40px + section-group `mb-8` 32px = **首张 BookCard 距 page-container 顶部有 ~96px 空白**，加上 page-container 滚动后 hero-glow 漏出，视觉上像"BookCard 之间间距巨大"。
- **修复**：见 P2-6 修复后此问题自动消失。

---

## 补充：dark 触发机制双轨（说明性，非缺陷）

`@custom-variant dark (&:where(:root:not([data-theme='light']) *));` 显式劫持了 Tailwind 的 `dark:` 修饰符——shadcn 原子组件里的 `dark:bg-input/30` / `dark:aria-invalid:border-destructive/50` 等在项目里实际由 `data-theme=dark` 触发，而非 `prefers-color-scheme`。行为正确，但维护者看到 `dark:*` 类名时可能误以为是基于系统偏好——建议在 `@custom-variant` 上方加 1 行注释说明。
</content>
</invoke>