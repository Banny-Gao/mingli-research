# 通用层规范

适用于所有代码的基础规范。

## 1. 代码风格

### 命名规范

- 变量/函数：camelCase（`getUserData`）
- 类/组件/类型：PascalCase（`UserProfile`）
- 常量：UPPER_SNAKE_CASE（`MAX_RETRY_COUNT`）
- 文件名：kebab-case（`user-service.ts`）
- CSS 类名：BEM 命名法（`block__element--modifier`）

### 注释规范

- 每个函数/组件必须有用途说明
- 复杂逻辑添加 WHY 注释（不是 WHAT）
- 禁用无意义注释（`// comment`）

### 格式化

- 单行长度 ≤ 120 字符
- 统一缩进（项目配置优先，默认 2 空格）
- 末尾无多余空行

## 2. 安全规范

### 禁止项

- ❌ 硬编码密钥：`apiKey = "sk-xxx"` → 使用环境变量
- ❌ SQL 拼接：`query = "SELECT * FROM " + table` → 参数化查询
- ❌ 命令注入：`exec(userInput)` → 禁止用户输入进入系统命令
- ❌ XSS 风险：`dangerouslySetInnerHTML` → 除非必要且经过消毒

### 要求项

- ✅ 用户输入必须校验
- ✅ 敏感数据不得写入日志
- ✅ 权限校验不得依赖前端单边

## 3. 性能规范

### 禁止项

- ❌ 嵌套循环处理大数据集（O(n²) 陷阱）
- ❌ 未清理的 setTimeout/setInterval
- ❌ 未注销的事件监听器

### 要求项

- ✅ 循环内无重复计算
- ✅ 资源使用后立即释放

## 4. Git 规范

### 提交信息格式

```
<type>(<scope>): <subject>

type: feat | fix | docs | style | refactor | test | chore
scope: 可选，影响范围
subject: 简短描述（≤50字）
```

### 示例

```
feat(auth): add login with OAuth
fix(ui): resolve modal scroll lock
docs(readme): update installation guide
```

### 要求项

- ✅ 每次提交逻辑完整（不破坏构建）
- ✅ 提交前运行 lint/build 检查
- ✅ 敏感文件不提交（.env, credentials.json）

## 5. 检查模式

### 静态检查要点（读取文件时逐一匹配）

| 规则       | 匹配模式                                  | 检测方式     |
| ---------- | ----------------------------------------- | ------------ |
| 硬编码密钥 | 字符串含 `"sk-"`, `"api-"`, `password = ` | 正则匹配     |
| SQL 拼接   | `+ table`, `"SELECT " + var`              | 正则匹配     |
| 命令注入   | `exec(`, `eval(`, `spawn(`                | AST 分析     |
| XSS 风险   | `dangerouslySetInnerHTML`                 | 字符串搜索   |
| 嵌套循环   | for/for/for, for/while/for                | AST 嵌套深度 |
| 命名规范   | 匹配 camelCase/PascalCase                 | 正则匹配     |
| 单行长度   | >120 字符的行                             | 字符计数     |

### 检查执行顺序

```
1. 读取 package.json → 确定框架
2. 扫描目标文件列表
3. 按文件逐个读取
4. 匹配检查模式（见上表）
5. 记录问题到当前批次
6. 批次满 → 输出报告 → 等待用户确认
```

## 6. 专家级代码质量

### 代码简洁

- ✅ 删除死代码（未使用的 import/variable/function）
- ✅ 合并重复逻辑（提取公共函数/常量）
- ✅ 简化条件表达式（三元/可选链优于冗余 if）
- ✅ 避免深层嵌套（提前 return / extract function）
- ⚠️ 不过度简化（可读性 > 代码行数）

### 命名清晰

- ✅ 变量名：顾名知意（`userList` 而非 `arr`）
- ✅ 函数名：动词开头（`getUserData` 而非 `userData`）
- ✅ 布尔值：`is`/`has`/`can` 前缀（`isLoading`）
- ❌ 避免过度缩写（`usr` 而非 `user`）

