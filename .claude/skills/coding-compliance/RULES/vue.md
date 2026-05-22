# Vue 专项规范

适用于 Vue 3 Composition API 项目。聚焦 Vue 特有的响应式陷阱和组合式 API 设计模式，不重复官方文档基础内容。

## 1. Composition API 规范

### 1.1 ref vs reactive 决策指南

> 级别：Warning

```tsx
// 基础规则
const count = ref(0)               // ✅ 基本类型 → ref
const user = ref({ name: "" })     // ✅ 对象也可用 ref（推荐默认选择）
const state = reactive({ list: []}) // ✅ 明确需要响应式代理的对象
    
// ref 和 reactive 的互换场景
```

**决策树：**

```
值是基本类型（string/number/boolean） → ref（必须）
值是对象/数组：
  ├── 需要整体替换 → ref（.value 赋值）
  │     reactive 无法直接替换对象本身
  ├── 需要深层响应 → ref 或 reactive 都可以
  │     ref 在 .value 解构时丢失响应式
  └── 需要解构使用 → reactive + toRefs
        const state = reactive({ a: 1, b: 2 })
        const { a, b } = toRefs(state)  // 解构后仍保持响应式
```

**常见陷阱：**

```tsx
// ❌ reactive 直接赋值丢失响应式
let state = reactive({ count: 0 })
state = { count: 1 }  // 失去响应式，state 变成了普通对象

// ✅ ref 整体赋值没问题
let state = ref({ count: 0 })
state.value = { count: 1 }

// ❌ reactive 解构丢失响应式
const state = reactive({ count: 0, name: "test" })
const { count, name } = state  // count 和 name 变成普通变量

// ✅ 用 toRefs
const { count, name } = toRefs(state)

// ❌ ref 在 reactive 中的自动解包（可能混淆）
const count = ref(0)
const state = reactive({ count })
console.log(state.count)   // 0（自动解包，不需要 .value）
state.count = 1            // 自动解包，但这里是修改 reactive
console.log(count.value)   // 1（ref 也被修改了，因为 reactive 内 ref 会同步）
```

### 1.2 computed 的常规用法 vs getter/setter

> 级别：Suggestion

```tsx
// ✅ 只读 computed（最常见）
const fullName = computed(() => `${firstName.value} ${lastName.value}`)

// ✅ 可写 computed（少用，但适用于双向绑定场景）
const displayName = computed({
  get: () => `${firstName.value} ${lastName.value}`,
  set: (val: string) => {
    const [first, last] = val.split(" ")
    firstName.value = first
    lastName.value = last
  },
})
```

**判断标准：** 只在 v-model 绑定一个"派生+回写"值时用 getter/setter。大多数时候用普通 + 单独的处理函数更清晰。

### 1.3 watch vs watchEffect vs computed

> 级别：Warning

| 场景 | 选择 | 原因 |
|------|------|------|
| 基于其他状态派生新值 | `computed` | 声明式、缓存、无副作用 |
| 需要执行副作用（API 调用、日志） | `watch` 或 `watchEffect` | 显式处理副作用 |
| 需要监听具体某个值的变化 | `watch` | 明确监听的源，可获取旧值 |
| 不需要指定依赖，自动收集 | `watchEffect` | 初始化立即执行 + 自动追踪 |

```tsx
// computed：派生值
const total = computed(() => prices.value.reduce((a, b) => a + b, 0))

// watch：明确依赖 + 旧值
watch(searchQuery, async (newQ, oldQ) => {
  if (newQ !== oldQ) {
    results.value = await fetchResults(newQ)
  }
})

// watchEffect：自动收集依赖
watchEffect(() => {
  // 这里用到的响应式值变化时都会触发
  localStorage.setItem("draft", JSON.stringify(draft.value))
})
```

**常见误判：**

```tsx
// ❌ watchEffect 做异步操作时需注意竞态
watchEffect(async () => {
  const res = await api.fetch(id.value)
  data.value = res  // id 快速变化时可能拿错
})

// ✅ 用 watch 控制 + 清理
watch(id, async (newId, oldId, onCleanup) => {
  let cancelled = false
  onCleanup(() => { cancelled = true })
  const res = await api.fetch(newId)
  if (!cancelled) data.value = res
})
```

## 2. 组件通信

### 2.1 通信方式选择

> 级别：Suggestion

```
数据流方向：
  父 → 子  → props（首选）, provide/inject（深层传递）
  子 → 父  → emits（首选）, v-model（双向绑定场景）
  兄弟组件 → 提升到共同父组件（首选）, Event Bus（不推荐）
  任意组件 → Pinia（全局状态）, provide/inject（子树范围）
```

**选择依据：**

| 场景 | 方案 | 说明 |
|------|------|------|
| 父传子（1-2 层） | props | 最简、类型安全 |
| 父传子（3+ 层） | provide/inject | 避免 props 透传 |
| 子通知父 | emits | 显式事件 |
| 表单双向绑定 | v-model + defineModel | Vue 3.4+ 推荐 |
| 组件树范围内共享 | provide/inject | 作用域受限 |
| 页面级共享 | Pinia | 可跨组件树、DevTools 支持 |

### 2.2 provide/inject 的正确使用

> 级别：Suggestion

```tsx
// ✅ 用 InjectionKey 提供类型安全
import type { InjectionKey } from "vue"

interface ThemeContext {
  theme: Ref<"light" | "dark">
  toggleTheme: () => void
}

export const THEME_KEY: InjectionKey<ThemeContext> = Symbol("theme")

// 提供方
const theme = ref<"light" | "dark">("light")
provide(THEME_KEY, { theme, toggleTheme: () => theme.value === "light" ? "dark" : "light" })

// 注入方
const { theme, toggleTheme } = inject(THEME_KEY)!  // 确保非空

// ❌ 避免：用字符串 key + 无类型
provide("theme", theme)

// ⚠️ 注意：provide/inject 不是响应式绑定，传 ref 才能保持响应式
provide("data", data)      // data 是非 ref 的普通值时，注入方无法自动更新
provide("data", ref(data))  // 保证响应式
```

