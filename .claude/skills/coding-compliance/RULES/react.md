# React 专项规范

适用于 React 项目。聚焦 React 特有的设计决策和常见陷阱，不重复基础文档内容。

## 1. Hooks 使用规范

### 1.1 调用规则

> 级别：Error

```tsx
// ❌ 条件/循环/嵌套函数中调用
if (loading) {
  useEffect(/* ... */)    // 违反 hooks 调用规则
}

// ❌ 过早 return 后调用
function App() {
  if (!user) return null
  const [data, setData] = useState(null)  // 这行不会被执行
}
```

**检测：** 检查是否存在 hooks 前的条件 return / if 包裹 hooks / hooks 在回调中。

### 1.2 useState 设计决策

> 级别：Suggestion

**何时用 `useState` vs `useReducer`：**

| 场景 | 选择 | 原因 |
|------|------|------|
| 独立简单状态 | `useState` | 最简，读/写意图清晰 |
| 关联状态（loading + error + data） | `useReducer` 或合并对象 | 原子化更新，避免遗漏 |
| 状态转换复杂（多步操作） | `useReducer` | 类型安全的分支处理 |
| 父组件传递 | `useState` | 上层控制 |

```tsx
// useReducer 的合理用法：关联状态
type State = { data: Data | null; loading: boolean; error: string | null }
type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; data: Data }
  | { type: "FETCH_ERROR"; error: string }

// 对比：3个独立的 useState + 3次 set → 有中间态不一致风险
// useReducer → 一次 dispatch 原子更新
```

**常见误判：** 非要把所有 useState 改成 useReducer。一个 `useState` 够用时不改。

### 1.3 状态结构设计

> 级别：Warning

```tsx
// ❌ 冗余派生状态
const [items, setItems] = useState<Item[]>([])
const [count, setCount] = useState(0)        // 可以从 items.length 派生的值
const [hasItems, setHasItems] = useState(false)  // 可以从 items.length > 0 派生

// ✅ 计算派生值（如果计算昂贵才用 useMemo）
const items = useState<Item[]>([])
const count = items.length
const hasItems = items.length > 0

// ❌ 扁平化太细
const [firstName, setFirstName] = useState("")
const [lastName, setLastName] = useState("")
const [email, setEmail] = useState("")
// ✅ 聚合关联状态
const [form, setForm] = useState({ firstName: "", lastName: "", email: "" })
// 用更新函数辅助更新
const updateField = (field: keyof typeof form) => (value: string) =>
  setForm(prev => ({ ...prev, [field]: value }))
```

## 2. useEffect 规范

### 2.1 各依赖类型的预期行为

> 级别：Warning

```tsx
// 挂载一次（空依赖数组）
useEffect(() => {
  trackPageView()
}, [])  // 注意：React 18 Strict Mode 下 mount 两次

// 依赖变化时
useEffect(() => {
  fetchUser(id)
}, [id])  // id 变化时重新获取

// 每次渲染（不传依赖数组）
useEffect(() => {
  // 没有特殊原因不应该这样用
})

// 卸载清理
useEffect(() => {
  const sub = source.subscribe()
  return () => sub.unsubscribe()   // 清理函数
}, [])
```

**常见错误（级别：Error — 缺少依赖导致 stale closure，属于逻辑 bug）：**

```tsx
// ❌ 依赖数组不完整
useEffect(() => {
  fetchData(id)
}, [])  // id 被引用但未声明

// ❌ 使用对象/数组作为依赖（引用每次都变）
useEffect(() => {
  process(options)
}, [options])   // options = { page: 1 }  → 每次渲染都会创建新对象 → 死循环

// ✅ 使用具体值或 useMemo 稳定引用
const options = useMemo(() => ({ page: 1 }), [])
```

### 2.2 useEffect 的分类

> 级别：Suggestion

不是所有 `useEffect` 都该用：

| 类别 | 示例 | 是否该用 useEffect |
|------|------|--------------------|
| 同步外部系统 | 订阅 WebSocket、注册事件 | ✅ 必须 |
| 数据获取 | fetch API → setState | ⚠️ 可用但有更好方案（SWR/React Query） |
| 派生状态 | `fullName = firstName + " " + lastName` | ❌ 计算在渲染中 |
| 监听用户交互 | `onClick → setState` | ❌ 用事件处理函数 |
| 响应 props 变化更新 state | `prevProps.id !== id → setState` | ⚠️ 考虑纯计算或 key 重置 |

