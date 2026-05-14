# 命理学术站点 · 代码重构详细方案

**版本**：v1.0
**作者**：前端专家 A
**日期**：2026-05-15
**基于**：PRODUCT_PLAN.md v2.0（评审版本）

---

## 一、代码现状分析

### 1.1 文件结构

```
src/
  main.tsx              # 路由入口，含 4 个副作用 import（死代码来源）
  pages/
    Landing.tsx         # 首页，大量 inline style（~45 处），含 GSAP 动画
    BookApp.tsx         # 篇目页，inline style（~30 处），Modal 内嵌 GSAP 动画
  components/
    ReadList.tsx        # 篇目列表，inline style（~25 处），hover JS 逻辑
    SkillGrid.tsx       # 技能网格，inline style（~15 处），hover JS 逻辑
    InterpModal.tsx     # 死代码，被 main.tsx import 但实际未被使用
    SkillModal.tsx      # 死代码，同上
    index.ts
  data/
    ditiansui-site.ts   # 35980 tokens，内嵌所有 HTML 字符串（~10 篇解读 + 10 个技能）
    books.ts            # 自动生成，元数据（篇目列表）
    index.ts            # 统一导出
  styles/
    index.css           # 已定义大量 CSS 类（.modal-card/.prose-interp/.book-card 等）
```

### 1.2 关键问题定位

| 文件 | 问题 | 行数/规模 |
|------|------|-----------|
| `ditiansui-site.ts` | 35980 tokens，编译极慢；单文件承载所有 HTML | ~35000 tokens |
| `main.tsx` | 第 7-10 行副作用 import InterpModal/SkillModal（死代码） | 22 行 |
| `Landing.tsx` | 45 处 inline style，GSAP 动画 | 90 行 |
| `BookApp.tsx` | 30 处 inline style，GSAP 动画，Modal 逻辑内嵌 | 135 行 |
| `ReadList.tsx` | 25 处 inline style + hover JS | 70 行 |
| `SkillGrid.tsx` | 15 处 inline style + hover JS | 62 行 |

### 1.3 已有的可复用 CSS 资源

`index.css` 已定义以下类，但组件中未被充分使用：
- `.book-card` / `.chapter-row` / `.skill-card`（含 hover 状态）
- `.modal-backdrop` / `.modal-card` / `.modal-header` / `.modal-body`
- `.tab-btn` / `.tab-btn.active`
- `.prose-interp` / `.prose-skill`
- `@keyframes fadeUp / fadeIn / scaleUp`
- `.animate-fade-up / .animate-fade-in / .animate-scale-up`

---

## 二、文件变更总览

### 2.1 新增文件

| 文件路径 | 用途 | 工作量 |
|----------|------|--------|
| `src/components/ContentModal.tsx` | 统一 Modal 组件，替代 InterpModal/SkillModal | 低 |
| `src/components/ReadingProgress.tsx` | R6：阅读进度条（Modal body 顶部） | 中 |
| `src/components/BackToTop.tsx` | R6：回到顶部按钮 | 低 |
| `src/components/TableOfContents.tsx` | R6：可折叠 TOC（从 HTML 解析 H2/H3） | 中 |
| `src/hooks/useReadProgress.ts` | R8：localStorage 读写已读篇目 | 低 |
| `src/hooks/useLocalBookmark.ts` | R8：localStorage 读写收藏 | 低 |
| `src/components/SearchBar.tsx` | R7：全局搜索组件 | 中 |
| `src/utils/extractTOC.ts` | R6：从 HTML 提取 H2/H3 生成 TOC 数据 | 低 |
| `vite.config.ts`（修改） | R14：manualChunks + 动态 import | 中 |

### 2.2 修改文件

| 文件路径 | 改动内容 | 工作量 |
|----------|----------|--------|
| `src/data/ditiansui-site.ts` | R1：按篇目拆分独立 .ts 文件 | 高 |
| `src/data/index.ts` | R1：更新导出，支持动态 import | 低 |
| `scripts/generate.js` | R1 + R11：生成多文件输出 + 字数校验 | 中 |
| `src/styles/index.css` | R2 + R5：新增工具类 + 响应式断点 | 中 |
| `src/pages/Landing.tsx` | R2：inline style → CSS 类；GSAP → CSS | 中 |
| `src/pages/BookApp.tsx` | R2 + R3：移除 inline style；用 ContentModal | 中 |
| `src/components/ReadList.tsx` | R2：inline style → CSS 类 + 响应式 | 低 |
| `src/components/SkillGrid.tsx` | R2：inline style → CSS 类 + 响应式 | 低 |
| `src/main.tsx` | R3：删除 InterpModal/SkillModal 死代码 import | 低 |
| `src/components/InterpModal.tsx` | R3：删除（由 ContentModal 替代） | 低 |
| `src/components/SkillModal.tsx` | R3：删除（由 ContentModal 替代） | 低 |
| `package.json` | R13：添加 Vitest + Playwright 依赖 | 低 |
| `vite.config.ts` | R14：manualChunks 配置 | 中 |

