# 引导式入口状态机契约

主 SKILL.md 实现 4 步引导式状态机。本片段是契约定义，scanner/fixer 不再重复。

## 4 步流程

```
[Step 1] 确定范围和模式 → 解析命令参数
[Step 2] 收集文件列表 → 单篇直读 / 按书 find
[Step 3] 逐文件扫描 → 按严重度收集问题
[Step 4] 模式分发执行 → 自动修复 / 交互确认 / LLM 分析
```

**状态变量：**

| 变量 | 类型 | 来源 |
|------|------|------|
| `scope` | `{file, book}` | Step 1 |
| `mode` | `{interactive, fix, analyze}` | Step 1 |
| `files` | `string[]` | Step 2 |
| `llm_enabled` | `boolean` | Step 1（`--analyze` 或交互下用户确认） |
| `issues` | `Issue[]` | Step 3 |
| `report` | `{total, fixed, skipped, pending}` | Step 4 |

## Step 1 — 确定范围和模式

- 触发：用户输入 `/format-check [--fix] [--analyze] [--book <slug>|<file-path>]`
- 解析规则：
  - 含 `--book <slug>` → scope=book, target=slug
  - 含文件路径（以 `books/` 开头或含 `.md`）→ scope=file, target=path
  - 两者皆无 → AskUserQuestion 询问范围
  - 含 `--fix` → mode=fix
  - 含 `--analyze` → mode=analyze, llm_enabled=true
  - 两者皆无 → mode=interactive
- 异常：`--fix` 和 `--analyze` 同时出现 → 报错"不能同时使用 --fix 和 --analyze"
- 异常：target 文件不存在 → 报错退出
- 异常：`--book` 的 slug 不存在于 books/ → 报错退出
- 安全闸：`--fix --book <slug>` 时，若 files 数量 > 20，先输出文件数量 + 预计修复范围（R1/R5-R7/R10/R13/R14），AskUserQuestion 确认后再执行
- 状态写：`scope, mode, target, llm_enabled`

## Step 2 — 收集文件列表

- 分支：
  - scope=file：直接读取 target 文件，files=[target]
  - scope=book：Bash `find books/{slug}/articles -name "*.md" -type f`，结果排序
- 过滤：排除非 .md 文件
- 异常：files 为空 → 报错"未发现 markdown 文件"退出
- 状态写：`files = [...]`

## Step 3 — 逐文件扫描

详见 `shared/scanner.md`。

- 对每个 file in files：
  1. Read 文件全文
  2. 按 rules/critical.md → rules/warning.md → rules/suggestion.md 顺序应用规则
  3. 每条规则返回 Issue[]：`{rule_id, severity, line_start, line_end, description, suggestion, fix_type}`
  4. 按严重度分组收集
- 状态写：`issues = [...]`

## Step 4 — 模式分发执行

详见 `shared/fixer.md`。

- 分支：
  - mode=fix：自动修复 R1 + R5-R7 + R10 + R13 + R14（跳过 R2-R4 + R8-R9 + R11-R12 + R15 + LLM）
  - mode=interactive：逐 issue 展示（按严重度排序），AskUserQuestion 逐条确认
  - mode=analyze：同 interactive，但对 R3/R4/R15 额外触发 LLM 分析
- 输出报告：
  ```
  format-check 报告
  ━━━━━━━━━━━━━━━━
  范围：books/{slug}（N 个文件）
  模式：{interactive/fix/analyze}
  ━━━━━━━━━━━━━━━━
  🔴 严重：M 个（已修复 X，跳过 Y）
  🟡 警告：N 个（已修复 X，跳过 Y）
  🔵 建议：P 个（已应用 X，跳过 Y）
  ━━━━━━━━━━━━━━━━
  总计：T 个问题，已处理 H 个
  ```
- 状态写：`report = {total, fixed, skipped, pending}`
