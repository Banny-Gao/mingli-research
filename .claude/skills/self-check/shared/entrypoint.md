# 引导式入口状态机契约

主 SKILL.md 实现 5 步引导式状态机。本片段是契约定义，4 类自检的子 SKILL.md 不再重复。

## 5 步流程

```
[Step 1] 选类别 → AskUserQuestion 4 选 1
[Step 2] 选书籍 → 探测 books/ + Read catalog.md 元信息 + 多选
[Step 3] 选篇章 (可跳过) + 抽检
[Step 4] 模式确认（books / 篇章）
[Step 5] goal + loop
[Step 6] 路由到子 SKILL.md
```

**捷径：** Step 1 接受"类别作为命令参数"（如 `/self-check source`），跳过类别选择直接进 Step 2。其他 Step 不接受命令参数。

## Step 1 — 类别

- 触发：用户输入 `/self-check` 或 `/自检`
- 动作：AskUserQuestion，header "类别"，4 选项 catalog/source/interpretation/skill
- 异常：用户输入 `/self-check source`（带参数）→ 跳过 Step 1，锁定 source
- 状态写：`type ∈ {catalog, source, interpretation, skill}`

## Step 2 — 书籍

- 触发：Step 1 完成
- 动作：
  1. Bash `ls books/ | grep -v '^\.'` 探测
  2. 对每个目录 Read `catalog.md` blockquote，提取 `> 术数：...` 和 `> 类别：...`
  3. 过滤掉 catalog.md 不含合法 `术数` 字段的目录
  4. AskUserQuestion 呈现：书名（中文 `《》`）+ slug + 术数，多选
- 异常：books/ 为空 → 输出"未发现可检书籍，请先放入至少一本带 catalog.md 的书"并退出
- 状态写：`books = [{slug, title, shu}...], count = N`

## Step 3 — 篇章 + 抽检

- 触发：Step 2 完成
- 分支：
  - **catalog 类型**：跳过 Step 3（catalog 不针对篇章）
  - **skill / interpretation 类型**：Bash `ls books/{slug}/articles/`，列目录名作为可选篇名；**必问且至少选 1 篇**
  - **source 类型**：默认全检（不再问篇章），直接进入 Step 4；如用户主动要求聚焦篇章，可在 Step 2 选单书时用命令参数 `/self-check source --focus` 显式进入 Step 3
- 抽检选项（条件性）：
  - 仅在 books 模式 + 总篇章数 > 5 时出现
  - "全检 / 抽检 N 篇" 两选项
  - 选"抽检 N" → 追问"随机种子"（可空，空则用 system time）
  - 抽签算法：等价 Python `random.sample(chapters, N, random=seed)`；seed 空时用 `random.SystemRandom().sample(chapters, N)`
- 异常：抽检 N 大于总篇章数 → 报"超过总数"并回退到全检
- 状态写：`chapters = [...], sample_mode ∈ {all, sample}, sample_n = N, sample_seed = seed`

## Step 4 — 模式确认

- 动作：单问题 AskUserQuestion "本次自检模式：books / 篇章"
- 默认推导：
  - Step 3 选篇章 + Step 2 选单书 → 默认"篇章"
  - Step 3 选篇章 + Step 2 选多书 → 默认"books"
  - Step 3 跳过（catalog）→ 默认"books"
- 用户可覆盖
- 状态写：`mode ∈ {books, article}`

## Step 5 — goal + loop

详见 `shared/goal-loop.md`。

## Step 6 — 路由执行

- 动作：Read `.claude/skills/self-check/{type}/SKILL.md` 全文 → 调入上下文
- 主 agent 此时已持有完整状态：`{type, books, chapters, sample, mode, goal, loop}`
- 子 SKILL.md 接管执行