### 2.3 删除文件

| 文件路径 | 原因 |
|----------|------|
| `src/components/InterpModal.tsx` | R3：死代码，由 ContentModal 统一替代 |
| `src/components/SkillModal.tsx` | R3：死代码，由 ContentModal 统一替代 |
| `books/ditiansui-site/scripts/mingli.sh` | R4：Windows 不兼容 |

---

## 三、任务执行方案（按依赖顺序）

### P0 阶段（优先级最高，安全先行）

#### R13 · 测试体系（最先执行，无依赖）

**目标**：为后续所有重构提供安全网。

**文件改动**：
- `package.json`：添加 Vitest + Playwright
  ```json
  "devDependencies": {
    "vitest": "^2.0.0",
    "@vitest/ui": "^2.0.0",
    "@playwright/test": "^1.48.0",
    "vitestCoverage": "^2.0.0"
  }
  ```
- `vite.config.ts`：添加 `test` 配置（Vitest 使用 Vite 统一配置）
- `tests/generate.test.ts`：测试 `generate.js` 核心逻辑
  - 解析 catalog.md 行
  - 生成 `books.ts` 引用完整性
  - 数据文件存在性检查
- `tests/ditiansui-site-refs.test.ts`：数据文件引用完整性检查
  - `ditiansui-site/interp/*.ts` 每个 key 对应文件存在
  - `ditiansui-site/skill/*.ts` 每个 key 对应文件存在
- `tests/e2e/basic.spec.ts`：Playwright E2E
  - 首页加载
  - 点击典籍卡片跳转到 `/ditiansui-site`
  - 点击"查看解读"打开 Modal
  - 关闭 Modal
  - 切换到技能库 Tab
  - 点击技能卡打开 Modal
- `tests/e2e/visual-regression.spec.ts`：视觉回归测试（基线截图存于 `tests/screenshots/baseline/`，CI 比对 diff）

**风险**：无。
**回滚**：删除测试文件 + package.json 还原。

---

#### R1 · 拆分 ditiansui-site.ts（依赖 R13）

**核心目标**：单文件 token 从 35980 降至 <2000。

**步骤 1：修改 `generate.js`（两阶段执行）**

**阶段 1a（新增多文件输出，保留兼容层）**：
generate.js 增加 `--multi` 参数，输出到 `src/data/ditiansui-site/` 目录，同时**保留原 `src/data/ditiansui-site.ts` 作为 compat layer**，指向目录的代理文件：
```typescript
// src/data/ditiansui-site.ts（兼容层，R1完成前保留）
export { interpContent, skillContent } from './ditiansui-site/interp';
export type { InterpKey, SkillKey } from './ditiansui-site/index';
```

**阶段 1b（切换消费者指向，移除兼容层）**：
R1 消费者切换完成、测试通过后，删除 compat layer 文件，generate.js 去除双写逻辑。

**容错设计**：
- 源文件缺失时跳过并输出警告，不中断构建
- 增量更新：已有文件对比内容，只在内容变化时写入（减少 git diff 噪音）
- 回滚：保留 compat layer 期间，旧 consumer 仍可正常编译
```
src/data/ditiansui-site/
  interp/
    tiandao.ts
    kundao.ts
    rendao.ts
    zhiming.ts
    liqi.ts
    peihe.ts
    tiangan.ts
    dizhi.ts
    bage.ts
  skill/
    tiandao.ts
    kundao.ts
    rendao.ts
    zhiming.ts
    liqi.ts
    peihe.ts
    tiangan.ts
    dizhi.ts
    bage.ts
    bazi-research-dispute-exec.ts
  index.ts
```

每个 `.ts` 文件格式：
```typescript
// Auto-generated — do not edit manually
export const content = `<p>HTML字符串...</p>`;
export const chapterName = '天道';  // 篇名，用于 TOC
export const tags: string[] = ['核心', '阴阳'];  // 可选标签
```

