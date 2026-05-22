# 前端通用规范

适用于所有前端代码（React/Vue/其他框架）。聚焦框架无关的设计决策和架构模式。

## 1. 组件设计

### 1.1 单一职责的判断标准

> 级别：Suggestion

一个组件做几件事的判断方式：

```
组件："这个 Modal 渲染表单 + 校验 + 提交 + 显示通知"
        ↓
拆分：ModalForm（渲染+校验） + useSubmit（提交逻辑） + Notification（通知）
```

**判断标准：存在任意一条 → 考虑拆分**

| 信号 | 示例 | 拆分方向 |
|------|------|----------|
| 一个组件同时管数据获取和渲染 | `fetch + state + JSX` | 拆分展示组件 + 容器组件/hooks |
| 条件渲染超过 3 个分支 | `if (type === 'a') ... else if ...` | 多态组件 / 策略模式 |
| 状态变量超过 5 个 | `const [a, b, c, d, e]` | 合并关联状态 / 拆分组件 |
| 文件超过 250 行 | — | 按职责拆分 |

**误判风险：** 拆得太碎导致 props drilling 和包装地狱。一条经验线：一个组件被拆到超过 3 层嵌套（SubSection 包 SubPanel 包 SubItem）说明过度了。

### 1.2 Props 接口设计

> 级别：Warning

Props 是组件的 API 契约，设计质量决定组件的可复用性和维护成本。

**原则：**

- ✅ 用 TypeScript 类型（`interface` 或 `type`）定义所有 props
- ✅ 可选 props 给默认值，避免调用方每次传递
- ❌ 避免 props 超过 6 个 — 超过则考虑：
  - **配置对象**：`options` prop 聚合关联配置
  - **composition**：拆成子组件分别接收子集
  - **Context**：共享上下文数据
- ❌ 避免 `...rest` 透传未知 props — 类型不安全，调用方不明确

**命名约定：**

| Prop 类型 | 命名规则 | 示例 |
|-----------|----------|------|
| 回调函数 | `on` 前缀 | `onSubmit`, `onClose`, `onChange` |
| 初始值 | `default` 前缀 | `defaultValue`, `defaultOpen` |
| 布尔状态 | `is`/`has`/`show` 前缀 | `isLoading`, `hasError`, `showFooter` |
| 渲染内容 | `render` 前缀 | `renderHeader`, `renderItem` |

**常见误判：**
> "10 个 props 太多了" → 不一定。表单组件有 10+ props 是正常的，关键看是否聚合相关。用 `Pick` / `Omit` 约束类型比拆分更优雅。

### 1.3 受控 vs 非受控组件的选择

> 级别：Suggestion

| 场景 | 选择 | 原因 |
|------|------|------|
| 输入框、表单 | 非受控（`ref` / 默认值） | 减少 re-render，简单 |
| 需要外部控制的值 | 受控（`value + onChange`） | 外部可干预状态变化 |
| 编辑/查看模式 | 受控 | 外部传入数据驱动 |
| UI 库组件 | 两者支持（`value/defaultValue`） | 适应两种使用场景 |

## 2. 状态管理

### 2.1 状态分类

> 级别：Suggestion

不同种类状态用不同方案管理，不存在"最佳"状态管理库。

| 状态类型 | 定义 | 推荐方案 | 避免 |
|----------|------|----------|------|
| 本地 UI 状态 | 弹窗开闭、折叠、选中项 | `useState` | 放入全局 store |
| 共享状态 | 多组件需要的同一数据 | Context / 组件提升 | prop drilling 超过 3 层 |
| 服务端缓存 | API 响应数据 | React Query / SWR / RTK Query | 手动缓存管理 |
| URL 状态 | 搜索参数、页码、筛选 | `useSearchParams` / router | 存到 useState 再同步 URL |
| 全局状态 | 主题、语言、权限 | Context / Zustand / Jotai | Redux 用来存一个 theme |

### 2.2 状态提升 vs 下放

> 级别：Suggestion

**决策树：**

```
数据需要被组件 A 和 B 共享？
  ├── 是 → 提升到共同父组件
  │     └── 传递超过 3 层 → 考虑 Context
  └── 否 → 保持在局部
        └── 未来确定会共享 → 预提升但有代价
```

**提升的代价：** 父组件 re-render 会导致所有子组件 re-render。配合 `React.memo` 或 `useMemo` 使用。

**下放的最佳时机：** 组件的一部分 UI 和状态只在特定场景使用，提取为独立组件即可自动下放。

### 2.3 不可变更新的陷阱

> 级别：Error

不可变更新不是"做了就行"，常见错误模式：

```tsx
// ❌ 错了——浅拷贝不够
setUser(prev => ({ ...prev, address: { ...prev.address, city: "NYC" } }))

// ✅ 正确路径上的更新需要层层展开（或 useImmer）
setUser(prev => ({
  ...prev,
  address: { ...prev.address, city: "NYC" },
}))
```

**判断：**
- 对象更新不超过 2 层 → 手写展开（`...`）
- 对象更新超过 2 层 → 使用 Immer / 不可变库
- 数组更新 → `map`/`filter`/`slice` 替代 `push`/`splice`
- 嵌套数组 → Immer 或不可变库

