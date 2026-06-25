```markdown
# books 模式调度协议

主 agent 在 books 模式（`mode = books`）下的标准调度流程。

## 调度协议

```
主 agent
  │
  ├── A: 解析所有待检 (book, chapter) 组合 → 列表 L
  ├── B: 抽检模式（如启用）→ 用 sample_seed 从 L 抽 N 个
  ├── C: 决定并发度 N_worker = min(5, len(L), cpu-2)
  ├── D: 用 Agent tool 一次性发起 N_worker 个 general-purpose subagent
  │         每个 subagent prompt = 契约 + 规范包 + (book, chapter) + task
  ├── E: 等待全部 subagent 返回（失败/超时的 subagent 标记为 skipped，不重试）
  ├── F: 收集 N 个 markdown 报告
  ├── G: 跨 subagent 聚合
  │         - 用 (type, book, chapter, rule, location) 五元组模糊去重
  │         - 抽取全部 fatal → 合并到"待用户确认的修复建议"区块
  │         - 生成"本书自检报告"
  │         - 落盘到 .claude/notes/self-check/{书}-{type}-{YYYY-MM-DD}.md
  ├── H: 汇总索引追加到 .claude/notes/self-check/INDEX.md
  ├── I: loop 判断
  │         - 评估 `goal` 是否达成（按所选口径计算）
  │         - 若 loop = "达到即停" + goal 达成 → 退出
  │         - 若 loop = "达到后继续一轮" + goal 达成 → 回 A 跑 1 轮确认，再退出
  │         - 若 loop = "持续运行至用户中断" → 永退出条件，仅响应用户中断
  │         - 若 goal 未达成 → 回 A
  └── End
```

## 重抽时 prompt 调整

- 第二轮开始时，**复用第一轮 prompt 但调整任务段**（追加 `本次自检口径：第 N 轮`）
- 不传上轮 finding 列表（保持隔离）
- 随机种子可由用户重给或复用

## 随机种子的真正用途

随机种子只用于"抽检 N 篇"的范围选择，**不**用于 subagent 调度顺序。理由：subagent 隔离、互不通信，调度顺序对自检结果无影响。
```
