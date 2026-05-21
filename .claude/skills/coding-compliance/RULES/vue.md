# Vue 专项规范

适用于 Vue 项目（Vue 3 Composition API 为主）。

## 1. Composition API 规范

### setup() 组织

- 逻辑相关的代码放在一起（而非按生命周期钩子组织）
- 响应式变量使用 `ref()` 或 `reactive()`

### Composables 命名

- 以 `use` 开头（`useUserData`, `useModalState`）
- 独立文件管理（`useXxx.ts` 或 `useXxx.vue`）

### 示例

```typescript
// 推荐：composable 独立
// composables/useCounter.ts
export function useCounter() {
  const count = ref(0)
  const increment = () => count.value++
  return { count, increment }
}

// 不推荐：逻辑散落
export default {
  setup() {
    // count 逻辑
    // user 逻辑
    // modal 逻辑
    // 全堆在一起
  },
}
```

## 2. 响应式陷阱

### ref vs reactive

- 基本类型使用 `ref()`
- 对象/数组使用 `ref()` 或 `reactive()`
- 避免解构 `reactive` 对象（丢失响应式）

### watch vs watchEffect

- 需要明确依赖时使用 `watch()`
- 副作用自动收集时使用 `watchEffect()`

### 常见错误

```typescript
// 错误：直接修改响应式对象
const state = reactive({ count: 0 })
state = { count: 1 } // 丢失响应式

// 正确：使用 ref 或替换属性
const state = ref({ count: 0 })
state.value = { count: 1 }
```

## 3. .vue 文件组织

### 单文件组件结构

```vue
<template>
  <!-- 模板内容 -->
</template>

<script setup>
// 逻辑代码
</script>

<style scoped>
/* 样式（scoped 推荐）*/
</style>
```

- template/script/style 按顺序排列
- 使用 `<script setup>` 语法糖

## 4. TypeScript 规范

### Props 类型

```typescript
// 推荐：defineProps with type
interface Props {
  title: string
  count?: number
}
const props = defineProps<Props>()

// 不推荐：any
const props = defineProps<any>()
```

### 事件类型

- 定义事件类型和接口
- 使用 `emit` 定义事件
