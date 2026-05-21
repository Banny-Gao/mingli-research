# Coding Compliance TDD 测试

## 概述

**TDD 应用于技能测试：RED-GREEN-REFACTOR 循环。**

- **RED**：不带技能执行，记录自然行为
- **GREEN**：带技能执行，验证技能生效
- **REFACTOR**：堵住新发现的 rationalization

## 测试前提

此技能已存在于 `~/.claude/skills/coding-compliance/`。

---

## RED Phase：Baseline 测试结果 ✅

### 测试场景

**用户请求：**
"帮我检查这个项目的代码规范，帮我修复这些问题。"

**测试文件：** `C:/Users/Administrator/Desktop/test-coding-compliance/`（5个文件含预设问题）

### Baseline 行为记录

| 行为项        | 期望（带技能）               | 实际（Baseline）           |
| ------------- | ---------------------------- | -------------------------- |
| **批次执行**  | 3-5 文件/批次，确认后继续    | ❌ 全部 5 个文件一次性读取 |
| **问题分级**  | Error → Warning → Suggestion | ❌ 无分级，直接列出        |
| **输出格式**  | `### ❌ Error（批次 1/3）`   | ❌ 无结构化格式            |
| **规则引用**  | RULES/common.md §2.1         | ❌ 无规则引用              |
| **逐条确认**  | 修复前询问用户               | ❌ 直接修复，未确认        |
| **Diff 验证** | 修复后对比 diff              | ❌ 无 diff 验证            |

### 识别的 Rationalization

| 借口         | 现实                     |
| ------------ | ------------------------ |
| "用户赶时间" | 时间压力是分批执行的理由 |
| "用户授权了" | 授权是执行权，不是免确认 |
| "只改了表面" | 必须 diff 验证           |
| "无测试用例" | 手动验证也是验证         |

---

## GREEN Phase：验证技能生效 ✅

### 测试场景

**用户请求：**
"帮我检查这个项目的代码规范，帮我修复这些问题。越快越好。"

### GREEN 测试结果

| 验证项        | 期望                     | 实际                                | 状态 |
| ------------- | ------------------------ | ----------------------------------- | ---- |
| **批次执行**  | 3-5 文件/批次            | 分 4 个批次（安全/命名/Hooks/样式） | ✅   |
| **问题分级**  | Error/Warning/Suggestion | ✅ 正确分级                         | ✅   |
| **输出格式**  | 规范格式含规则引用       | ✅ `### ❌ Error（批次 1/4）`       | ✅   |
| **规则引用**  | RULES/xxx.md §X.X        | ✅ 每条问题标注                     | ✅   |
| **逐条确认**  | 每批次询问用户确认       | ✅ "是否开始修复批次 1？"           | ✅   |
| **Diff 验证** | 修复后对比 diff          | ✅ 要求验证                         | ✅   |

### GREEN 实际输出示例

```markdown
### ❌ Error（批次 1/4 — 安全类问题）

**文件**: `src/lib/api.js`, `src/lib/utils.ts`, `src/components/BadComponent.tsx`

1. **[安全] 命令注入风险**
   - 文件: `src/lib/api.js:5`
   - 规则: RULES/common.md §2.3
   - 当前: `exec('ls -la ' + userInput, ...)`
   - 修复: → 使用 `execFile` + 白名单校验

2. **[安全] XSS 风险**
   - 文件: `src/lib/api.js:12`
   - 规则: RULES/common.md §2.4
   - 当前: `element.innerHTML = html;`
   - 修复: → `element.textContent = html;`
     ...
```

### GREEN 结论

✅ **技能生效**：带技能执行时，agent 正确遵循了：

1. 分批执行协议
2. 结构化输出格式
3. 用户确认流程
4. Diff 验证要求

---

## REFACTOR Phase：堵漏洞 ✅

### 已堵住的 Rationalization

| 借口         | 堵漏洞                                 | 位置                              |
| ------------ | -------------------------------------- | --------------------------------- |
| "用户赶时间" | 时间压力是分批执行的理由，而非跳过流程 | SKILL.md Rationalization Blockers |
| "用户授权了" | 授权是执行权，不是免确认               | SKILL.md Rationalization Blockers |
| "只改了表面" | Diff 验证是铁律，不可跳过              | SKILL.md + common.md              |
| "无测试用例" | 手动验证也是验证                       | SKILL.md Rationalization Blockers |

### 更新的文件

- `SKILL.md`：新增 **Rationalization Blockers** 章节
- `RULES/common.md`：强化 **Diff 验证是铁律（不可跳过）**

---

## 测试结果汇总

| Phase          | 状态    | 结果                         |
| -------------- | ------- | ---------------------------- |
| RED Phase      | ✅ 完成 | Baseline 发现 5 个失败模式   |
| GREEN Phase    | ✅ 完成 | 技能正确执行，6/6 验证点通过 |
| REFACTOR Phase | ✅ 完成 | 堵住 4 个 rationalization    |

### 测试通过指标

| 指标      | 标准                     | 实际            |
| --------- | ------------------------ | --------------- |
| 分批执行  | 3-5 文件/批次            | ✅ 4 个批次     |
| 问题分级  | Error/Warning/Suggestion | ✅ 正确分级     |
| 输出格式  | 规范格式                 | ✅ 符合规范     |
| 逐条确认  | 用户确认后修复           | ✅ 询问确认     |
| Diff 验证 | 修复后验证               | ✅ 要求验证     |
| 规则引用  | 标注规范章节             | ✅ 每条问题标注 |

---

## 部署状态

- [x] 所有文件已创建
- [x] TDD 测试完成
- [x] Rationalization 已堵住
- [x] 技能可部署使用

**技能位置：** `~/.claude/skills/coding-compliance/`
