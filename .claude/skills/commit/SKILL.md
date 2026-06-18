---
name: commit
description: |
  交互式 Git 提交流程：自动分析变更、生成 commit 信息，勾选要执行的验证操作，确认后提交。
trigger:
  - /commit
compatibility:
  - git
  - bash
  - mcp__superpowers__*
---

# Commit Skill

交互式 Git 提交，单卡片确认，一键执行。

---

## 流程

```
S1 前置检查（自动）
    │
S2 改动分析 + 信息生成（自动）
    │
S3 确认卡片（交互）
    │
S4 执行选中操作（自动）
```

---

## S1 前置检查

自动执行以下检查，结果汇总到确认卡片：

```
☐ 当前分支（main/master 时提醒）
☐ 暂存文件列表（git diff --cached --name-only）
☐ 未暂存改动提醒（git diff --name-only）
☐ 冲突文件检查（git diff --name-only --diff-filter=U）
```

- 在 main/master 上提交时加 ⚠️ 提醒
- 有冲突文件时加 ⚠️ 提醒

### 无暂存文件时

不直接中断，主动询问用户：

```
┌──────────────────────────────────────────────────┐
│  ⚠️ 当前无已暂存的文件                             │
│                                                   │
│  以下文件有变更但未暂存:                           │
│  {列出 git diff --name-only 的结果}               │
│                                                   │
│  如何处理？                                       │
│  [A] 暂存全部变更文件（git add -A）               │
│  [B] 暂存当前会话涉及的变更文件                   │
│  [C] 手动选择要暂存的文件                         │
│  [D] 取消                                         │
└──────────────────────────────────────────────────┘
```

- 选 B 时：回顾当前对话涉及的文件路径，展示列表让用户二次确认后再 `git add`
- 选 C 时：展示全部变更文件让用户逐项勾选

---

## S2 改动分析 + 信息生成

### 改动分析

```
git diff --cached --stat
git log --oneline -5
```

输出变更概览：文件数、+行、-行、模块归属。

### 信息生成

根据 diff 内容生成符合 [commit-spec](refs/commit-spec.md) 的提交信息：

```
type(scope): description
```

| type | 适用场景 |
|------|---------|
| feat | 新功能 |
| fix | 修复 bug |
| refactor | 重构（不改变行为） |
| style | 格式调整 |
| docs | 文档 |
| test | 测试 |
| chore | 构建/工具 |

---

## S3 确认卡片

```
┌─────────────────────────────────────────────────────────┐
│  📋 提交确认                                             │
│─────────────────────────────────────────────────────────│
│  分支: {branch}                                         │
│  待提交: {n} 个文件 / +{add} -{del} 行                  │
│                                                          │
│  ✨ 建议 Commit 信息:                                     │
│  {type}({scope}): {description}                          │
│                                                          │
│  📌 可选操作（默认 A+B+C）:                              │
│  [A] format        prettier 格式化（仅变更文件）          │
│  [B] lint          eslint 检查（仅变更文件）              │
│  [C] ts-check      TypeScript 类型检查                   │
│  [D] build         构建验证                              │
│  [E] code-review   superpowers 审查变更                  │
│                                                          │
│  命令: All / None / Default / Confirm                    │
│  或输入字母组合（如 "A B C" 或 "ABC"）                    │
│─────────────────────────────────────────────────────────│
│  [修改信息] [取消]                                        │
└─────────────────────────────────────────────────────────┘
```

### 交互说明

- 输入字母组合（如 `A B C` 或 `ABC`）选择要执行的操作
- `All` — 全选，`None` — 全不选，`Default` — 默认 A+B+C
- `Confirm` — 确认执行当前选择
- `修改信息` — 重写 commit message
- `取消` — 终止流程

---

## S4 执行选中操作

按顺序执行用户选中的操作，每次只对变更文件生效：

| 操作 | 命令 |
|------|------|
| format | `prettier --write {变更文件列表}` |
| lint | `eslint --fix {变更文件列表}` |
| ts-check | `tsc --noEmit` |
| build | `npm run build` |
| code-review | 调用 superpowers:requesting-code-review |

注：commit 为流程默认操作（用户确认后自动执行），不在可选操作中列出。

### 失败处理

- 任一操作失败时展示原始输出，不强制中断
- 询问用户："format 失败了，要继续吗？[继续/跳过并继续/取消]"
- format 完成后自动 `git add` 暂存格式化后的变更

### 成功收尾

提交成功后：
- 展示 commit hash
- 提醒可推送到远程：`git push origin {branch}`

如果配置了 progress.md，记录本次提交摘要。

---

## 参考

- Commit 规范 → [refs/commit-spec.md](refs/commit-spec.md)