`index.ts` 使用命名导出 + 字面量联合类型（解决消费者类型约束问题）：
```typescript
export * as interp from './interp';
export * as skill from './skill';

// 显式字面量联合类型，供消费者类型约束使用
export type InterpKey = '天道' | '坤道' | '人道' | '知命' | '理气' | '配合' | '天干' | '地支' | '八格';
export type SkillKey = 'tiandao' | 'kundao' | 'rendao' | 'zhiming' | 'liqi' | 'peihe' | 'tiangan' | 'dizhi' | 'bage' | 'bazi-research-dispute-exec';
export const interpKeys = ['天道', '坤道', '人道', '知命', '理气', '配合', '天干', '地支', '八格'] as const;
export const skillKeys = ['tiandao', 'kundao', 'rendao', 'zhiming', 'liqi', 'peihe', 'tiangan', 'dizhi', 'bage', 'bazi-research-dispute-exec'] as const;
```

> **类型同步保证**：generate.js 在生成每个 interp/skill 文件时，同步更新 `index.ts` 的 key 列表，确保 key 集合与实际文件一致。BookApp.tsx 使用 `InterpKey` 类型约束 `interpContent[key]`，消除 `any`。

**步骤 2：更新 consumers**

- `src/pages/BookApp.tsx`：从 `ditiansui-site` 直接 import 改为动态 import
  ```typescript
  // 原来：import { interpContent, skillContent } from '../data/ditiansui-site';
  // 改为：const [data, setData] = useState<{ interp: Record<string,string>, skill: Record<string,string> }>();
  // Modal 打开时：React.lazy(() => import('../data/ditiansui-site/interp').then(m => ({ default: () => <div dangerouslySetInnerHTML... /> })))
  ```

- `src/components/index.ts`：更新导出

**验收标准**：
- `src/data/ditiansui-site.ts` 不存在，被 `src/data/ditiansui-site/` 目录替代
- 每个 interp/skill 文件 <2000 tokens
- Vitest `ditiansui-site-refs.test.ts` 通过

**风险**：改动面大，影响所有消费者。**对策**：R13 测试先通过再执行此步。

---

#### R2 · 统一样式管理（无依赖，可与 R1-R4 并行执行）

> **依赖调整**：R2 涉及的 Landing/ReadList/SkillGrid 组件不依赖 `ditiansui-site.ts` 内部结构，只消费 `books.ts` 元数据，故 R2 可独立执行，不等待 R1。

**目标**：移除所有 inline style，GSAP 动画移至 CSS。

**CSS 新增类（`index.css`）**：
```css
/* Landing 页面 */
.hero-section { min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding-top: 80px; padding-bottom: 64px; padding-left: 16px; padding-right: 16px; }
.hero-title { display: flex; align-items: center; justify-content: center; gap: 48px; margin-bottom: 64px; }
.stat-item { text-align: center; }
.stat-num { font-size: 28px; color: var(--color-gold); font-weight: bold; }
.stat-label { font-size: 12px; color: var(--color-text-dim); margin-top: 4px; }
.book-grid { width: 100%; max-width: 900px; display: grid; gap: 20px; }
.hero-stats { display: flex; gap: 48px; margin-bottom: 64px; }
.progress-bar { height: 6px; border-radius: 3px; overflow: hidden; background: var(--color-border-card); }
.progress-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, var(--color-purple), var(--color-gold)); transition: width 0.5s; }

/* 通用 */
.text-gold { color: var(--color-gold); }
.text-dim { color: var(--color-text-dim); }
.text-muted { color: var(--color-text-muted); }
.text-blue { color: var(--color-blue); }
.text-green { color: var(--color-green); }
```

**GSAP 迁移**：
- `Landing.tsx` GSAP 动画 → CSS `.animate-fade-up`（已在 index.css 定义）
- `BookApp.tsx` GSAP Modal 动画 → CSS `.animate-scale-up` + `.animate-fade-in`

**改动清单**：

| 文件 | 改动 |
|------|------|
| `Landing.tsx` | 移除 `import gsap`；删除所有 inline style，替换为 CSS 类；`onMouseEnter/Leave` 替换为 CSS hover 伪类 |
| `BookApp.tsx` | 移除 GSAP modal 动画，改为 CSS class toggle；inline style → CSS 类 |
| `ReadList.tsx` | inline style → CSS 类（`.chapter-row` 已存在可直接用） |
| `SkillGrid.tsx` | inline style → CSS 类（`.skill-card` 已存在） |
| `index.css` | 新增缺失的间距/颜色工具类 |

