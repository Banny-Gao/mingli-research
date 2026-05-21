# coding-compliance 规范增强设计

> **Spec Version:** 2026-05-21
> **Status:** Approved

## 1. Goal

在 `coding-compliance` 技能中新增"优雅编程"规范层，涵盖代码风格偏好、ES 新特性、设计模式、TypeScript 技巧、React Hooks、错误处理、防御式编程、DRY 检测、循环性能、定时器、浏览器新特性、移动端兼容性等多个维度。全部规则为 **Warning 级**，检测到提示修复但不阻塞。

## 2. Architecture

```
coding-compliance/
├── SKILL.md          # 执行流程不变，新增优雅规则入口
└── RULES/
    ├── common.md     # 新增 §9-§21
    ├── frontend.md   # 保持
    ├── react.md      # 保持
    ├── styles.md     # 保持
    └── backend.md    # 保持
```

## 3. ES Environment Detection

### 3.1 检测流程

```
读取 tsconfig.json
    ↓
提取 target / lib / module
    ↓
判断最高支持 ES 版本
    ↓
每条规则标注最低版本要求
    ↓
若规则要求 > 当前支持 → 标记 ⚠️[需确认]
```

### 3.2 不支持时的处理

```
检测到规则需要 ES20xx，但配置仅支持 ES20yy
    ↓
报告：⚠️ [环境限制] 此规则需要 {version}，当前配置为 {current}
    ↓
用户选择：
  A. 保持现状（跳过此规则）
  B. 升级 target（展示 diff，用户确认后修改 tsconfig）
```

## 4. Rule Modules

### §9 优雅编程（代码风格偏好）

| 规则 | 描述                      | 最低 ES | 修复示例                                          |
| ---- | ------------------------- | ------- | ------------------------------------------------- |
| F-1  | 重复 JSX 抽为配置数组     | ES2015  | 两个 related-tags 块 → `[config].map()`           |
| F-2  | 冗余 if 改可选链/空值合并 | ES2020  | `x !== null && x !== undefined` → `x ?? default`  |
| F-3  | 简单条件用三元/switch     | ES2015  | `if(a){b}else{c}` → `a?b:c`                       |
| F-4  | 函数式组件用箭头函数      | ES2015  | `function Foo(){...}` → `const Foo = () => {...}` |
| F-5  | 循环改 Array 方法         | ES2015  | `for(let i=0;i<n;i++)` → `arr.map/filter/reduce`  |
| F-6  | 对象解构 + 重命名         | ES2015  | `const a = obj.a` → `const { a: b } = obj`        |
| F-7  | 复杂条件抽为 useMemo/变量 | ES2015  | 内联逻辑 → `const cond = useMemo(...)`            |

### §10 ES 新特性

| 规则 | 描述                         | 最低 ES | 修复示例                                            |
| ---- | ---------------------------- | ------- | --------------------------------------------------- |
| N-1  | 可选链 `?.`                  | ES2020  | `obj && obj.prop` → `obj?.prop`                     |
| N-2  | 空值合并 `??`                | ES2020  | `x === null ? default : x` → `x ?? default`         |
| N-3  | 逻辑赋值 `??=` / `&&=`       | ES2020  | `if (x === null) x = default` → `x ??= default`     |
| N-4  | Object.hasOwn()              | ES2022  | `obj.hasOwnProperty(k)` → `Object.hasOwn(obj, k)`   |
| N-5  | Array.at(-1)                 | ES2022  | `arr[arr.length-1]` → `arr.at(-1)`                  |
| N-6  | String.replaceAll()          | ES2021  | `str.replace(/a/g,'b')` → `str.replaceAll('a','b')` |
| N-7  | 链式可选调用 `?.[]` / `?.()` | ES2020  | 深度属性/方法安全访问                               |
| N-8  | for-of 遍历                  | ES2015  | `for (let i=0;i<n;i++)` → `for (const item of arr)` |
| N-9  | Array.flat / flatMap         | ES2019  | 嵌套数组展平                                        |
| N-10 | Promise.allSettled           | ES2021  | 处理部分失败的异步场景                              |
| N-11 | top-level await              | ES2022  | 模块顶层异步初始化                                  |
| N-12 | BigInt                       | ES2020  | 大数运算                                            |
| N-13 | import.meta                  | ES2020  | 浏览器端环境变量（替代 process.env）                |
| N-14 | 数字分隔符                   | ES2021  | `1_000_000` 增强大数可读性                          |

### §11 设计模式

| 规则 | 描述          | 检测点                                        |
| ---- | ------------- | --------------------------------------------- |
| DP-1 | Repository    | localStorage 操作散落 → 抽象数据访问层        |
| DP-2 | Observer      | 跨组件状态同步 → 事件驱动，避免 prop drilling |
| DP-3 | State Machine | 状态流转边界不清 → 明确状态与转换条件         |
| DP-4 | Composition   | 组件逻辑复用 → compound components            |
| DP-5 | Command       | 操作可撤销/重做 → 批注历史、阅读记录          |
| DP-6 | Builder       | 复杂对象构建 → 搜索查询、导出配置             |
| DP-7 | Memento       | 状态快照 → 阅读进度回滚                       |

