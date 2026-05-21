# coding-compliance 优雅规则增强实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 扩展 coding-compliance 技能，新增 13 个规则模块（§9-§21），支持模块化 CLI、CI 模式、ES 环境检测、规则例外机制。

**Architecture:** 以 `RULES/common.md` 为核心，新增规则分组清晰存放。CLI 参数解析由 SKILL.md 入口控制，ES 版本检测读取 `tsconfig.json`，CI 输出支持 JSON/SARIF 格式。

**Tech Stack:** Claude Code Skill 系统、TypeScript、Node.js（CLI 模式）

---

## File Structure

```
~/.claude/skills/coding-compliance/
├── SKILL.md                    # 修改：CLI 参数解析 + 模块化触发 + CI 模式
├── RULES/
│   ├── common.md               # 修改：新增 §9-§21 全部规则
│   ├── frontend.md             # 保持
│   ├── react.md                # 保持
│   ├── vue.md                  # 保持
│   ├── styles.md               # 保持
│   └── backend.md              # 保持
├── CI.md                       # 新建：CI 集成配置与 GitHub Actions 示例
├── EXCEPTIONS.md               # 新建：例外机制说明与注释格式
└── PERFORMANCE.md              # 新建：性能监控检测项
```

---

## Task 1: 更新 SKILL.md

**Files:**

- Modify: `~/.claude/skills/coding-compliance/SKILL.md`

- [ ] **Step 1: 添加 CLI 参数解析章节**

在 SKILL.md 的 `## Execution Flow` 后新增：

```markdown
## CLI Parameters

### Module Flags

| Flag         | 覆盖范围                     |
| ------------ | ---------------------------- |
| `--common`   | 仅通用层（§1-§8 + §9-§21）   |
| `--frontend` | 通用层 + 前端通用            |
| `--react`    | 通用层 + React 专项 + 样式层 |
| `--vue`      | 通用层 + Vue 专项 + 样式层   |
| `--styles`   | 仅样式层                     |
| `--backend`  | 通用层 + 后端专项            |
| `--elegant`  | 仅 §9-§21 优雅规则           |
| `--all`      | 全量（含优雅规则）           |
| 无标志       | 全量（默认）                 |

### Filter Flags

| Flag              | 说明                                                |
| ----------------- | --------------------------------------------------- |
| `--files <path>`  | 指定文件/目录检查                                   |
| `--rules <codes>` | 指定规则编号（逗号分隔），如 `--rules F-1,F-5,TM-1` |
| `--level <level>` | 过滤级别：`error` / `warning` / `suggestion`        |

### CI Mode

| Flag                | 行为                                                |
| ------------------- | --------------------------------------------------- |
| `--ci`              | CI 模式：无交互，检测到问题直接退出非零             |
| `--output <format>` | 输出格式：`json` / `sarif` / `junit`（默认 `json`） |
| `CI=true`           | 环境变量等效于 `--ci`                               |

### Exit Codes

| Code | 含义                          |
| ---- | ----------------------------- |
| 0    | 通过（无 Warning + 无 Error） |
| 1    | 有 Warning（不阻塞，但记录）  |
| 2    | 有 Error（阻塞性）            |
```

- [ ] **Step 2: 更新执行流程，添加模块化执行逻辑**

在 `## Execution Flow` 的步骤 2 中新增：

```markdown
### 2. CLI 参数解析

1. 解析模块标志，确定规则范围
2. 解析过滤参数，确定检查目标
3. 检查 CI 环境变量 / `--ci` 标志
4. 加载对应规则模块
5. 若有 ES 版本要求，读取 `tsconfig.json` 检测环境支持

### 3. ES 环境检测

1. 读取项目 `tsconfig.json`
2. 提取 `compilerOptions.target` 和 `lib`
3. 每条优雅规则标注最低 ES 版本要求
4. 若规则要求 > 当前支持 → 标记 ⚠️[需确认]
5. 用户选择：保持现状 / 升级 target
```

- [ ] **Step 3: 更新例外机制章节**

在 `## Rationalization Blockers` 后新增：

````markdown
## Exception Mechanism

### 注释格式

```tsx
// @compliance-disable F-1           // 单条规则禁用
// @compliance-disable F-1, TM-1   // 多条规则禁用
/* @compliance-disable-all */ // 文件级禁用所有规则
// @compliance-disable F-1 原因：历史代码暂不重构，计划 Q3 重构
```
````

