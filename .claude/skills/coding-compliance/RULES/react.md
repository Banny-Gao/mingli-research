# React 专项规范

适用于 React 项目。

## 1. Hooks 规范

### 规则调用

- ✅ 只在组件顶层调用 Hooks
- ✅ 只在 React 函数中调用 Hooks
- ❌ 不在循环、条件语句中调用 Hooks

### useEffect 依赖

- ✅ 显式声明所有依赖项
- ✅ 清理副作用（return cleanup function）

### 常见错误

```
// ❌ 错误
useEffect(() => {
  fetchData();
}, []); // 缺少依赖

// ✅ 正确
useEffect(() => {
  fetchData(id);
}, [id]);
```

## 2. 组件模式

### 函数组件优先

- ✅ 使用函数组件（而非 class 组件）
- ✅ 使用 Hooks 管理状态和副作用

### 性能优化

- ⚠️ 谨慎使用 memo/useCallback（过度优化适得其反）
- ⚠️ 列表渲染必须加 key（避免使用 index 作为 key）
- ❌ 不在 render 中创建新函数/对象

## 3. TypeScript 规范

### Props 类型

```typescript
// ✅ 推荐
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

// ❌ 不推荐：使用 any
interface ButtonProps {
  label: any
  onClick: any
}
```

### 状态类型

- ✅ 使用联合类型明确状态可能值
- ✅ 避免 any，使用 unknown 替代未知类型

## 4. 性能优化陷阱

### 禁止项

- ❌ 过度使用 useMemo/useCallback（小组件不值得）
- ❌ 在 props 中传递新对象/数组（导致子组件重渲染）
- ❌ 缺少 React.memo 比较函数的自定义比较

### 要求项

- ✅ 列表大数据时使用虚拟滚动
- ✅ 避免不必要的重渲染

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

### CH-2 检测

```tsx
// 反模式：多功能 hook
const useData = slug => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bookmarks, setBookmarks] = useState([])
  const [annotations, setAnnotations] = useState([])
  // 做了太多事情
}

// 优雅：单一职责拆分
const useChapter = slug => {
  /* 只管 chapter 数据 */
}
const useBookmarks = slug => {
  /* 只管 bookmarks */
}
const useAnnotations = slug => {
  /* 只管 annotations */
}
```