**检测规范：**
| 检测点 | 反模式 | 优雅模式 |
|--------|--------|---------|
| 多 if/switch | `if/else` 超过 3 个 | 用 Map 对象替代 |
| 硬编码算法 | 内联排序逻辑 | 提取为独立策略函数 |
| 魔法类型 | `sortType === 'name'` 散落 | 用 `as const` + 类型安全 |

### §12 TypeScript 优雅

| 规则 | 描述                                                  |
| ---- | ----------------------------------------------------- |
| T-1  | 联合类型替代多分支 if                                 |
| T-2  | 映射类型 `Record<K,V>` / `Partial<T>` / `Required<T>` |
| T-3  | 条件类型 `T extends U ? X : Y`                        |
| T-4  | `infer` 提取类型                                      |
| T-5  | 避免 `as` 类型断言                                    |
| T-6  | utility types 复用（Pick/Omit/Exclude/Extract）       |

### §13 React Hooks 规范

| 规则 | 描述                                       |
| ---- | ------------------------------------------ |
| H-1  | 自定义 hooks 提取重复逻辑                  |
| H-2  | useCallback/useMemo 使用边界（不过度优化） |
| H-3  | useEffect 依赖完整性                       |
| H-4  | hooks 组合模式（一个组件组合多个 hooks）   |
| H-5  | 状态不可变更新                             |

### §14 错误与边界处理

| 规则 | 描述                           |
| ---- | ------------------------------ |
| E-1  | try-catch 边界清晰，异常不静默 |
| E-2  | fetch/async 有降级方案         |
| E-3  | 异常信息不泄露敏感内容         |
| E-4  | 降级 UI 有反馈机制             |

### §15 防御式编程

| 规则 | 描述                         |
| ---- | ---------------------------- |
| DF-1 | 参数校验早期 return          |
| DF-2 | 边界检查（数组索引/空值）    |
| DF-3 | null 安全（可选链/空值合并） |
| DF-4 | 外部输入校验                 |

### §16 DRY 检测

| 规则 | 描述               |
| ---- | ------------------ |
| D-1  | 跨文件重复逻辑提取 |
| D-2  | 相似组件合并       |
| D-3  | 重复类型定义统一   |

### §17 循环与性能

| 规则 | 描述                   |
| ---- | ---------------------- |
| L-1  | while 能解决的不用递归 |
| L-2  | 循环不变式外提         |
| L-3  | 避免 O(n²) 嵌套循环    |

### §18 定时器规范

| 规则 | 描述                                                   |
| ---- | ------------------------------------------------------ |
| TM-1 | setTimeout/interval 及时清理，useEffect 必须有 cleanup |
| TM-2 | 滚动事件/高频事件用节流/防抖                           |

### §19 浏览器新特性

| 规则 | 描述                  | 适用场景        |
| ---- | --------------------- | --------------- |
| B-1  | RequestAnimationFrame | 动画/滚动优化   |
| B-2  | RequestIdleCallback   | 空闲时后台任务  |
| B-3  | MutationObserver      | DOM 变化监听    |
| B-4  | IntersectionObserver  | 懒加载/曝光统计 |

### §20 移动端兼容性

| 规则 | 描述                                              |
| ---- | ------------------------------------------------- |
| MB-1 | iOS Safari 差异处理（安全区域/橡皮筋滚动/输入框） |
| MB-2 | Android 兼容性差异（WebView 版本/CSS 支持）       |
| MB-3 | 安全区域适配（env(safe-area-inset-\*)）           |
| MB-4 | 触控事件与点击延迟（touch-action/Passive events） |

### §21 代码结构

| 规则 | 描述                              |
| ---- | --------------------------------- |
| CS-1 | 空状态提前 return                 |
| CS-2 | 条件分支嵌套 ≤3 层                |
| CS-3 | 魔法数字/字符串常量外置           |
| CS-4 | 函数 ≤30 行，副作用明确           |
| CS-5 | Import 排序（外部/内部/类型分组） |

## 5. Rule Levels

| Level      | Icon | 行为                               |
| ---------- | ---- | ---------------------------------- |
| Error      | ❌   | 阻塞性，必须修复                   |
| Warning    | ⚠️   | 建议修复（本次新增全部为 Warning） |
| Suggestion | 💡   | 改进提示                           |

## 6. Repair Constraints

### 结构变更约束

设计模式重构、重复 JSX 重构涉及结构变化，**必须提前告知用户**变更范围，不可用"自动修复"绕过。

报告格式：

```
⚠️ [结构变更] DP-1 Repository 模式
文件：src/hooks/useNotesData.ts:12
影响：提取数据访问层，抽象 localStorage 操作
是否修复？ [是/否/仅报告]
```

### ES 环境约束

检测到规则需要 ES20xx，但配置仅支持 ES20yy：

```
⚠️ [环境限制] N-5 Array.at(-1) 需要 ES2022，当前配置为 ES2020
选择： [A. 保持现状] [B. 升级 tsconfig target]
```

## 7. Self-Review Checklist

- [ ] 所有规则均标注最低 ES 版本
- [ ] 设计模式有明确检测点（反模式 vs 优雅模式）
- [ ] 结构变更规则有"需确认"标记
- [ ] TS 类型技巧规则覆盖常用场景
- [ ] 移动端兼容性规则有 iOS/Android 差异清单