### CI 模式例外

- 例外注释在 CI 模式下也生效，但报告中标注 `[例外]`
- 格式：`// @compliance-disable <rule> // <原因>`

````

- [ ] **Step 4: 更新 Problem Levels**

```markdown
## Problem Levels

| Level | Icon | 行为 | CI 退出码 |
|-------|------|------|-----------|
| Error | ❌ | 阻塞性，必须修复 | 2 |
| Warning | ⚠️ | 建议修复，不阻塞 | 1 |
| Suggestion | 💡 | 改进提示 | 0 |
````

- [ ] **Step 5: Commit**

```bash
git add ~/.claude/skills/coding-compliance/SKILL.md
git commit -m "feat(coding-compliance): add CLI params, module flags, CI mode"
```

---

## Task 2: 新增规则到 RULES/common.md

**Files:**

- Modify: `~/.claude/skills/coding-compliance/RULES/common.md`

- [ ] **Step 1: 添加 §9 优雅编程（代码风格偏好）**

在 `## 8. 修复安全约束` 后新增：

````markdown
## 9. 优雅编程（代码风格偏好）

> 级别：Warning

### F-1 重复 JSX 抽为配置数组

**检测：** 两个以上结构相同的 JSX 块（相同 className + 子元素模式）
**修复：** 提取为配置数组，用 `.map()` 渲染
**示例：**

```tsx
// 反模式
{
  modelType === 'interp' && <div className="related-tags">...</div>
}
{
  modelType === 'skill' && <div className="related-tags">...</div>
}

// 优雅
{
  ;[
    { key: 'interp', data: interpToSkill[modalKey], label: '关联技能' },
    { key: 'skill', data: skillToInterp[modalKey], label: '相关篇目' },
  ]
    .filter(({ data }) => data?.length)
    .map(({ key, data, label }) => (
      <div key={key} className="related-tags">
        <span className="related-label">{label}</span>
        {(data as string[]).map(sk => (
          <button key={sk} onClick={() => onNavigate(key, sk)}>
            ...
          </button>
        ))}
      </div>
    ))
}
```
````

### F-2 冗余 if 改可选链/空值合并

**检测：** `x !== null && x !== undefined` / `if (!x) x = default`
**修复：** 改用 `??` / `?.` / `??=`
**ES 版本：** ES2020

### F-3 简单条件用三元/switch

**检测：** `if (a) return b; else return c;`
**修复：** `return a ? b : c;`
**补充：** 超过 3 个分支用 switch 替代 if-elseif

### F-4 函数式组件用箭头函数

**检测：** `function Foo() {}`
**修复：** `const Foo = () => {}`（React 组件优先箭头函数）

### F-5 循环改 Array 方法

**检测：** `for (let i=0; i<n; i++)` / `forEach`
**修复：** `map` / `filter` / `reduce` / `some` / `every`
**ES 版本：** ES2015

### F-6 对象解构 + 重命名

**检测：** `const a = obj.a; const b = obj.b;`
**修复：** `const { a, b } = obj;` / `const { a: b, c: d } = obj;`

### F-7 复杂条件抽为 useMemo/变量

**检测：** 内联复杂布尔表达式超过 3 个 `&&` / `||`
**修复：** 提取为命名常量或 `useMemo`

---

## Task 3: 新增 §10 ES 新特性

- [ ] **Step 1: 添加 ES 新特性规则**

```markdown
## 10. ES 新特性

> 级别：Warning
> ES 环境检测：每条规则标注最低版本，检测 tsconfig target

| 规则 | 描述                         | 最低 ES | 检测模式                          |
| ---- | ---------------------------- | ------- | --------------------------------- |
| N-1  | 可选链 `?.`                  | ES2020  | `obj && obj.prop` / `obj == null` |
| N-2  | 空值合并 `??`                | ES2020  | `x === null ? default : x`        |
| N-3  | 逻辑赋值 `??=` / `&&=`       | ES2020  | `if (x === null) x = y`           |
| N-4  | Object.hasOwn()              | ES2022  | `obj.hasOwnProperty(k)`           |
| N-5  | Array.at(-1)                 | ES2022  | `arr[arr.length-1]`               |
| N-6  | String.replaceAll()          | ES2021  | `str.replace(/x/g,'y')`           |
| N-7  | 链式可选调用 `?.[]` / `?.()` | ES2020  | 深度属性安全访问                  |
| N-8  | for-of 遍历                  | ES2015  | `for (let i=0;...)` 数组遍历      |
| N-9  | Array.flat / flatMap         | ES2019  | 嵌套数组展平                      |
| N-10 | Promise.allSettled           | ES2021  | 部分失败的异步处理                |
| N-11 | top-level await              | ES2022  | 模块顶层异步                      |
| N-12 | BigInt                       | ES2020  | 大数运算                          |
| N-13 | import.meta                  | ES2020  | 浏览器端环境变量                  |
| N-14 | 数字分隔符                   | ES2021  | `1000000` → `1_000_000`           |

### ES 版本检测流程

1. 读取 `tsconfig.json` 的 `compilerOptions.target`
2. 映射到 ES 年份（如 `ES2020`）
3. 规则要求 > 当前支持 → 标记 ⚠️[需确认]
4. 用户选择：保持现状 / 升级 target（展示 diff）
```