**验收标准**：
- 搜索所有 `.tsx` 文件无 `style={{` 字符串（除 `<p style="color:#8080a0;text-align:center;padding:40px 0">` 等 fallback 场景）
- GSAP 仅保留在需要复杂交互的地方（如拖拽排序，未来可选）

**风险**：视觉还原度。**对策**：迁移前截图对比，按组件逐个迁移。

---

#### R3 · 修复组件架构（依赖 R1 接口协议，可与 R2 并行）

> **依赖调整**：R3 依赖 R1 定义的内容接口协议（`Record<string, string>`），而非具体实现。故 R3 可在 R1 目录结构就绪后独立推进，与 R2 并行。

**目标**：消除死代码，统一 Modal 抽象。

**步骤 1：删除死代码**

`main.tsx` 第 7-10 行副作用 import 删除：
```typescript
// 删除这 4 行：
import './components/ReadList';
import './components/SkillGrid';
import './components/InterpModal';
import './components/SkillModal';
```

**步骤 2：创建 ContentModal.tsx**

将 `BookApp.tsx` 中内嵌的 Modal JSX 抽取为独立组件：
```typescript
interface ContentModalProps {
  type: 'interp' | 'skill';
  title: string;
  content: string;  // HTML string
  onClose: () => void;
}

const ContentModal: React.FC<ContentModalProps> = ({ type, title, content, onClose }) => {
  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card animate-scale-up">
        <div className="modal-header">
          <span className="text-gold" style={{ fontWeight: 'bold', letterSpacing: 1 }}>{title}</span>
          <button onClick={onClose} className="modal-close-btn">×</button>
        </div>
        <div className="modal-body">
          <div className={type === 'interp' ? 'prose-interp' : 'prose-skill'}
               dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>
    </div>
  );
};
```

**步骤 3：BookApp.tsx 简化**

```typescript
// 原来 135 行，简化后约 80 行
const openModal = (type, key) => { setModalType(type); setModalKey(key); };
const closeModal = () => { setModalType(null); setModalKey(''); };

// Modal body 内容通过动态 import 获取（R1 已实现）
```

**验收标准**：
- `src/components/` 中无 InterpModal.tsx 和 SkillModal.tsx
- `main.tsx` 不含副作用 component import
- BookApp.tsx 使用 ContentModal 组件

---

#### R4 · Windows 兼容修复（无依赖）

**目标**：`mingli.sh` → `mingli.js`。

**操作**：将 `books/ditiansui-site/scripts/mingli.sh` 改写为 `mingli.js`：
```javascript
#!/usr/bin/env node
// 与 mingli.sh 功能完全一致，纯 Node.js 重写
import { readFileSync, writeFileSync, existsSync } from 'fs';
// ... 保留原有逻辑
```

`package.json` 已有 `"type": "module"` + `"engines": { "node": ">=18" }`（无需修改）。

**验收标准**：在 Windows PowerShell 下 `node books/ditiansui-site/scripts/mingli.js` 正常运行。

---

#### R5 · 响应式布局（无依赖，可与 R1-R4 并行）

**目标**：320px-1440px 全断点可用。

**CSS 断点（`index.css`）**：
```css
@media (max-width: 700px) {
  .modal-card { max-height: 92vh; }
  .hero-stats { gap: 20px; }
  .stat-num { font-size: 22px; }
  .skill-grid { grid-template-columns: 1fr !important; }
  .book-grid { grid-template-columns: 1fr; }
  .chapter-row { flex-wrap: wrap; }
  .chapter-row .read-btn { margin-left: 0; margin-top: 4px; width: 100%; }
  .hero-stats { flex-wrap: wrap; justify-content: center; }
  .tab-bar { flex-wrap: wrap; }
  .book-hero-stats { flex-wrap: wrap; gap: 16px !important; }
}
@media (max-width: 480px) {
  .modal-backdrop { padding: 8px; }
  .modal-card { border-radius: 8px; }
  .modal-header { padding: 12px 14px; }
  .modal-body { padding: 14px; }
}
```

**改动清单**：

| 组件 | 改动 |
|------|------|
| Landing.tsx | book-card 网格在移动端改为单列 |
| BookApp.tsx | Modal 全屏化，顶部添加简化导航 |
| ReadList.tsx | 列表项在移动端堆叠布局 |
| SkillGrid.tsx | 卡片网格在移动端改为 1 列 |