### 结构合理

- ✅ 单一职责（每个函数做一件事）
- ✅ 关注点分离（UI/逻辑/数据 分层）
- ✅ 依赖注入（便于测试和替换）
- ✅ 类型驱动（TypeScript 优先 any）

### 注释质量

- ✅ WHY 注释（为什么这么做，而非做什么）
- ✅ API 文档（函数用途/参数/返回值）
- ❌ 无意义注释（`// comment`）
- ❌ 注释掉的代码（用 git 保存历史）

### 死代码检测

```
未使用的 import：
import { A } from 'x'  // A 未在文件中引用

未使用的变量：
const tmp = getData();  // tmp 定义后未使用

注释掉的代码：
// const oldCode = x;  // 被注释的代码应删除
```

## 7. 分批执行原则

每次检查/修复控制在有限范围内，避免上下文污染。

### 批次限制

- **文件数**：每次最多 3-5 个文件
- **问题数**：每个批次最多 5-10 条问题
- **模块**：同批次问题属于同一模块（避免跨模块）

### 批次间确认

```
批次完成 → 汇报结果 → 询问是否继续
    ↓
继续 → 开启新批次
终止 → 汇总最终报告
```

### 原因

- 上下文窗口有限 → 过多文件导致上下文膨胀
- 质量控制 → 每批次专注单一模块
- 用户控制 → 用户决定何时终止

## 8. 修复安全约束

**铁律：修复代码问题时，不得改变原有功能行为。**

| 允许               | 禁止             |
| ------------------ | ---------------- |
| 格式化/缩进调整    | ❌ 修改业务逻辑  |
| 变量/函数重命名    | ❌ 改变返回值    |
| 常量提取（值不变） | ❌ 修改条件判断  |
| 类型注解补充       | ❌ 删除/添加功能 |
| 注释优化           | ❌ 改变数据流    |
| 死代码删除         | ❌ 改变 API 行为 |

### Diff 验证是铁律（不可跳过）

无论多简单的修复，都必须对比 diff：

1. **确保只改了应该改的**
2. **无误伤相邻代码**
3. **留下可追溯的变更记录**

**"自信"不是跳过验证的理由。**

### 验证流程

1. 修复后对比 diff
2. 运行功能验证
3. 如有测试用例，运行确认通过
4. 涉及逻辑变更？→ 必须告知用户并获得明确确认

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

### DP-2 Observer 检测

```tsx
// 反模式：prop drilling
<Parent onUpdate={handler} data={data} />
  <Child onUpdate={handler} data={data} />
    <DeepChild onUpdate={handler} data={data} />

// 优雅：Context + Observer
const DataContext = createContext<DataContextValue>()
// 任意层级组件 useContext(DataContext) 获取数据
```

### DP-4 Composition 检测

```tsx
// 反模式：大组件承担多个职责
const ComplexModal = () => {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('info')
  // 50+ lines of header + body + footer logic
}

// 优雅：Compound Components
const Modal = ({ open, onClose, children }) => (
  <Dialog open={open} onClose={onClose}>
    {children}
  </Dialog>
)
const Modal.Header = ({ children }) => <div className="modal-header">{children}</div>
const Modal.Body = ({ children }) => <div className="modal-body">{children}</div>
const Modal.Footer = ({ children }) => <div className="modal-footer">{children}</div>
```

### DP-5 Command 检测

```tsx
// 反模式：直接修改无历史
annotations.push(newAnnotation)

// 优雅：Command pattern with undo
const history = new CommandHistory()
history.execute(new AddAnnotationCommand(newAnnotation))
// later: history.undo() / history.redo()
```

### DP-7 Memento 检测

