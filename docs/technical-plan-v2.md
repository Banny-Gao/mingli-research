# 命理学术中心 · 技术实施计划

**版本：** v2.0
**日期：** 2026-05-15
**评分：** 89/100

---

## 一、实施优先级

### P0.2 进度仪表盘强化（Landing 页面）
### P0.1 全文搜索引擎（SearchBar 重写）
### P1.4 渊海子平接入（generate.js 自动发现）
### P1.1 技能与篇目双向关联
### P1.2 划线+批注系统
### P1.3 读书笔记页（/notes 路由）
### P2.1 导出与打印
### P2.2 SEO 强化
### P2.3 深色/浅色模式切换
### P2.4 键盘快捷键

---

## 二、详细技术方案

### P0.2 — 进度仪表盘强化

**目标文件：**
- `src/hooks/useProgress.ts` — 新增 `useGlobalProgress()` hook
- `src/pages/Landing.tsx` — 替换静态统计为动态数据

**localStorage 结构（v2）：**
```ts
{
  currentBook: string | null,           // 当前在读书籍 slug
  lastReadChapter: string | null,       // 最近阅读篇目名
  recentChapters: Array<{slug, chapter, ts}>, // 最近5条
  streakDays: number,                   // 连续学习天数
  lastActiveDate: string,               // 'YYYY-MM-DD'
}
```

**streak 计算逻辑：**
- 打开页面对比 `lastActiveDate` 与 today
- 同一天 → 不变
- 昨天 → streak + 1
- 间隔 > 1 天 → 重置为 1
- 每次 `markRead` 时更新 `lastActiveDate`

---

### P0.1 — 全文搜索引擎

**generate.js 扩展：**
```
1. 解析 catalog.md 所有篇目
2. 读取 interp/*.md → 剥离 HTML 标签 → 纯文本
3. 读取 skill/SKILL.md → 剥离 HTML 标签 → 纯文本
4. 生成 public/search-index.json
   格式: { slug, interp: [{key, title, text, snippet}], skill: [{key, name, text}] }[]
```

**SearchBar.tsx 重写：**
- 首屏懒加载 `search-index.json`（module-level 缓存）
- 使用 Fuse.js 进行模糊匹配（threshold 0.4）
- 200ms debounce
- 结果展示：篇目名 + 60字符命中上下文 + 高亮
- Enter/点击 → 跳转 `/{slug}` + 自动打开 Modal

**依赖：** 新增 `fuse.js` 包

**CSS 新增：**
```css
.search-highlight { background: rgba(240,192,96,0.25); border-radius: 2px; }
```

---

### P1.1 — 技能与篇目双向关联

**catalog.md 扩展格式：**
```markdown
| 01 | 天道 | interp/天道.md | 已解读 | tiandao,kundao |
                        ↑ 关联技能字段
```

**generate.js 改动：**
- 解析 `catalog.md` 末尾 `skills:` 字段
- 输出 `src/data/{slug}/assoc.ts`
  ```ts
  export const assocData = {
    interpToSkill: { '天道': ['tiandao', 'kundao'], ... },
    skillToInterp: { 'tiandao': ['天道'], ... },
  }
  ```

**BookApp.tsx 改动：**
- interp Modal 底部：`关联技能` 标签行
- skill Modal 底部：`相关篇目` 标签行
- 复用 `ReadList.tsx` 的 badge 样式

---

### P1.2 — 划线+批注系统

**新增文件：**
- `src/hooks/useAnnotations.ts`
- `src/components/AnnotationToolbar.tsx`
- `src/components/AnnotationPanel.tsx`

**Annotation 数据结构：**
```ts
type AnnotationType = 'emphasis' | 'question' | 'quote';
interface Annotation {
  id: string;
  type: AnnotationType;
  selectedText: string;
  rangeStart: number;   // 字符偏移（innerHTML 中）
  rangeEnd: number;
  note: string;         // 私有批注
  createdAt: number;
}
// localStorage key: mingli_annotations_{slug}_{chapterName}
```