**判断标准：** 去掉 useEffect 会导致 bug？不会 → 说明不应该用。

### 2.3 cleanup 的时机

> 级别：Warning

```tsx
// ❌ 缺少 cleanup → 竞态条件
useEffect(() => {
  fetchData(id).then(setData)
}, [id])
// id 快速变化时，旧请求可能晚于新请求返回 → 显示错误数据

// ✅ 标记清理
useEffect(() => {
  let cancelled = false
  fetchData(id).then(data => {
    if (!cancelled) setData(data)
  })
  return () => { cancelled = true }
}, [id])
```

## 3. 组件组合模式

### 3.1 组件树的深度控制

> 级别：Suggestion

```
一个 component 调用链不应超过 3-4 层自定义组件。

<Page> → <Sidebar> → <NavSection> → <NavItem>     // ✅ 4 层 OK
<Page> → <Section> → <Panel> → <Content> → <Form> → <Field> → <Input>  // ❌ 过深
```

**大于 4 层的信号：** 
- 大量 props 透传未使用的中间组件 → 考虑 Context 或直接组合
- 中间组件只有一层包装逻辑 → 考虑合并

### 3.2 组合 vs 继承

> 级别：Suggestion

React 用组合而不是继承。几种组合模式的比较：

```tsx
// 模式 1：默认 children（最简单）
const Card = ({ title, children }) => (
  <div className="card">
    <h2>{title}</h2>
    {children}
  </div>
)

// 模式 2：具名 slots（多个插入点）
const Layout = ({ header, sidebar, main }) => (
  <div>
    <header>{header}</header>
    <aside>{sidebar}</aside>
    <main>{main}</main>
  </div>
)

// 模式 3：render props（子组件控制渲染逻辑）
const DataList = ({ items, renderItem }) => (
  <ul>{items.map(item => renderItem(item))}</ul>
)
```

**选择依据：**
- children → 只有一个内容插入点
- 具名 slots → 多个插入点，结构固定
- render props → 子组件需要控制渲染细节
- Custom hooks → 共享逻辑而非 UI

### 3.3 key 的正确使用

> 级别：Error

```tsx
// ✅ 用唯一 ID
{items.map(item => <Item key={item.id} data={item} />)}

// ❌ 用 index（仅在静态列表且无状态时勉强可用）
{items.map((item, idx) => <Item key={idx} data={item} />)}

// ❌ 用随机值（每次重新创建所有组件）
{items.map(item => <Item key={Math.random()} data={item} />)}
```

**检测信号：** 列表内组件有输入框、滚动位置或展开状态 → 必须用稳定 ID。用 index 会在列表排序/插入/删除时破坏子组件状态。

### 3.4 key 的高级用法：强制重新挂载

> 级别：Suggestion

```tsx
// ✅ 用 key 重置组件状态（比 useEffect 重置更简洁）
// 用户选择不同表单 → 表单完全重新挂载，不用手动清空状态
<Form key={selectedFormId} formId={selectedFormId} />
```

## 4. TypeScript 与 React

### 4.1 Props 类型定义

> 级别：Warning

```tsx
// ✅ 用 interface（扩展性好）
interface ButtonProps {
  label: string
  variant?: "primary" | "secondary"
  onClick: () => void
}

// ✅ 复杂组件导出 Props 类型方便复用
export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (row: T) => void
}

// ❌ 避免
interface ButtonProps {
  label: any       // 类型丢失
  style: object    // 不够精确，应使用 CSSProperties
}
```

### 4.2 React 类型工具

> 级别：Suggestion

```tsx
// 组件 Props 推导
type Props = React.ComponentProps<typeof Button>

// HTML 原生元素 Props
type InputProps = React.InputHTMLAttributes<HTMLInputElement>

// 合成事件
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {}
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {}

// Ref
const ref = useRef<HTMLDivElement>(null)

// 子组件类型
type Props = { children: React.ReactNode }
```

### 4.3 泛型组件

