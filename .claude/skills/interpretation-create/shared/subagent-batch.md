# subagent 派发调度协议（批量模式入口 A）

主 agent 在批量模式做以下事。

## v1 范围

- **仅串行**（v1 不并发）
- 1 次 dispatch 1 个 subagent，subagent 内部串行跑 N 篇
- subagent 与主 agent 共享同一进程 env

## 主 agent 动作

1. **Step 1 选模式**：批量
2. **Step 2 收源**：书 slug + 篇章列表
3. **Step 3 强装载 gate**：主 agent Read 5 份规范 + 打印确认（详见 `load-gate.md`）
4. **Step 4 dry-run**：列出 N 篇 + 估算耗时（每篇 30-90s）+ 用户确认
5. **Step 5 dispatch 1 个 subagent**：
   - subagent 类型：`general-purpose`（项目内可用）
   - subagent prompt 内嵌：
     - 调 `lib/llm-batch.js` 的 `generateInterpretations({ slug, chapters, specBundle, force, onProgress, signal })`
     - specBundle 由主 agent 装订（5 份规范 Read 后传入）
     - signal 来自主 agent 的 AbortController
   - subagent 通过 `onProgress` 回调把进度回吐主 agent
6. **Step 6 收尾**：聚合 subagent 返回的 results 数组
   - 成功 N / 失败 M / 跳过 K
   - fatal 列表
   - **不**落盘报告（与 source-create / book-create 报告策略一致）

## subagent prompt 模板

```
你是 interpretation-create 批量执行 subagent。

任务：调用 scripts/lib/llm-batch.js 的 generateInterpretations()，参数：
- slug: {slug}
- chapters: [{chapter1}, {chapter2}, ...]
- specBundle: {主 agent 已装订的 5 份规范}
- force: {true|false}
- onProgress: 每完成 1 篇回调 1 次，回调参数 (current, total, chapter, status)
- signal: 主 agent 的 AbortSignal

执行：
1. 调 generateInterpretations({...})
2. 把 onProgress 回调的消息转发给主 agent（用 MCP message 工具）
3. 监听 signal，收到 abort 时优雅退出（完成当前篇后停）

返回：
- results 数组
- 每篇的 status（success / skipped / failed）
- 失败篇章的 fatal 列表
```

## 进度反馈格式

subagent 通过 onProgress 回吐：

```
▌正在处理 论用神 (3/10) ▐ status: success
```

主 agent 流式输出到聊天窗口。

## 中断语义

- 主 agent 收到 SIGINT（Ctrl-C）→ 触发 AbortController.abort()
- subagent 收到 signal → 完成当前篇后退出
- 已完成的 interpretation.md 保留（不撤销）
- 未完成的篇章记入"中断前未完成"列表，收尾报告汇总

## 与 CLI 脚本入口的差异

| 维度 | subagent 派发 | CLI 脚本 |
|------|--------------|---------|
| 用户输入 | Claude Code 会话内 `/interpretation-create batch` | 终端 `node scripts/generate-interpretations.js ...` |
| 强装载 | 主 agent Read 5 份 + 打印确认 | 脚本读 env 与 5 份规范 |
| 进度反馈 | onProgress → 主 agent 流式输出 | stdout 进度条 |
| 中断 | AbortSignal | SIGINT |
| 收尾报告 | 主 agent 聊天窗口 | 终端文本 + exit code |
| 失败重试 | lib/llm-batch.js 自带 3 次重试 + 5/4/3 自评 3 次重写 | 同（调同核心库）|
| self-check | lib/llm-batch.js 内调 Node 端精简版 | 同（无差异）|