**验收标准**：Chrome DevTools 模拟 iPhone SE (375px) 打开 `/ditiansui-site`，无非预期横向溢出。

---

### P1 阶段

#### R6 · 阅读辅助功能（依赖 R5，可与 R1-R4 并行）

**目标**：TOC + 锚点 + 回到顶部 + 阅读进度条。

**组件 1：`ReadingProgress.tsx`**
```typescript
const ReadingProgress: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => setProgress((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100);
    el.addEventListener('scroll', handler);
    return () => el.removeEventListener('scroll', handler);
  }, []);
  
  return <div className="reading-progress-bar" style={{ width: `${progress}%` }} />;
};
```

**组件 2：`BackToTop.tsx`**（已修正：监听 modal-body 滚动而非 window）
```typescript
const BackToTop: React.FC<{ scrollRef: React.RefObject<HTMLDivElement> }> = ({ scrollRef }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => setVisible(el.scrollTop > 300);
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, [scrollRef]);
  return visible
    ? <button className="back-to-top-btn" onClick={() => el?.scrollTo({ top: 0, behavior: 'smooth' })}>↑</button>
    : null;
};
```

**BookApp.tsx 传入 scrollRef**：
```typescript
const bodyRef = useRef<HTMLDivElement>(null);
// <ContentModal scrollRef={bodyRef} ... />
// <ReadingProgress scrollRef={bodyRef} />
// <BackToTop scrollRef={bodyRef} />
```

**组件 3：`TableOfContents.tsx`**
```typescript
// 使用 extractTOC() 解析 HTML 中的 H2/H3，生成锚点列表
// 支持折叠，侧边栏显示
```

**工具函数 `extractTOC.ts`**：
```typescript
export function extractTOC(html: string): { id: string; text: string; level: number }[] {
  // 从 HTML 字符串中提取 h2/h3，生成 slugified id
  // 用于 TOC 导航
}
```

**BookApp.tsx 集成**：
- Modal body 外层包裹 `ReadingProgress` + `BackToTop`
- 右侧添加可折叠 `TableOfContents`（R6 完成后的下一迭代）

---

#### R7 · 全局搜索（无依赖）

**方案**：基于已加载数据的客户端搜索（避免引入 Pagefind 复杂度）。

**实现**：
- `SearchBar.tsx`：顶部固定搜索框，`input` 时实时过滤
- 数据来源：Books 元数据（标题/篇名）已在内存，无需额外请求
- 按书名/篇名/技能名模糊匹配，结果展示卡片
- 键盘快捷键 `/` 唤起搜索

**验收标准**：搜索 "天道"，0.1s 内返回"滴天髓 > 天道篇解读 + 技能"。

---

#### R8 · 阅读进度与收藏（无依赖，可与 R6 并行）

> **依赖修正**：R8 仅操作 `localStorage['readProgress']` / `localStorage['bookmarks']`，与 TOC/BackToTop/ReadingProgress 完全解耦，可在 R1-R5 后与 R7 并行执行。

**实现**：
- `useReadProgress.ts`：hook，管理 `localStorage['readProgress']`
  ```typescript
  // 格式：{ 'ditiansui-site': ['天道', '坤道', ...] }
  ```
- `useLocalBookmark.ts`：hook，管理 `localStorage['bookmarks']`
  ```typescript
  // 格式：{ 'ditiansui-site': ['天道', ...] }
  ```

**BookApp.tsx 集成**：Modal 关闭时自动标记已读。

---

### P2 阶段（R9-R11 内容工作，略）

---

### P3 阶段

#### R12 · TypeScript 严格化

- `tsconfig.json`：`strict: true`（已启用）
- 新增代码零 `any`
- 存量 `any` 逐个消除（低优先级）

#### R14 · 构建优化

**`vite.config.ts` 改动**（R2 完全移除 GSAP 后，R14 不再配置 gsap chunk）：
```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        'vendor-marked': ['marked'],
      },
    },
  },
},
```

> **GSAP 完全移除说明**：R2 将所有 GSAP 动画迁移至 CSS @keyframes，`gsap` 包在 `package.json` 中标记为废弃并在后续清理。R14 的 `manualChunks` 不再包含 `gsap`，避免 tree-shaking 后配置形同虚设。若未来需要复杂交互动画（如拖拽），可重新引入并单独 chunk。

**`BookApp.tsx`**：Modal 内容使用 `React.lazy` 动态加载。