- [ ] **Step 2: Commit**

```bash
git add ~/.claude/skills/coding-compliance/RULES/common.md
git commit -m "feat: add §9 elegant programming and §10 ES new features"
```

---

## Task 4: 新增 §11 设计模式

**Files:**

- Modify: `~/.claude/skills/coding-compliance/RULES/common.md`

- [ ] **Step 1: 添加设计模式规则**

````markdown
## 11. 设计模式

> 级别：Warning（结构变更，修复前必须告知用户）

| 规则 | 描述          | 检测点                             |
| ---- | ------------- | ---------------------------------- |
| DP-1 | Repository    | localStorage 散落 → 抽象数据访问层 |
| DP-2 | Observer      | 跨组件状态同步 → 事件驱动          |
| DP-3 | State Machine | 状态流转边界不清 → 明确状态与转换  |
| DP-4 | Composition   | 组件逻辑复用 → compound components |
| DP-5 | Command       | 操作可撤销/重做 → 历史记录         |
| DP-6 | Builder       | 复杂对象构建 → 链式调用            |
| DP-7 | Memento       | 状态快照 → 回滚机制                |

### DP-1 Repository 检测

```tsx
// 反模式：localStorage 散落
localStorage.setItem('key', JSON.stringify(data))
const raw = localStorage.getItem('key')

// 优雅：数据访问层抽象
// src/repositories/BookmarkRepository.ts
export const BookmarkRepository = {
  save: (slug: string, data: Map<string, string>) => {
    localStorage.setItem(`${BOOKMARK_KEY}_${slug}`, JSON.stringify(data))
  },
  load: (slug: string): Map<string, string> => {
    const raw = localStorage.getItem(`${BOOKMARK_KEY}_${slug}`)
    // ...
  },
}
```
````

### DP-3 State Machine 检测

```tsx
// 反模式：状态判断散落
if (chapter.isDone) {
  /* 在读 */
}
if (!chapter.isDone && hasAnnotations) {
  /* 已批注 */
}

// 优雅：明确状态定义
type ChapterState = 'unread' | 'reading' | 'annotated' | 'completed'
const getChapterState = (chapter: ChapterInfo): ChapterState => {
  if (chapter.isDone && hasAnnotations) return 'annotated'
  if (chapter.isDone) return 'completed'
  if (hasStartTime) return 'reading'
  return 'unread'
}
```

### 策略模式（DP-6 变体）

```tsx
// 反模式：if-else 超过 3 个
if (type === 'name') sortByName()
else if (type === 'section') sortBySection()
else if (type === 'progress') sortByProgress()

// 优雅：Map 驱动
const sortStrategies = {
  name: (a: Book, b: Book) => a.title.localeCompare(b.title),
  section: (a: Book, b: Book) => a.section.localeCompare(b.section),
  progress: (a: Book, b: Book) => a.done / a.total - b.done / b.total,
} as const
type SortType = keyof typeof sortStrategies
const handleSort = (type: SortType) => setBooks(prev => [...prev].sort(sortStrategies[type]))
```

````

- [ ] **Step 2: Commit**

```bash
git add ~/.claude/skills/coding-compliance/RULES/common.md
git commit -m "feat: add §11 design patterns"
````

---

## Task 5: 新增 §12-§17

**Files:**

- Modify: `~/.claude/skills/coding-compliance/RULES/common.md`

- [ ] **Step 1: 添加 §12 TypeScript 优雅**

```markdown
## 12. TypeScript 优雅

