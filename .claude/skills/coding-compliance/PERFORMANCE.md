# 性能反模式审查

> 在代码审查中识别以下性能反模式。注意：这是静态审查，关注代码结构中的性能隐患，而非运行时监控。

## 内存泄漏

| 反模式                     | 检测点                                 | 修复方式                                |
| -------------------------- | -------------------------------------- | --------------------------------------- |
| 未清理的 addEventListener  | 组件中 addEventListener 无对应 remove  | useEffect return cleanup                |
| 未清理的 setTimeout/interval | useEffect 中有定时器但无 return cleanup | 存储 timerId，return 中 clear           |
| 未 disconnnect 的 Observer | IntersectionObserver/MutationObserver 使用后未释放 | observer.disconnect() 在清理时  |
| 未中断的 fetch             | 组件卸载后仍 setState                  | AbortController + useEffect cleanup     |

## 重渲染陷阱

| 反模式                           | 检测点                           | 修复方式                         |
| -------------------------------- | -------------------------------- | -------------------------------- |
| props 传递新对象                 | `<Comp style={{...}}>` 内联对象  | 提取为常量 / useMemo             |
| props 传递内联函数               | `<Comp onClick={() => fn()}>`    | useCallback / 提取为方法引用     |
| Context 高频更新导致全树重渲染   | Context value 每次渲染重建       | useMemo 包裹 value / Context 拆分 |
| 列表 key={index}                 | map 无 key 或 key={index}        | 使用唯一标识（item.id）          |
| 不必要的大组件 re-render         | 父组件状态更新导致整棵子树重渲染 | React.memo / 状态下移            |

## 计算性能

| 反模式                     | 检测点                  | 修复方式                       |
| -------------------------- | ----------------------- | ------------------------------ |
| 嵌套循环处理同一数组       | for/for 嵌套            | Map 索引降为 O(n)              |
| 循环内重复计算             | 循环内调用 heavy()      | 循环不变式外提                 |
| 不必要递归                 | 深度递归替代循环        | 尾递归 / 迭代                  |
| 大数据未虚拟滚动           | 一次性渲染 1000+ 项     | react-window 虚拟列表          |

## 资源加载

| 反模式                   | 检测点                          | 修复方式                       |
| ------------------------ | ------------------------------- | ------------------------------ |
| 同步加载大型模块         | import at top-level             | dynamic import / lazy          |
| 图片无懒加载             | `<img>` 无 loading 属性         | loading="lazy" / IntersectionObserver |
| 路由无代码分割           | 单 bundle 包含所有页面          | React.lazy + Suspense          |
| 大依赖完整导入           | `import * from 'lodash'`        | 按需导入子模块                 |
