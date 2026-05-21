# 例外机制

## 注释格式

### 单条规则禁用

```tsx
// @compliance-disable F-1
// 此处重复 JSX 暂不重构，历史原因
```

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