> 级别：Warning

| 规则 | 描述                  | 示例                                                                     |
| ---- | --------------------- | ------------------------------------------------------------------------ |
| T-1  | 联合类型替代多分支 if | `type A = 'a' \| 'b' \| 'c'`                                             |
| T-2  | 映射类型              | `Record<K,V>` / `Partial<T>` / `Required<T>`                             |
| T-3  | 条件类型              | `T extends U ? X : Y`                                                    |
| T-4  | infer 提取类型        | `type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never` |
| T-5  | 避免 as 类型断言      | `obj as string` → 精确类型                                               |
| T-6  | utility types 复用    | `Pick<T, K>` / `Omit<T, K>` / `Exclude<T, U>` / `Extract<T, U>`          |
```

- [ ] **Step 2: 添加 §13 React Hooks 规范**

```markdown
## 13. React Hooks 规范

> 级别：Warning

| 规则 | 描述                         | 检测点                                     |
| ---- | ---------------------------- | ------------------------------------------ |
| H-1  | 自定义 hooks 提取重复逻辑    | 两个以上组件使用相同状态逻辑               |
| H-2  | useCallback/useMemo 使用边界 | 过度优化（memo 包裹简单组件）              |
| H-3  | useEffect 依赖完整           | `[a, b]` 缺少依赖导致 stale                |
| H-4  | hooks 组合模式               | 一个组件组合多个 hooks                     |
| H-5  | 状态不可变更新               | `state.push()` → `setState([...state, x])` |
```

- [ ] **Step 3: 添加 §14 错误与边界处理**

```markdown
## 14. 错误与边界处理

> 级别：Warning

| 规则 | 描述                   | 检测点                         |
| ---- | ---------------------- | ------------------------------ |
| E-1  | try-catch 边界清晰     | catch 块为空或仅有 console.log |
| E-2  | fetch/async 有降级方案 | try 无 catch，API 失败无回退   |
| E-3  | 异常不泄露敏感信息     | error.message 含用户数据/堆栈  |
| E-4  | 降级 UI 有反馈         | 加载失败显示错误提示而非白屏   |
```

- [ ] **Step 4: 添加 §15 防御式编程**

```markdown
## 15. 防御式编程

> 级别：Warning

| 规则 | 描述                | 示例                              |
| ---- | ------------------- | --------------------------------- |
| DF-1 | 参数校验早期 return | `if (!input) return` 在函数开头   |
| DF-2 | 边界检查            | 数组索引访问前检查 `length > idx` |
| DF-3 | null 安全           | `obj?.prop?.method()`             |
| DF-4 | 外部输入校验        | 用户输入/接口返回数据的类型校验   |
```

- [ ] **Step 5: 添加 §16 DRY 检测**

```markdown
## 16. DRY 检测

> 级别：Warning

| 规则 | 描述           | 检测点                         |
| ---- | -------------- | ------------------------------ |
| D-1  | 跨文件重复逻辑 | 相同函数/常量出现 2+ 次        |
| D-2  | 相似组件合并   | 组件结构相似度 > 70%           |
| D-3  | 重复类型定义   | 相同 interface/type 出现 2+ 次 |
```

- [ ] **Step 6: 添加 §17 循环与性能**

````markdown
## 17. 循环与性能

> 级别：Warning

| 规则 | 描述                   | 示例                                          |
| ---- | ---------------------- | --------------------------------------------- |
| L-1  | while 能解决的不用递归 | 尾递归可替代 → 循环优先                       |
| L-2  | 循环不变式外提         | `arr.map(x => heavy(x, n))` → 提 `heavy` 引用 |
| L-3  | 避免 O(n²)             | 嵌套循环处理同一数组                          |

### 检测：递归 vs while

```tsx
// 反模式
function sum(n) {
  if (n <= 0) return 0
  return n + sum(n - 1)
}

// 优雅：while 或尾递归
function sum(n) {
  let total = 0
  while (n > 0) {
    total += n
    n--
  }
  return total
}
```
````

````

- [ ] **Step 7: Commit**

```bash
git add ~/.claude/skills/coding-compliance/RULES/common.md
git commit -m "feat: add §12-§17 TS, hooks, error, defensive, DRY, loop rules"
````

---

## Task 6: 新增 §18-§21

**Files:**

- Modify: `~/.claude/skills/coding-compliance/RULES/common.md`

