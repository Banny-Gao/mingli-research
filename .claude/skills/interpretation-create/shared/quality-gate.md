# 落盘前 self-check 合规门

主 agent / CLI 脚本在 Step 6 落盘前必须跑精简版 self-check。

## 实现

`scripts/lib/self-check-lite.js` 的 `runSelfCheckLite(text)` 函数：

- **致命错误（7 类）**：
  1. 元自我引用（"本解读" / "本文" / "本篇解读"）
  2. 元自我标签（【本解读...】等）
  3. 流水线术语（mode_of() / SPEC §X.X 等）
  4. 元数据块（文首 "**本篇模式**" 等）
  5. 自创案例（"试造" / "虚拟一造" 等）
  6. 流派武断（"唯一正确" 等绝对定论）
  7. 截取半句引文

- **格式错误（2 类）**：
  1. 引文未用 `>` 块引用
  2. 独立【白话】行

- **内容检查（3 项）**：v1 仅做轻量检查（v2 待 LLM 评估器集成）

- **score 计算**：
  - fatal > 0 或 format > 0 → score 3（强制重写）
  - content 0 项 → score 5
  - content 1 项 → score 4
  - content ≥ 2 项 → score 3

## 主 agent 流程（单点）

1. 跑 9 步流水线产出 interpretation.md 草稿（**不**落盘）
2. 调 `runSelfCheckLite(draft)`
3. fatal > 0 → 报告致命项 → 回 Step 5 重写（最多 3 次）
4. fatal = 0 → 准许落盘

## CLI 脚本流程（批量）

1. 调 `lib/llm-batch.js` 跑 9 步流水线
2. per-篇 `runSelfCheckLite(output)`
3. fatal > 0 → 跳过该篇 + 记日志
4. fatal = 0 → 写文件

## v1 不调 self-check-interpretation subagent

理由：self-check-interpretation 当前是 subagent 形式，CLI 脚本无法直接调。v1 在 Node 端跑精简版。v2 评估是否合并。
