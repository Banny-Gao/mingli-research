# 模式选择 + dry-run 命令模板

主 agent 在 Step 1（单/批）按本模板引导。

## Step 1：单/批

| 模式 | 含义 | 适用 |
|------|------|------|
| 单点 | 一次只解读 1 篇 | 用户知道具体要解读哪一篇 |
| 批量 | 一次解读 N 篇（整本或子集）| 用户想批量补解读 |

**AskUserQuestion 2 选项：**
- A. 单点（聚焦 1 篇）
- B. 批量（指定书 + 篇章列表）

带参数 `/interpretation-create {single|batch}` → 跳过本步。

## 单点模式主 agent 动作摘要

1. Read `books/{slug}/articles/{篇名}/source.md` 全文
2. 强装载 5 份规范（详见 `load-gate.md`）
3. 跑 6 项原文体检（详见 `condition-check.md`）
4. 套 9 步主体流水线（详见 `pipeline.md`）
5. 落盘前 self-check 精简版（详见 `quality-gate.md`）
6. 冲突 4 选项 + Write 文件（详见 `skeleton.md`）

## 批量模式双轨入口

详见 `subagent-batch.md`（入口 A，交互式）与 `script-batch.md`（入口 B，后台/CI）。

## dry-run 命令模板

```bash
# CLI 入口
node scripts/generate-interpretations.js <slug> <chapter1>,<chapter2> --force --dry-run

# 整本所有未解读篇章
node scripts/generate-interpretations.js <slug> --dry-run
```

subagent 派发入口的 dry-run 由主 agent 在 dispatch 前打印（不调脚本）。