### 2.3 插槽（Slots）的使用模式

> 级别：Suggestion

```vue
<!-- ✅ 作用域插槽：让父组件控制渲染 -->
<List :items="items">
  <template #item="{ item, index }">
    <div class="custom-item">{{ index }}. {{ item.name }}</div>
  </template>
</List>

<!-- ❌ 避免：接收不必要的作用域值 -->
<List :items="items">
  <template #default="{ item, index, total, isSelected, onSelect, onDelete }">
    <!-- 基本上等于把整个 List 内部状态暴露了 -->
  </template>
</List>
```

**判断标准：** 插槽暴露的值应该是"组件需要父组件提供的渲染数据"，而非"组件的全部内部状态"。

```tsx
// ✅ 插槽 props 的最小化原则
interface ListSlotProps<T> {
  item: T
  index: number
}
```

## 3. Composable 设计模式

### 3.1 Composable 的命名和职责

> 级别：Warning

```tsx
// ✅ useXxx 开头（必须）
export function useUserData(id: Ref<string>) {
  // ...
}

// ❌ 命名不含 use
export function fetchUserData() {}  // 这不是 composable

// ✅ 单一职责
export function usePagination(total: Ref<number>, pageSize = 20) {
  // 只做分页逻辑
}
```

### 3.2 Composable 参数设计

> 级别：Suggestion

```tsx
// ✅ 接受 ref / 普通值（使用 toRef / unref 统一处理）
export function useSearch(query: MaybeRef<string>) {
  const searchQuery = toRef(query)   // 统一为 ref
  const results = ref([])

  watch(searchQuery, async (q) => {
    if (q.length < 2) return
    results.value = await api.search(q)
  })

  return { results }
}

// ✅ 配置选项对象（超过 2 个参数时）
interface UsePollingOptions {
  interval?: number
  immediate?: boolean
  onError?: (e: Error) => void
}

export function usePolling(fetch: () => Promise<void>, options: UsePollingOptions = {}) {
  const { interval = 3000, immediate = true } = options
  // ...
}
```

### 3.3 Composable 返回值稳定

> 级别：Warning

```tsx
// ❌ 返回值结构不稳定
export function useFetch(url: MaybeRef<string>) {
  if (!url.value) {
    return { data: null, error: null }  // 不包含 loading
  }
  return { data: ref(null), loading: ref(true), error: ref(null) }
}
// 使用方每次都要处理两种形态

// ✅ 返回值结构固定
export function useFetch(url: MaybeRef<string>) {
  const data = ref(null)
  const loading = ref(true)
  const error = ref(null)
  
  watch(toRef(url), async () => {
    // ...
  }, { immediate: true })
  
  return { data, loading, error }  // 始终一致的结构
}
```

## 4. 响应式陷阱详解

### 4.1 数组变更检测

> 级别：Warning

```tsx
// ❌ 以下操作 ref/reactive 都无法自动检测
items.value[0] = newItem         // 索引赋值
items.value.length = 0            // 长度修改
items.value[Symbol.iterator]      // 不会触发更新

// ✅ 正确方式
items.value.splice(0, 1, newItem)
items.value = []
```

### 4.2 响应式数据作为 props 传入

> 级别：Suggestion

```vue
<!-- ❌ 父组件直接传递响应式引用 -->
<Child :data="reactiveObj" />
<!-- 子组件内部修改 data.props → 父组件响应式对象也被修改 -->

<!-- ✅ 只读或明确约定 -->
<!-- 父组件：只传递需要的数据 -->
<Child :data="toRefs(reactiveObj).list" />
```

## 5. 性能优化

### 5.1 何时使用 shallowRef

> 级别：Suggestion

```tsx
// ✅ 大数据列表不需要深层响应
const items = shallowRef<HeavyItem[]>([])
// items.value = newArray 触发更新
// items.value[0].name = "x" 不触发更新（不需要）

// ❌ 小对象（默认行为够用）
const user = shallowRef({ name: "", age: 0 })
```

**判断标准：** 数据结构大（>100 条）且内部字段变化不需要触发 UI 更新时使用 `shallowRef`。

### 5.2 v-memo 的使用场景

> 级别：Suggestion

```vue
<!-- v-memo：跳过特定条件不变时的整个子树渲染 -->
<div v-memo="[item.id, item.selected]">
  <!-- 只有当 item.id 或 item.selected 变化时重新渲染 -->
  <HeavyRender :data="item" />
</div>
```

**判断标准：** 仅在虚拟列表或极度复杂的 v-for 渲染中有意义。大多数场景不需要。

## 6. 文件与项目组织

### 6.1 组件文件结构

> 级别：Suggestion

```
components/
  BaseButton.vue          — 通用组件（不含业务逻辑）
  UserProfile/
    UserProfile.vue       — 业务组件
    UserAvatar.vue        — 子组件
    useUserProfile.ts     — 关联 composable
  composables/
    usePagination.ts       — 复用 composable
    useDebounce.ts
```

### 6.2 命名规范

> 级别：Warning

| 类型 | 命名 | 示例 |
|------|------|------|
| .vue 文件 | PascalCase | `UserProfile.vue` |
| composables | useXxx | `useUserData.ts` |
| stores（Pinia） | useXxxStore | `useAuthStore.ts` |
| 组件 name | PascalCase | `BaseButton` |
| 类型/接口 | PascalCase | `UserProfileProps` |
| emits 事件名 | kebab-case | `@update:model-value` |
