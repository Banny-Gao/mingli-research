# 代码审查测试用例（参考）

## 使用说明

以下测试用例用于验证技能能否发现预设问题。每个用例包含有问题的代码片段，审查时应当检测到这些反模式。

## 用例 1：安全反模式

```tsx
// 问题：硬编码密钥
const API_KEY = "sk-abc123def456"

// 问题：XSS 风险
function renderComment(text: string) {
  element.innerHTML = text
}

// 问题：命令注入
const result = exec("ls -la " + userInput)
```

**预期捕获：**
1. Error — 硬编码密钥（common.md §2.1）
2. Error — XSS 风险（common.md §2.4）
3. Error — 命令注入风险（common.md §2.3）

## 用例 2：React Hooks 反模式

```tsx
function SearchPage() {
  // 问题：定时器未清理
  useEffect(() => {
    setInterval(() => fetchResults(), 5000)
  }, [])

  // 问题：缺少依赖
  const [data, setData] = useState(null)
  useEffect(() => {
    fetchData(id).then(setData)
  }, [])  // 缺少 id

  return <div>{data}</div>
}
```

**预期捕获：**
1. Error — timer 未清理（common.md §13 TM-1）
2. Error — useEffect 缺少依赖（react.md §2.1）

## 用例 3：命名与死代码

```tsx
import { unusedFunc } from "./utils"

const tmp = getData()  // 死代码

const usr = fetchUser()  // 命名不清
function data() {        // 函数名非动词
  return usr
}
```

**预期捕获：**
1. Warning — 未使用的 import（common.md §6）
2. Warning — 未使用变量 `tmp`
3. Suggestion — `usr` → `user`，`data` → `getUserData`

## 用例 4：样式层问题

```less
.element {
  background: #fff;         // 硬编码颜色
  .level1 {
    .level2 {
      .level3 {
        .level4 {
          // 嵌套过深
        }
      }
    }
  }
}
```

**预期捕获：**
1. Warning — 硬编码颜色，建议用 CSS 变量（styles.md §4）
2. Warning — Less 嵌套超过 4 层（styles.md §2）

## 用例 5：优雅编程

```tsx
// 问题：重复 JSX
{
  type === 'a' && <Card>{data.a}</Card>
}
{
  type === 'b' && <Card>{data.b}</Card>
}

// 问题：冗余 null 检查
if (value !== null && value !== undefined) {
  process(value)
}
```

**预期捕获：**
1. Suggestion — 重复 JSX 抽为配置数组（common.md §6 F-1）
2. Suggestion — 改用 `??` 或 `?.`（common.md §6 F-2）