> 级别：Suggestion

```tsx
// 当组件接收的数据类型不确定时
const Select = <T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[]
  value: T
  onChange: (v: T) => void
}) => {
  /* ... */
}
```

## 5. 性能优化决策指南

### 5.1 React.memo 的正确使用

> 级别：Suggestion

**用 React.memo 的条件（必须全部满足）：**
1. 组件 re-render 次数多（非首次渲染后仍频繁触发）
2. 组件渲染开销大（渲染大量 DOM / 复杂计算）
3. props 大部分时候不变（或引用稳定）

```tsx
// ✅ 合理：列表项，频繁 re-render，props 稳定
const ExpensiveItem = React.memo(({ item }: { item: Item }) => {
  return <div>{/* 复杂渲染 */}</div>
})

// ❌ 不合理：简单组件，memo 的比较成本超过渲染成本
const SimpleText = React.memo(({ text }: { text: string }) => {
  return <span>{text}</span>
})
```

**检测信号：** 看到无 `useCallback`/`useMemo` 配合的 `React.memo`，memo 基本无效——因为 props 里的函数每次渲染都是新引用。

### 5.2 useMemo 的正确使用

> 级别：Suggestion

| 场景 | 用 useMemo？ | 原因 |
|------|-------------|------|
| 重型计算（>1ms） | ✅ | 跳过重复计算 |
| 稳定引用（传给 memo 子组件） | ✅ | 避免子组件重渲染 |
| 简单计算（数组长度、字符串拼接） | ❌ | 比较 + 缓存开销超过计算本身 |
| 组件内的字面量对象/数组 | ❌ | 提取到组件外常量即可 |

```tsx
// ❌ 滥用
const fullName = useMemo(() => `${first} ${last}`, [first, last])

// ✅ 合理
const sortedItems = useMemo(
  () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
  [items]
)
```

### 5.3 useCallback 的正确使用

> 级别：Suggestion

```tsx
// ✅ 需要稳定的引用
const handleClick = useCallback(
  (id: string) => {
    trackEvent("click", id)
  },
  [trackEvent]
)
// 传递给 memo 子组件时必须
return <MemoButton onClick={() => handleClick(item.id)} />  // ❌ 内联函数每次新建引用
return <MemoButton onClick={handleClick(item.id)} />       // ❌ 错误语法
```

**判断标准：**
- 函数作为 props 传给 `React.memo` 组件 → 用 `useCallback`
- 函数是 `useEffect` 的依赖 → 用 `useCallback`
- 其他情况 → 不用 `useCallback`，函数组件的函数引用重建几乎没开销

### 5.4 性能优化优先顺序

> 级别：Suggestion

```
第一：减少不必要的渲染（状态下移、组件拆分）
  效果：最大
第二：React.memo（拦截不必要的子组件渲染）
  效果：中
第三：useMemo + useCallback（稳定引用）
  效果：依赖场景
第四：虚拟滚动（大数据列表）
  效果：特定场景显著
```

**核心原则：** 不做超前优化。发现性能问题 → 用 Profiler 定位 → 针对性优化。

## 6. 常见反模式

### 6.1 内联样式/对象/函数

> 级别：Warning

```tsx
// ❌ 每次渲染创建新对象
<div style={{ color: "red" }}>
<ExpensiveItem data={{ id: 1, name: "test" }} />
<button onClick={() => doSomething(id)}>
```

### 6.2 state 初始化用 props 但不随 props 更新

> 级别：Warning

```tsx
// ❌ user prop 变化时 name 不会更新
function Profile({ user }: { user: User }) {
  const [name, setName] = useState(user.name)
}
```

### 6.3 在渲染中触发副作用

> 级别：Error

```tsx
// ❌ 渲染中直接引起状态变更
function ProductList() {
  const [data, setData] = useState(null)
  fetchData().then(setData)  // 每次渲染都会触发
  return <div>...</div>
}
```

### 6.4 条件触发 hooks 或 hooks 前 return

> 级别：Error

```tsx
// ❌
if (condition) {
  useEffect(() => {}, [])
}
// ✅ 始终在顶层
useEffect(() => {
  if (condition) { /* ... */ }
}, [condition])
```