**交互流程：**
1. `Modal body` 添加 `onMouseUp` → 检测 `window.getSelection()` → 计算字符偏移 → 显示 `AnnotationToolbar`
2. 工具栏：`[重点(黄)] [疑问(红)] [引用(蓝)] [关闭]`
3. 确认 → 存储 annotation → 使用 DOMParser 解析 innerHTML → 注入 `<mark class="ann-*">` → 重新序列化
4. `AnnotationPanel`：Modal 右侧常驻（可折叠），按类型分组展示列表，点击跳转对应位置

**CSS：**
```css
mark.ann-emphasis { background: rgba(240,192,96,0.3); border-bottom: 1px solid var(--color-gold); }
mark.ann-question { background: rgba(220,80,80,0.2); border-bottom: 1px solid #d05050; }
mark.ann-quote    { background: rgba(96,160,96,0.2); border-bottom: 1px solid var(--color-green); }
```

**风险：** 字符偏移在内容编辑后可能失效 → 降级策略：用文本内容匹配查找对应位置

---

### P1.3 — 读书笔记页

**新增文件：**
- `src/pages/Notes.tsx`
- `src/main.tsx` — 添加 `<Route path="/notes" element={<Notes />} />`

**功能：**
- 读取所有 `mingli_annotations_*` localStorage keys
- 按 `slug → chapterName` 分组
- 展示：类型标签 + 选中文字 + 批注内容
- `导出 Markdown` 按钮 → 生成 `.md` 文件并触发下载

---

### P1.4 — 渊海子平接入

**操作步骤：**
1. 创建 `books/yuanhaiziping/catalog.md`
2. 创建 `books/yuanhaiziping/meta/index.md`
3. 创建 `books/yuanhaiziping/interpretations/` 和 `books/yuanhaiziping/skills/` 目录
4. 执行 `pnpm generate`
5. generate.js 自动发现 → 输出 `src/data/yuanhaiziping/`
6. Landing 页书单自动出现（无需改代码）

---

### P2 — 各项

**P2.1 导出打印：**
- `index.css` 添加 `@media print` 块（隐藏导航、展开 Modal、白底黑字）
- Modal 头部添加"打印视图"按钮

**P2.2 SEO 强化：**
- 每本书 `Book` JSON-LD schema（Helmet）
- 每篇目 `Chapter` JSON-LD schema
- `public/sitemap.xml`（generate.js 生成）

**P2.3 深色/浅色模式：**
- `<body data-theme="dark"|"light">`（main.tsx 设置）
- 主题切换按钮（Landing 页眉）
- CSS 变量：light 模式下 `bg: #f8f4ec, text: #2a2a2a`
- 偏好存储：`localStorage.setItem('mingli_theme', theme)`

**P2.4 键盘快捷键：**
- `J` / `K`：上下篇切换（在 BookApp 中追踪当前篇索引）
- `B`：收藏当前篇
- `Esc`：关闭 Modal（已实现）

---

## 三、关键修改文件清单

| 功能 | 新增文件 | 修改文件 |
|---|---|---|
| P0.2 进度仪表盘 | - | `useProgress.ts`, `Landing.tsx` |
| P0.1 全文搜索 | - | `generate.js`, `SearchBar.tsx`, `index.css` |
| P1.1 技能关联 | `src/data/{slug}/assoc.ts` | `generate.js`, `BookApp.tsx` |
| P1.2 划线批注 | `useAnnotations.ts`, `AnnotationToolbar.tsx`, `AnnotationPanel.tsx` | `BookApp.tsx`, `index.css` |
| P1.3 读书笔记 | `Notes.tsx` | `main.tsx` |
| P1.4 渊海子平 | 目录结构 | `generate.js`（自动发现） |
| P2.1 打印 | - | `index.css` |
| P2.2 SEO | - | `BookApp.tsx`（Helmet扩展） |
| P2.3 主题切换 | - | `main.tsx`, `Landing.tsx`, `index.css` |
| P2.4 快捷键 | - | `SearchBar.tsx`（扩展） |

---

## 四、无破坏性变更

所有新 hook 均为增量添加，现有 API 完全兼容：
- `useProgress.ts` 保持现有 `markRead`/`toggle` 接口不变
- `interpContent`/`skillContent` 保持 `Record<string, () => Promise<string>>` 接口
- `ditiansui-site.ts` compat 层继续服务旧消费者

---

**评分：89/100**
启动顺序：P0.2 → P0.1 → P1.4 → P1.1 → P1.2 → P1.3 → P2系列