- [ ] **Step 1: 添加 §18 定时器规范**

````markdown
## 18. 定时器规范

> 级别：Warning

| 规则 | 描述                         | 检测点                                                 |
| ---- | ---------------------------- | ------------------------------------------------------ |
| TM-1 | setTimeout/interval 及时清理 | useEffect 无 cleanup                                   |
| TM-2 | 滚动事件高频节流             | `scroll` / `resize` / `mousemove` 无 debounce/throttle |

### TM-1 检测

```tsx
// 反模式
useEffect(() => {
  const timer = setInterval(() => fetch(), 5000)
  // 缺少 return cleanup
}, [])

// 优雅
useEffect(() => {
  const timer = setInterval(() => fetch(), 5000)
  return () => clearInterval(timer)
}, [])
```
````

### TM-2 检测

```tsx
// 反模式
window.addEventListener('scroll', onScroll)

// 优雅：节流
const onScrollThrottled = useCallback(throttle(onScroll, 100), [])
useEffect(() => {
  window.addEventListener('scroll', onScrollThrottled, { passive: true })
  return () => window.removeEventListener('scroll', onScrollThrottled)
}, [onScrollThrottled])
```

````

- [ ] **Step 2: 添加 §19 浏览器新特性**

```markdown
## 19. 浏览器新特性

> 级别：Warning

| 规则 | 描述 | 适用场景 |
|------|------|---------|
| B-1 | RequestAnimationFrame | 动画/滚动优化（替代 setInterval） |
| B-2 | RequestIdleCallback | 空闲时后台任务（低优先级工作） |
| B-3 | MutationObserver | DOM 变化监听（替代 Mutation Events） |
| B-4 | IntersectionObserver | 懒加载/曝光统计（替代 scroll 监听） |

### 检测点
```tsx
// 反模式：scroll 监听用于懒加载
window.addEventListener('scroll', () => {
  if (el.getBoundingClientRect().top < window.innerHeight) load()
})

// 优雅：IntersectionObserver
const observer = new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting) { load(); observer.disconnect() }
}, { threshold: 0.1 })
observer.observe(el)
````

````

- [ ] **Step 3: 添加 §20 移动端兼容性**

```markdown
## 20. 移动端兼容性

> 级别：Warning

| 规则 | 描述 | 检测点 |
|------|------|--------|
| MB-1 | iOS Safari 差异 | 安全区域/橡皮筋滚动/输入框/position:fixed |
| MB-2 | Android 兼容性 | WebView 版本/CSS 支持度差异 |
| MB-3 | 安全区域适配 | env(safe-area-inset-*) / 异形屏 |
| MB-4 | 触控优化 | touch-action / Passive events / 点击延迟 |

### iOS Safari 检测
```tsx
// 反模式：fixed 定位在 iOS 输入框场景
position: fixed
bottom: 0

// 优雅：安全区域
padding-bottom: env(safe-area-inset-bottom)
position: fixed
bottom: 0
````

### 触控 Passive Events

```tsx
// 反模式
element.addEventListener('touchstart', handler) // 阻止 Passive 检查

// 优雅
element.addEventListener('touchstart', handler, { passive: true })
```

````

- [ ] **Step 4: 添加 §21 代码结构**

```markdown
## 21. 代码结构

> 级别：Warning

| 规则 | 描述 | 检测点 |
|------|------|--------|
| CS-1 | 空状态提前 return | `if (!data) return null` 减少嵌套 |
| CS-2 | 条件分支嵌套 ≤3 层 | 超过 3 层嵌套建议拆分函数 |
| CS-3 | 魔法数字/字符串常量外置 | `0.3` / `'interp'` → `const SCROLL_OFFSET = 0.3` |
| CS-4 | 函数 ≤30 行 | 超过 30 行建议拆分 |
| CS-5 | Import 排序 | 外部依赖/内部模块/类型导入分组 |
````

- [ ] **Step 5: Commit**

```bash
git add ~/.claude/skills/coding-compliance/RULES/common.md
git commit -m "feat: add §18-§21 timer, browser, mobile, structure rules"
```

---

## Task 7: 新建 CI.md

**Files:**

- Create: `~/.claude/skills/coding-compliance/CI.md`

- [ ] **Step 1: 编写 CI 集成文档**

````markdown
# CI 集成

## GitHub Actions 示例

```yaml
name: Code Compliance Check

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  compliance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run compliance check
        run: |
          npx --yes @claude/code check /coding-compliance --ci --output sarif --files .

      - name: Upload SARIF results
        if: always()
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: compliance-results.sarif

      - name: Fail on errors
        if: steps.compliance.outputs.exit-code == '2'
        run: exit 1
