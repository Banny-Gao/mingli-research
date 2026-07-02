# 规则扫描引擎契约

主 agent 对每个文件顺序执行 15 条规则的检测逻辑。

## 扫描顺序

```
R1 → R2 → R14  (critical，检测渲染阻断)
R5 → R7 → R6 → R3 → R4 → R15  (warning，检测结构/可读性)
R10 → R13 → R11 → R12 → R8 → R9  (suggestion，检测优化建议)
```

扫描顺序设计原则：
- 先检测渲染阻断问题（critical），后检测结构问题（warning），最后检测优化建议（suggestion）
- warning 中先检测确定性问题（R5 标题跳级、R7 引用挤段）再检测需要 LLM 的问题（R3、R4、R15）

## Issue 数据结构

每条规则检测后返回 Issue 列表：

```
Issue {
  rule_id: "R1".."R15",
  severity: "critical" | "warning" | "suggestion",
  file: string,           // 文件路径
  line_start: number,     // 问题起始行
  line_end: number,       // 问题结束行
  description: string,    // 问题描述（中文，一句话）
  suggestion: string,     // 修复建议（中文）
  fix_type: "auto" | "llm" | "manual",  // 修复类型
  context: string,        // 问题上下文（前后各 2 行，用于交互展示）
}
```

## 扫描性能约束

- 单文件扫描应一次性完成 15 条规则，避免多次 Read
- 规则间有依赖的（如 R3 需要知道全文标题分布），先收集元信息再判
- 大文件（>500 行）不额外限制，全量扫描

## 去重规则

- 同一行范围内同一 rule_id 只报告一次
- R10（连续空行）合并相邻空行块为一个 Issue

## 与 fixer 的接口

scanner 输出 `Issue[]` 交给 fixer。fixer 按 `fix_type` 分派：

| fix_type | 处理方式 |
|----------|----------|
| auto | fixer 直接应用修复策略 |
| llm | 仅 llm_enabled=true 时，主 agent 进行 LLM 分析后 fixer 应用 |
| manual | 仅交互模式提示，不自动修复 |