```tsx
// 反模式：无快照
setChapterState(newState)

// 优雅：Memento pattern
const snapshots: ChapterSnapshot[] = []
const saveSnapshot = () => snapshots.push(captureState(currentChapter))
const restore = (index: number) => applyState(snapshots[index])
```

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

## 13. React Hooks 规范

> 级别：Warning

| 规则 | 描述                         | 检测点                                     |
| ---- | ---------------------------- | ------------------------------------------ |
| H-1  | 自定义 hooks 提取重复逻辑    | 两个以上组件使用相同状态逻辑               |
| H-2  | useCallback/useMemo 使用边界 | 过度优化（memo 包裹简单组件）              |
| H-3  | useEffect 依赖完整           | `[a, b]` 缺少依赖导致 stale                |
| H-4  | hooks 组合模式               | 一个组件组合多个 hooks                     |
| H-5  | 状态不可变更新               | `state.push()` → `setState([...state, x])` |

## 14. 错误与边界处理

> 级别：Warning

| 规则 | 描述                   | 检测点                         |
| ---- | ---------------------- | ------------------------------ |
| E-1  | try-catch 边界清晰     | catch 块为空或仅有 console.log |
| E-2  | fetch/async 有降级方案 | try 无 catch，API 失败无回退   |
| E-3  | 异常不泄露敏感信息     | error.message 含用户数据/堆栈  |
| E-4  | 降级 UI 有反馈         | 加载失败显示错误提示而非白屏   |

### E-2 检测

```tsx
// 反模式
const data = await fetch('/api').then(r => r.json())

// 优雅
try {
  const res = await fetch('/api')
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
} catch (err) {
  console.error('Fetch failed:', err)
  setFallbackUI(<ErrorMessage error={err} />)
}
```

## 15. 防御式编程

> 级别：Warning

| 规则 | 描述                | 示例                              |
| ---- | ------------------- | --------------------------------- |
| DF-1 | 参数校验早期 return | `if (!input) return` 在函数开头   |
| DF-2 | 边界检查            | 数组索引访问前检查 `length > idx` |
| DF-3 | null 安全           | `obj?.prop?.method()`             |
| DF-4 | 外部输入校验        | 用户输入/接口返回数据的类型校验   |

### DF-4 检测

```tsx
// 反模式：外部数据未校验直接使用
const user = JSON.parse(localStorage.getItem('user'))
user.name // 可能崩溃

// 优雅：防御式校验
const raw = localStorage.getItem('user')
if (!raw) return null
try {
  const user = JSON.parse(raw)
  return typeof user?.name === 'string' ? user : null
} catch {
  return null
}
```

## 16. DRY 检测

> 级别：Warning

| 规则 | 描述           | 检测点                         |
| ---- | -------------- | ------------------------------ |
| D-1  | 跨文件重复逻辑 | 相同函数/常量出现 2+ 次        |
| D-2  | 相似组件合并   | 组件结构相似度 > 70%           |
| D-3  | 重复类型定义   | 相同 interface/type 出现 2+ 次 |

### D-2 检测

```tsx
// 反模式：两个组件结构 90% 相同
const SkillCard = ({ name, desc, onClick }) => (
  <div onClick={onClick}>
    <span>{name}</span>
    <span>{desc}</span>
  </div>
)
const ChapterCard = ({ name, desc, onClick }) => (
  <div onClick={onClick}>
    <span>{name}</span>
    <span>{desc}</span>
  </div>
)

// 优雅：抽象公共组件
const ItemCard = ({ name, desc, onClick, badge }) => (
  <div onClick={onClick}>
    <span>{name}</span>
    <span>{desc}</span>
    {badge && <span className="badge">{badge}</span>}
  </div>
)
```

## 17. 循环与性能

> 级别：Warning