```
````

## CI 模式行为

| 行为     | 说明                                           |
| -------- | ---------------------------------------------- |
| 触发方式 | `/coding-compliance --ci` 或环境变量 `CI=true` |
| 检查范围 | git diff（仅检查变更文件）                     |
| 输出格式 | `--output json`（默认）/ `sarif` / `junit`     |
| 交互模式 | 无用户提示，检测到问题直接退出非零             |
| 输出文件 | `compliance-results.<format>`                  |

## 输出格式

### JSON（默认）

```json
{
  "results": [
    {
      "rule": "F-1",
      "severity": "warning",
      "file": "src/components/ModalReader.tsx",
      "line": 42,
      "message": "重复 JSX 建议提取为配置数组",
      "fixable": true
    }
  ],
  "summary": {
    "total": 5,
    "error": 0,
    "warning": 4,
    "suggestion": 1
  },
  "tsconfig": {
    "target": "ES2020",
    "supported": ["ES2020", "ES2021", "ES2022"]
  }
}
```

### SARIF

符合 GitHub Code Scanning 格式，可直接上传到 Security tab。

### JUnit XML

CI 系统（如 Jenkins）兼容性格式。

````

- [ ] **Step 2: Commit**

```bash
git add ~/.claude/skills/coding-compliance/CI.md
git commit -m "docs: add CI integration guide"
````

---

## Task 8: 新建 EXCEPTIONS.md

**Files:**

- Create: `~/.claude/skills/coding-compliance/EXCEPTIONS.md`

- [ ] **Step 1: 编写例外机制文档**

````markdown
# 例外机制

## 注释格式

### 单条规则禁用

```tsx
// @compliance-disable F-1
// 此处重复 JSX 暂不重构，历史原因
```
````

### 多条规则禁用

```tsx
// @compliance-disable F-1, TM-1, E-2
```

### 文件级禁用

```tsx
/* @compliance-disable-all */
// 本文件跳过所有检查（仅用于第三方库封装或特殊场景）
```

### 带原因说明

```tsx
// @compliance-disable F-1 原因：历史代码暂不重构，计划 Q3 重构
```

### CI 模式标注

```tsx
// @compliance-disable F-1 // 计划 Q3 重构 [例外]
```

CI 报告中会标注 `[例外]`，便于后续清理。

## 设计原则

1. 例外必须带原因，不允许裸 `@compliance-disable`
2. 例外应有时限建议（计划 Q2 / 下版本 / 技术债务）
3. 定期清理例外（建议每季度一次）
4. 文件级禁用仅用于特殊场景，避免滥用

````

- [ ] **Step 2: Commit**

```bash
git add ~/.claude/skills/coding-compliance/EXCEPTIONS.md
git commit -m "docs: add exception mechanism guide"
````

---

## Task 9: 新建 PERFORMANCE.md

**Files:**

- Create: `~/.claude/skills/coding-compliance/PERFORMANCE.md`

- [ ] **Step 1: 编写性能监控检测项**

````markdown
# 性能监控检测

## 检测项清单

| 检测项          | 说明                                                          | 相关规则 |
| --------------- | ------------------------------------------------------------- | -------- |
| 内存泄漏        | 未清理的 addEventListener / setTimeout / IntersectionObserver | TM-1     |
| 频繁重渲染      | useEffect 计数警告 / React DevTools                           | H-2      |
| 长任务          | PerformanceObserver 监听 longtask > 50ms                      | L-3      |
| 卡顿帧          | requestAnimationFrame + performance.now() 检测帧率            | B-1      |
| Core Web Vitals | LCP > 2.5s / FID > 100ms / CLS > 0.1                          | B-4      |

## 检测实现

### 内存泄漏检测

```tsx
// 自动检测：useEffect 返回函数是否清理了所有副作用
const hasCleanup = effectReturn !== undefined
const hasListener = effectBody.includes('addEventListener')
const hasClear = effectBody.includes('removeEventListener')
// 若有 listener 但无 clear → Warning TM-1
```
````

### 长任务检测

```tsx
// 在性能监控组件中植入
const observer = new PerformanceObserver(list => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 50) {
      console.warn('[Performance] Long task:', entry.duration, 'ms')
    }
  }
})
observer.observe({ entryTypes: ['longtask'] })
```

### 卡顿帧检测

```tsx
let lastTime = performance.now()
let frameCount = 0