**验收标准**：首屏 bundle <200KB（gzip）。

#### R15 · SEO

- 安装 `react-helmet-async`
- 每个页面 `<title>` 动态：`《{book.title}》- 命理学术中心`
- sitemap.xml 生成脚本（可整合到 `postbuild.js`）

---

## 四、重构方案评分

| 维度 | 分项 | 满分 | 得分 | 说明 |
|------|------|------|------|------|
| **完整性** | 覆盖所有 P0-P1-P3 任务 | 25 | 22 | R13-R15 全部覆盖，内容相关 R9-R11 略过（属于内容工作非代码重构） |
| **执行安全性** | R13 测试先行 + 分阶段执行 | 25 | 23 | 测试体系作为安全网，分阶段隔离风险 |
| **依赖关系** | 清晰的依赖拓扑，R1-R3 解耦良好 | 20 | 18 | R1 改动面大，有一定耦合风险 |
| **风险控制** | 每步有回滚方案 + 验证标准 | 20 | 17 | GSAP 迁移和样式切换存在视觉退化风险 |
| **可维护性** | 增量输出规范，模块边界清晰 | 10 | 9 | generate.js 改动后需同步文档 |

**总分：89 / 100**

评分说明：
- -3：R1 改动面大，单点风险集中（`ditiansui-site.ts` → 目录拆分影响所有消费者）
- -2：样式迁移存在视觉还原风险，缺乏截图自动化对比
- -1：R7 搜索方案简陋（纯客户端 vs Pagefind），长期可能需重构

---

## 五、风险点与回滚方案汇总

| 任务 | 风险 | 影响 | 回滚方案 |
|------|------|------|----------|
| R13 测试体系 | 测试覆盖不足，重构仍破坏功能 | 高 | 增加 Playwright E2E 覆盖用例 |
| R1 拆分数据文件 | 消费者引用断裂，编译失败 | 高 | 保留 `ditiansui-site.ts` 作为代理入口（compat layer），逐步迁移 |
| R2 GSAP 移除 | Modal 动画效果退化 | 中 | 保留 GSAP 用于复杂交互场景，迁移简单 fade/scale |
| R3 删除 InterpModal | 第三方 import 断裂 | 低 | 使用 `export * from './InterpModal'` 代理 |
| R4 Windows 兼容 | 新脚本在 bash 环境下行为差异 | 低 | 保留 sh 版本为备份，js 为 primary |
| R5 响应式 | 移动端布局意外溢出 | 中 | 保留 min-width 限制，超出时有基本可读性 |

---

## 六、执行里程碑

```
Week 1-2:   R13 测试体系（Vitest + Playwright）
            └─ 产出：tests/ 目录，CI 集成
Week 3-4:   R1 数据拆分（R1 是所有重构的前提）
            └─ 产出：src/data/ditiansui-site/interp/ + skill/
            └─ 验证：测试通过，单文件 <2000 tokens
Week 5-6:   R2 统一样式 + R3 组件架构（可并行）
            └─ 产出：所有 inline style 移除，ContentModal.tsx
Week 7-8:   R4 Windows 兼容 + R5 响应式（可并行）
            └─ 产出：mingli.js + 移动端可用
Week 9-10:  R6 阅读辅助 + R7 全局搜索
            └─ 产出：TOC/回到顶部/进度条/搜索
Week 11-12: R8 进度与收藏 + R14 构建优化
            └─ 产出：localStorage 持久化 + 首屏优化
Week 13+:   R12/R15 收尾 + 内容扩展（R9-R11）
```

---

## 七、关键技术决策备忘

1. **为什么 generate.js 要改？** 当前输出单文件，需改为多文件输出目录结构，同时保留原 `books.ts` 作为元数据（不变）。
2. **为什么 R1 先于 R2？** R2 的 Landing/BookApp 重构需要稳定的模块边界；R1 拆分后组件改为动态 import 是自然过渡。
3. **ContentModal vs InterpModal/SkillModal？** 三者功能完全一致（只是内容 class 不同），合并为一个组件是合理的 DRY 改进。
4. **为什么不直接用 Tailwind？** 项目已是 Tailwind CSS 4，但组件中大量使用 inline style 绕过了 CSS 类系统。R2 主要是将已有的 CSS 类利用起来，不需要新写太多类。
5. **为什么不引入状态管理库？** 当前数据量极小（books.ts 元数据 + 按需加载的内容），React Context 足够，无需引入 Zustand/Redux。