## 3. 文件与模块组织

### 3.1 组件文件结构

> 级别：Suggestion

同一组件有三种组织策略，按复杂度递进：

```
# 策略 A：单文件（组件 ≤100 行）
Button/
  index.tsx
  index.css

# 策略 B：组件 + 子组件拆分（组件 100-300 行）
DataTable/
  index.tsx
  TableHeader.tsx
  TableRow.tsx
  useSort.ts
  style.css

# 策略 C：功能模块（组件 ≥300 行，或业务逻辑复杂）
Checkout/
  components/        # 子组件
    AddressForm.tsx
    PaymentForm.tsx
  hooks/             # 业务 hooks
    useCart.ts
    usePayment.ts
  utils/             # 纯函数
    validators.ts
    formatters.ts
  index.tsx          # 入口组件
```

**判断依据：** 
- 单文件 → 不需要在组件外复用内部逻辑
- 拆文件 → 子组件或 hooks 被模块内多处引用

### 3.2 模块边界

> 级别：Suggestion

```
src/
  features/       — 业务模块（按领域划分）
  shared/         — 共享组件和工具
  lib/            — 纯工具函数（无业务含义）
```

**规则：**
- `features/` 下模块之间不能有循环依赖
- `shared/` 不能依赖 `features/`
- 跨模块共享的类型放 `shared/types.ts`，而非各自维护

## 4. 错误与边界处理

### 4.1 前端错误的层级

> 级别：Warning

错误层次越清晰，处理越一致：

| 错误层 | 例子 | 处理方式 |
|--------|------|----------|
| 渲染异常 | `Cannot read property of undefined` | Error Boundary 兜底 |
| API 错误 | 4xx / 5xx | 统一拦截 + 用户提示 |
| 异步操作失败 | 提交超时、上传失败 | 操作级 try-catch + 降级 UI |
| 表单校验 | 格式错误 | 字段级校验 + 即时反馈 |
| 第三方 SDK 异常 | 支付 SDK 加载失败 | 降级方案 / 重试机制 |

### 4.2 Error Boundary 的正确使用

> 级别：Warning

```tsx
// ✅ 正确：粒度合理
<ErrorBoundary fallback={<ErrorFallback />}>
  <ProductList />     // 只兜底 ProductList 的崩溃
</ErrorBoundary>
<Footer />            // 不影响 Footer

// ❌ 错误：整个 app 包一个 ErrorBoundary
<ErrorBoundary>       // 任何组件崩溃 → 整个页面白屏
  <App />
</ErrorBoundary>

// ❌ 错误：边界内不应该自愈
<ErrorBoundary onError={() => fetchData()}>   // ErrorBoundary 不重试，用 try-catch
```

### 4.3 API 错误的统一处理

> 级别：Warning

```tsx
// ✅ 推荐：统一拦截器 + 分层处理
const api = axios.create({ baseURL: "/api" })

api.interceptors.response.use(
  res => res,
  error => {
    if (error.response?.status === 401) redirectToLogin()
    if (error.response?.status === 403) showForbiddenToast()
    return Promise.reject(error)
  }
)

// ✅ 业务层捕获
try {
  await api.post("/orders", data)
  showSuccess()
} catch (err) {
  if (isNetworkError(err)) showOfflineBanner()
  // 401/403 已在拦截器处理，这里不重复
}
```

## 5. 资源与路径管理

### 5.1 路径常量化

> 级别：Suggestion

```tsx
// ❌ 错误：散落的路径字符串
fetch("/api/users/123")
navigate("/user/profile")
<img src="/assets/icons/logo.png" />

// ✅ 正确：集中管理
const API = { users: (id: string) => `/api/users/${id}` } as const
const ROUTES = { userProfile: "/user/profile" } as const
const ASSETS = { logo: "/assets/icons/logo.png" } as const
```

### 5.2 环境变量边界

> 级别：Warning

```tsx
// ✅ 正确：只在前端安全的环境变量前缀下使用
const API_BASE = import.meta.env.VITE_API_URL  // Vite
const API_BASE = process.env.NEXT_PUBLIC_API_URL  // Next.js

// ❌ 错误：暴露服务端密钥
const DB_PASS = process.env.DB_PASSWORD  // 构建时打包进前端代码！
```

## 6. 可访问性（Accessibility）

> 级别：Suggestion

### 6.1 语义化 HTML 优先

不依赖 ARIA 属性的规则：

```tsx
// ✅ 原生 button 自带键盘导航和焦点管理
<button onClick={handleClick}>提交</button>

// ❌ 需要额外处理键盘事件和 ARIA
<div role="button" tabIndex={0} onClick={handleClick} onKeyDown={handleKey}>提交</div>
```

### 6.2 可访问性审查要点

- ✅ 所有图片有 `alt` 文本（装饰性图片用 `alt=""`）
- ✅ 表单输入有关联 `<label>`（非 `placeholder` 替代）
- ✅ 颜色对比度 ≥ 4.5:1（正文）/ 3:1（大文本）
- ✅ 焦点顺序符合视觉顺序（tabIndex 不滥用正值）
- ✅ 动态内容更新使用 `aria-live` 区域
- ⚠️ 自定义组件需要提供键盘交互（Enter/Space 触发、Escape 关闭）