const checkFrame = (currentTime: number) => {
  if (currentTime - lastTime > 20) {
    // > 2 frames @ 60fps
    console.warn('[Performance] Frame drop:', currentTime - lastTime, 'ms')
  }
  lastTime = currentTime
  frameCount++
  requestAnimationFrame(checkFrame)
}
requestAnimationFrame(checkFrame)
```

## 报告格式

```json
{
  "performance": {
    "memory_leaks": [
      { "file": "src/components/X.tsx", "line": 42, "type": "setTimeout", "uncleared": true }
    ],
    "long_tasks": [{ "duration": 85, "threshold": 50, "file": "src/hooks/useSearch.ts" }],
    "frame_drops": [{ "drop_ms": 45, "file": "src/components/ModalReader.tsx", "line": 120 }]
  }
}
```

````

- [ ] **Step 2: Commit**

```bash
git add ~/.claude/skills/coding-compliance/PERFORMANCE.md
git commit -m "docs: add performance monitoring guide"
````

---

## Task 10: 更新 RULES/frontend.md

**Files:**

- Modify: `~/.claude/skills/coding-compliance/RULES/frontend.md`

- [ ] **Step 1: 添加性能监控规则**

在 frontend.md 末尾新增：

```markdown
## 6. 性能监控

> 级别：Warning

| 规则 | 描述            | 检测点                              |
| ---- | --------------- | ----------------------------------- |
| PM-1 | 内存泄漏检测    | 未清理的监听器/定时器/Observer      |
| PM-2 | 长任务检测      | PerformanceObserver longtask > 50ms |
| PM-3 | 卡顿帧检测      | requestAnimationFrame 帧率 < 30fps  |
| PM-4 | Core Web Vitals | LCP / FID / CLS 阈值超限            |
```

- [ ] **Step 2: Commit**

```bash
git add ~/.claude/skills/coding-compliance/RULES/frontend.md
git commit -m "feat(frontend): add performance monitoring rules"
```

---

## Task 11: 更新 RULES/react.md

**Files:**

- Modify: `~/.claude/skills/coding-compliance/RULES/react.md`

- [ ] **Step 1: 补充 React Hooks 规范**

在 react.md 末尾新增：

````markdown
## 5. 自定义 Hooks 规范

> 级别：Warning

| 规则 | 描述                             |
| ---- | -------------------------------- |
| CH-1 | 命名以 `use` 开头                |
| CH-2 | 单一职责，一个 hook 做一件事     |
| CH-3 | 返回值结构稳定，避免返回不同形状 |
| CH-4 | 复杂 hook 支持配置选项           |

### CH-4 示例

```tsx
// 反模式：硬编码内部逻辑
const useBookmark = (slug: string) => {
  // 固定逻辑，无法配置
}

// 优雅：配置选项
const useBookmark = (
  slug: string,
  options?: {
    autoSync?: boolean
    onError?: (e: Error) => void
  }
) => {
  /* ... */
}
```
````

````

- [ ] **Step 2: Commit**

```bash
git add ~/.claude/skills/coding-compliance/RULES/react.md
git commit -m "feat(react): add custom hooks rules"
````

---

## Self-Review Checklist

1. **Spec 覆盖检查：** 设计文档的 13 个模块全部有对应任务
2. **Placeholder 扫描：** 无 TBD/TODO/待实现内容
3. **类型一致性：** CLI 参数命名统一（F-1/N-1/DP-1 等）
4. **规则级别：** 全部为 Warning，无 Error/Suggestion 混淆
5. **ES 版本：** 每条新规则标注最低 ES 版本
6. **结构变更：** DP/F-1 规则标注"修复前必须告知用户"
7. **CI 模式：** 退出码、输出格式、文件路径全部明确
8. **例外机制：** 格式示例完整，带原因说明

**实施前请确认：**

- [ ] 项目 tsconfig.json 位置（用于 ES 版本检测）
- [ ] Skill 本地路径（`~/.claude/skills/coding-compliance`）
- [ ] 是否需要测试环境验证（当前 workspace 是否可写 skill 目录）