| 规则 | 描述                   | 示例                                          |
| ---- | ---------------------- | --------------------------------------------- |
| L-1  | while 能解决的不用递归 | 尾递归可替代 → 循环优先                       |
| L-2  | 循环不变式外提         | `arr.map(x => heavy(x, n))` → 提 `heavy` 引用 |
| L-3  | 避免 O(n²)             | 嵌套循环处理同一数组                          |

### L-1 检测

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

### L-3 检测

```tsx
// 反模式：O(n²)
for (const a of arr) {
  for (const b of arr) {
    if (a.id === b.id) process(a, b)
  }
}

// 优雅：用 Map 降为 O(n)
const map = new Map(arr.map(a => [a.id, a]))
for (const a of arr) {
  const b = map.get(a.id)
  if (b) process(a, b)
}
```

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

## 19. 浏览器新特性

> 级别：Warning

| 规则 | 描述                  | 适用场景                             |
| ---- | --------------------- | ------------------------------------ |
| B-1  | RequestAnimationFrame | 动画/滚动优化（替代 setInterval）    |
| B-2  | RequestIdleCallback   | 空闲时后台任务（低优先级工作）       |
| B-3  | MutationObserver      | DOM 变化监听（替代 Mutation Events） |
| B-4  | IntersectionObserver  | 懒加载/曝光统计（替代 scroll 监听）  |

### B-4 检测

```tsx
// 反模式：scroll 监听用于懒加载
window.addEventListener('scroll', () => {
  if (el.getBoundingClientRect().top < window.innerHeight) load()
})

// 优雅：IntersectionObserver
const observer = new IntersectionObserver(
  ([entry]) => {
    if (entry.isIntersecting) {
      load()
      observer.disconnect()
    }
  },
  { threshold: 0.1 }
)
observer.observe(el)
```

## 20. 移动端兼容性

> 级别：Warning

| 规则 | 描述            | 检测点                                    |
| ---- | --------------- | ----------------------------------------- |
| MB-1 | iOS Safari 差异 | 安全区域/橡皮筋滚动/输入框/position:fixed |
| MB-2 | Android 兼容性  | WebView 版本/CSS 支持度差异               |
| MB-3 | 安全区域适配    | env(safe-area-inset-\*) / 异形屏          |
| MB-4 | 触控优化        | touch-action / Passive events / 点击延迟  |

### MB-1 iOS Safari 检测

```tsx
/* 反模式 */
.modal-footer {
  position: fixed;
  bottom: 0; /* iOS 输入框场景下被遮挡 */
}

/* 优雅 */
.modal-footer {
  position: fixed;
  bottom: 0;
  padding-bottom: env(safe-area-inset-bottom);
}
```

### MB-4 Passive Events

```tsx
// 反模式
element.addEventListener('touchstart', handler)

// 优雅
element.addEventListener('touchstart', handler, { passive: true })
```

## 21. 代码结构

> 级别：Warning

| 规则 | 描述                    | 检测点                                           |
| ---- | ----------------------- | ------------------------------------------------ |
| CS-1 | 空状态提前 return       | `if (!data) return null` 减少嵌套                |
| CS-2 | 条件分支嵌套 ≤3 层      | 超过 3 层嵌套建议拆分函数                        |
| CS-3 | 魔法数字/字符串常量外置 | `0.3` / `'interp'` → `const SCROLL_OFFSET = 0.3` |
| CS-4 | 函数 ≤30 行             | 超过 30 行建议拆分                               |
| CS-5 | Import 排序             | 外部依赖/内部模块/类型导入分组                   |

### CS-2 检测

```tsx
// 反模式：嵌套过深
function process(data) {
  if (data) {
    if (data.items) {
      for (const item of data.items) {
        if (item.valid) {
          if (item.type === 'A') processA(item)
          else if (item.type === 'B') processB(item)
          else processDefault(item)
        }
      }
    }
  }
}

// 优雅：提前 return + 拆分
function process(data) {
  if (!data?.items) return
  for (const item of data.items) {
    if (!item.valid) continue
    dispatch(item)
  }
}
```
