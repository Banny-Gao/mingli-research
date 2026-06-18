# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes.

**Tradeoff:** 这些准则偏向谨慎而非速度。对于简单任务，请自行判断。

---

## 1. 编码前先思考

**不要假设。不要隐藏困惑。主动暴露权衡。**

- 不确定时，明确说出你的假设
- 存在多种解释时，先呈现再选择
- 存在更简单方案时，主动提出
- 有不清楚的地方，停下来问

## 2. 简单优先

**只写解决当前问题所需的最小代码。不做投机性设计。**

- 不添加需求之外的功能
- 不为单次使用的代码创建抽象
- 不写不可能发生场景的错误处理
- 写 200 行能解决时，写 50 行

自问："高级工程师会觉得这太复杂吗？"如果是的，重写。

## 3. 精准修改

**只改必须改的。只清理自己的烂摊子。**

修改代码时：

- 不"优化"相邻代码、注释或格式
- 不重构没坏的东西
- 匹配现有风格，即使你会不同写法

变更后产生的孤立代码：

- 移除你变更造成的未使用项
- 不主动删除已有的死代码

检验标准：每行变更都能追溯到用户请求。

## 4. 目标驱动执行

**定义可验证的成功标准。循环验证直到达成。**

将任务转化为可验证目标：

- "添加验证" → "先写无效输入的测试，再让测试通过"
- "修复 bug" → "先写复现 bug 的测试，再让测试通过"
- "重构 X" → "确保重构前后测试都通过"

多步骤任务，列出简短计划：

1. [步骤] → 验证：[检查项]
2. [步骤] → 验证：[检查项]
3. [步骤] → 验证：[检查项]

---

## 5. 项目规范

### 5.1 开发流程

```
需求/分析 → 设计 → 文档化 → 编码 → 验证 → 提交
```

### 5.2 复杂任务

| 阶段 | 要求                                              |
| ---- | ------------------------------------------------- |
| 拆解 | 使用 sequential-thinking MCP 拆分为最小可执行步骤 |
| 执行 | 使用 superpowers write-plan 生成计划，按计划执行  |
| 审查 | 使用 superpowers code-reviewer 审核代码           |
| 测试 | 使用 superpowers TDD 能力生成测试用例             |

### 5.3 自检清单

交付前确认：

- [ ] lint：无错误
- [ ] build：构建成功
- [ ] 无硬编码敏感信息

### 5.4 详细规范

详见 `docs/` 目录。

---

**检验标准：** diff 中不必要的变更减少，因过度复杂导致的返工减少，提问出现在实施之前而非之后。

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **mingli-research** (11462 symbols, 12111 relationships, 37 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## When Debugging

1. `gitnexus_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `gitnexus_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ gitnexus://repo/mingli-research/process/{processName}` — trace the full execution flow step by step
4. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with `dry_run: false`.
- **Extracting/Splitting**: MUST run `gitnexus_context({name: "target"})` to see all incoming/outgoing refs, then `gitnexus_impact({target: "target", direction: "upstream"})` to find all external callers before moving code.
- After any refactor: run `gitnexus_detect_changes({scope: "all"})` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool | When to use | Command |
|------|-------------|---------|
| `query` | Find code by concept | `gitnexus_query({query: "auth validation"})` |
| `context` | 360-degree view of one symbol | `gitnexus_context({name: "validateUser"})` |
| `impact` | Blast radius before editing | `gitnexus_impact({target: "X", direction: "upstream"})` |
| `detect_changes` | Pre-commit scope check | `gitnexus_detect_changes({scope: "staged"})` |
| `rename` | Safe multi-file rename | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher` | Custom graph queries | `gitnexus_cypher({query: "MATCH ..."})` |

## Impact Risk Levels

| Depth | Meaning | Action |
|-------|---------|--------|
| d=1 | WILL BREAK — direct callers/importers | MUST update these |
| d=2 | LIKELY AFFECTED — indirect deps | Should test |
| d=3 | MAY NEED TESTING — transitive | Test if critical path |

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/mingli-research/context` | Codebase overview, check index freshness |
| `gitnexus://repo/mingli-research/clusters` | All functional areas |
| `gitnexus://repo/mingli-research/processes` | All execution flows |
| `gitnexus://repo/mingli-research/process/{name}` | Step-by-step execution trace |

## Self-Check Before Finishing

Before completing any code modification task, verify:
1. `gitnexus_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `gitnexus_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## Keeping the Index Fresh

After committing code changes, the GitNexus index becomes stale. Re-run analyze to update it:

```bash
npx gitnexus analyze
```

If the index previously included embeddings, preserve them by adding `--embeddings`:

```bash
npx gitnexus analyze --embeddings
```

To check whether embeddings exist, inspect `.gitnexus/meta.json` — the `stats.embeddings` field shows the count (0 means no embeddings). **Running analyze without `--embeddings` will delete any previously generated embeddings.**

> Claude Code users: A PostToolUse hook handles this automatically after `git commit` and `git merge`.

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
