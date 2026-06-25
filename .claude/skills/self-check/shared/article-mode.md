# 篇章模式调度协议

主 agent 在篇章模式（`mode = article`）下的标准调度流程。

## 调度协议

```
主 agent
  │
  ├── A: 锁定单 (book, chapter) 组合
  ├── B: 用 Agent tool 发起 1 个 general-purpose subagent
  ├── C: 等待 subagent 返回
  ├── D: 报告落到 .claude/notes/self-check/{书}-{type}-{YYYY-MM-DD}.md（追加）
  ├── E: loop 判断
  │         - 评估 `goal` 是否达成
  │         - 退出策略按 `loop` 字段
  │         - 篇章模式默认"达到即停"；loop="持续运行至用户中断" 时问用户"是否继续下一篇"
  └── End
```

## 与 books 模式的差异

- 一次只派发 1 个 subagent（不做并发）
- 没有批次聚合阶段（无需去重）
- loop 重启时问用户"是否继续下一篇"而非"重抽一批"

## 报告落盘

- 篇章模式单次执行产出单文件
- 文件名 `{书-slug}-{type}-{date}-{篇名-slug}.md`（与 books 模式默认不重名，无需用户手动追加后缀；books 模式聚合多篇时不带 `-{篇名}`）
