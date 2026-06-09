# self-check 自检技能设计

> **Spec Version:** 2026-06-09
> **Status:** Draft

## 1. Goal

为五术研究项目提供一套**引导式、可配置、subagent 隔离**的自检能力，覆盖内容管道的四个阶段：

- **catalog 自检**：检查 `books/{slug}/catalog.md` 元信息、表格、路径
- **source 自检**：检查 `books/{slug}/articles/{篇名}/source.md` 原文录入合规
- **interpretation 自检**：检查 `books/{slug}/articles/{篇名}/interpretation.md` 解读合规（含红线、自检清单）
- **skill 自检**：检查 `books/{slug}/articles/{篇名}/skill.md` AI 技能文件合规

每次自检必须严格遵守 `research-dispute/general.md`（含 14 条红线）+ 对应 SPEC；不传历史上下文给 subagent；输出按书聚合的 markdown 报告。

## 2. Architecture

```
.claude/skills/self-check/
├── SKILL.md                            # 主入口，4 类自检路由
│
├── shared/                             # 4 类自检的共享契约
│   ├── entrypoint.md                   # 5 步引导式状态机
│   ├── goal-loop.md                    # /goal + /loop 模式契约
│   ├── subagent-contract.md            # subagent prompt 通用契约
│   ├── books-mode.md                   # books 模式批次调度协议
│   ├── article-mode.md                 # 篇章模式单篇调度协议
│   ├── report-template.md              # 报告模板
│   └── spec-bundles.md                 # 4 类的"规范包"内容定义 + 指纹
│
├── catalog/SKILL.md                    # catalog 类自检
├── source/SKILL.md                     # source 类自检
├── interpretation/SKILL.md             # interpretation 类自检
└── skill/SKILL.md                      # skill 类自检
```

**为什么是这个形态：**

- 4 类自检的"前置规范"差异极大（catalog 走 SPEC-catalog + catalog.html，interpretation 走 SPEC-interpretation + general.md + bazi.md），共享部分只在"如何调度 subagent / 如何写报告"。
- `shared/` 是一组"片段文件"被 4 类 SKILL.md 通过相对路径引用，避免 4 份重复维护。
- 主 SKILL.md 不做实际自检，只做"用户选哪类 → 调用对应 SKILL.md"。

## 3. 4 类自检的"规范包"

| 类型 | 必含 SPEC | 必含 SKILL | 必含工具/文件 |
|------|-----------|------------|--------------|
| catalog | SPEC-catalog.md | general.md | books/{slug}/catalog.html（若存在） |
| source | SPEC-source.md | general.md | books/{slug}/articles/{篇名}/source.md |
| interpretation | SPEC-interpretation.md | general.md + bazi.md | books/{slug}/articles/{篇名}/interpretation.md |
| skill | SPEC-skill.md | general.md + bazi.md | books/{slug}/articles/{篇名}/skill.md |

**`bazi.md` 是否必含，由书的"术数"字段动态判断：**

- 子 SKILL.md 拿到书后先 Read `catalog.md` blockquote 的 `> 术数：命` 行
- 若 `术数=命` → 规范包追加 `bazi.md` 全文
- 未来扩展其他术数（紫微、六爻等）时，按相同逻辑追加对应专项文件
- 这步必须在 Step 6 路由时完成，**不**在 subagent 内动态判断

**规范包注入策略 — 完整文本内联：**

- subagent prompt **内联** 完整规范文本（不是文件路径）
- 代价：单次 5-8k tokens
- 收益：subagent 真正"通读"，不会被跳过；与 SPEC-interpretation §五 Step 1.2 "完整通读 general.md 全文"硬约束保持一致
- 替代方案（路径 + 强制 Read / 摘要 + 路径）均因"依赖 subagent 守纪"或"摘要漂移"风险被排除

## 4. 引导式入口状态机

主 SKILL.md 实现 5 步引导。每次自检都从 `/self-check` 起手。

```
[Step 1] 选类别 → AskUserQuestion 4 选 1
[Step 2] 选书籍 → 探测 books/ + Read catalog.md 元信息 + 多选
[Step 3] 选篇章 (可跳过) + 抽检
[Step 4] 模式确认（books / 篇章）
[Step 5] goal + loop
[Step 6] 路由到子 SKILL.md
```

**捷径：** Step 1 接受"类别作为命令参数"（如 `/self-check source`），跳过类别选择直接进 Step 2。其他 Step 不接受命令参数。

### 4.1 Step 1 — 类别

- 触发：用户输入 `/self-check` 或 `/自检`
- 动作：AskUserQuestion，header "类别"，4 选项 catalog/source/interpretation/skill
- 异常：用户输入 `/self-check source`（带参数）→ 跳过 Step 1，锁定 source
- 状态写：`type ∈ {catalog, source, interpretation, skill}`

### 4.2 Step 2 — 书籍

- 触发：Step 1 完成
- 动作：
  1. Bash `ls books/ | grep -v '^\.'` 探测
  2. 对每个目录 Read `catalog.md` blockquote，提取 `> 术数：...` 和 `> 类别：...`
  3. 过滤掉 catalog.md 不含合法 `术数` 字段的目录
  4. AskUserQuestion 呈现：书名（中文 `《》`）+ slug + 术数，多选
- 异常：books/ 为空 → 输出"未发现可检书籍，请先放入至少一本带 catalog.md 的书"并退出
- 状态写：`books = [{slug, title, shu}...], count = N`

### 4.3 Step 3 — 篇章 + 抽检

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

### 4.4 Step 4 — 模式确认

- 动作：单问题 AskUserQuestion "本次自检模式：books / 篇章"
- 默认推导：
  - Step 3 选篇章 + Step 2 选单书 → 默认"篇章"
  - Step 3 选篇章 + Step 2 选多书 → 默认"books"
  - Step 3 跳过（catalog）→ 默认"books"
- 用户可覆盖
- 状态写：`mode ∈ {books, article}`

### 4.5 Step 5 — goal + loop

**`goal` 字段语义：通过/收敛的判定口径。** 基准是"按规范包逐条过"，goal 决定"通过"如何定义。

`goal` 选项按 `sample_mode` **条件性显示**：

**`sample_mode = sample`（抽检）时：**
- 选项 1: "本批通过"（单次抽检全部 finding ≤ 阈值即退出）
- 选项 2: "前 N 批通过"（连续 N 批达标才退出，**默认 N=2**）
- 选项 3: "总 books 通过率"（全部 books 抽检完且总通过率 ≥ 阈值退出，**默认阈值 = 100%**，即收齐全部 books 才算通过）
- "其他" → 用户自定义补充（与"前 N 批""通过率"等概念叠加）

**`sample_mode = all`（全检）时：**
- 选项 1: "本批通过"（单次全检全部 finding ≤ 阈值即退出）
- 选项 2: "连续 N 轮自检"（连续 N 轮无新 fatal 才退出，**默认 N=2**）
- 选项 3: "全部 books 通过"（所有选中 books 全部自检完才退出）
- "其他" → 用户自定义补充

**goal 默认值：** 若用户不填，"其他"分支未选，`sample_mode=sample` 时默认选项 2（"前 N 批通过"），`sample_mode=all` 时默认选项 2（"连续 N 轮自检"）。这给"反复打磨直至收敛"一个稳妥默认。

**`loop` 字段：监督 goal 完成情况。** 在 goal 达成后，决定是否继续运行。

- loop = "达到即停"（默认）：goal 触发即终止
- loop = "达到后继续一轮"：goal 触发后跑 1 轮确认无 regression，再终止
- loop = "持续运行至用户中断"：goal 仅作日志/告警参考，运行不退出；**中断信号 = 用户在主对话输入"停""退出""abort"任意一个**，主 agent 收到后立即终止当前批次并汇总已检结果

**`loop` 与 `goal` 的关系：**
- `goal` 是 **目标**（什么算"通过"）
- `loop` 是 **监督策略**（达成目标后怎么响应）
- 两者正交：goal 选 "本批通过" + loop 选 "达到后继续一轮" = 跑两次抽检才退

### 4.6 Step 6 — 路由执行

- 动作：Read `.claude/skills/self-check/{type}/SKILL.md` 全文 → 调入上下文
- 主 agent 此时已持有完整状态：`{type, books, chapters, sample, mode, goal, loop}`
- 子 SKILL.md 接管执行

## 5. subagent 契约

### 5.1 上下文隔离

**subagent 不传历史上下文。** prompt 全文 = 角色段 + 规范包段 + 任务段 + 输出模板段。

- 不传其他 subagent 的 finding 列表
- 不传 git log
- 不传历史对话
- 唯一动态内容：本篇文件全文（由主 agent 在派发前 Read 并内联）

### 5.2 subagent prompt 标准结构

```
[角色段]
你是一个隔离的子审查员。本次任务：{type} 自检，单篇聚焦。
你只能 Read 一个文件：books/{slug}/articles/{篇名}/{source|interpretation|skill}.md
（catalog 自检：books/{slug}/catalog.html 与 catalog.md）
你不能 git log、不能 Read 历史对话、不能改任何文件。
你的输出是一份 markdown 报告，写在最终消息里。

[规范包段 - 不可省略]
> 必读：以下为本次任务必须严格遵守的规范正本

## general.md 全文
（内联）

## SPEC-{type}.md 全文
（内联）

## bazi.md 全文（若书的术数=命）
（内联，否则省略）

[任务段]
本次待检文件：{book}/{篇名}
本次自检口径：{goal 描述，含 sample_mode + goal 选项名}
（subagent 不知道"本批"还是"N 批"——这是主 agent 层的语义；subagent 只看到"按规范包逐条过"这一基准）

[输出模板]
请严格按以下 markdown 模板输出。空项写 "无"。

# {书名} — {篇名} — {type}自检报告

> subagent id：sa-{sha256(prompt+timestamp)[:8]}
> 扫描时长：{subagent 自己估算}
> 已对照规范条款：{stats.rules_evaluated 列出}

## 总览
- fatal: 0
- error: 0
- warn: 0
- info: 0

## findings

### F001 [error] 违反 §X.Y
- 位置：{file:line 或 section 名}
- 原文片段：{quote ≤80 字}
- 违反说明：{explanation}
- 建议修复：{suggested_fix - 可直接粘贴的 markdown 片段}

### F002 ...

## ⚠️ 待用户确认的修复建议
（仅当 fatal ≥1 时出现，列出全部 fatal 的 fix，供主 agent 在主对话中落盘）
（无 fatal 时此区块整段省略）

[结束]
输出完毕后不要追加任何元说明。
```

### 5.3 修复责任 — C+D 组合

**subagent 永不直接改文件。** 这是隔离的硬底线。

- subagent 报告中**所有 finding** 必填 `suggested_fix`（可粘贴的 markdown 片段）
- subagent 报告中**若发现 ≥1 个 fatal**，报告末尾追加区块 `## ⚠️ 待用户确认的修复建议`
- 主 agent 看到 fatal 区块 → **暂停** → AskUserQuestion 问"是否落盘" → 用户确认 → 主 agent 在主对话里**用 Edit 工具**改文件 → 落盘完成 → 写 commit message 草稿（不自动提交）
- non-fatal（error/warn/info）的 fix 仅在报告里呈现，**不**询问用户；用户自行决定何时处理

**为什么不直接修：**

| 方案 | 速度 | 风险 | 可控 |
|------|------|------|------|
| A. subagent 自动改 | 最高 | 改错（subagent 视角不全） | 低 |
| B. 报告带 diff 主 agent 一键 | 高 | diff 与当前文件状态可能不一致 | 中 |
| C+D（采用） | 中 | 低 | 高 |

子 agent 改文件会污染隔离语义（一个 subagent 改完，另一个 subagent 不知道文件已变）。

## 6. books 模式调度协议

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

**重抽时 prompt 调整：**

- 第二轮开始时，**复用第一轮 prompt 但调整任务段**（追加 `本次自检口径：第 N 轮`）
- 不传上轮 finding 列表（保持隔离）
- 随机种子可由用户重给或复用

**随机种子的真正用途：**

随机种子只用于"抽检 N 篇"的范围选择，**不**用于 subagent 调度顺序。理由：subagent 隔离、互不通信，调度顺序对自检结果无影响。

## 7. 篇章模式调度协议

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

## 8. 报告落盘

每本书一份：

```markdown
# {书名} — {类型}自检报告

> 生成时间：YYYY-MM-DD HH:MM
> 类型：catalog | source | interpretation | skill
> 覆盖范围：{N} 篇（books 模式）| 单篇「{篇名}」（篇章模式）
> 随机种子：{seed 或 "未指定"}
> 抽检：{全检 | 抽检 N 篇}
> goal：{用户给定 goal 选项 + 抽检模式，如 "sample + 本批通过" / "all + 连续 2 轮自检"}

## 总览

| 严重度 | 数量 | 示例 |
|--------|------|------|
| fatal  | 0    | —    |
| error  | 3    | F002 |
| warn   | 7    | F005 |
| info   | 2    | F011 |

## findings 清单

### F001 [error] 违反 §X.Y
- 书：{slug} 篇：{篇名}
- 位置：{location}
- 原文片段：{quote}
- 违反说明：{explanation}
- 建议修复：{suggested_fix}

### F002 ...
```

汇总索引 `.claude/notes/self-check/INDEX.md`：

```markdown
# 自检历史索引

| 日期 | 类型 | 书籍 | 报告 | fatal/error/warn |
|------|------|------|------|------------------|
| 2026-06-09 | source | 滴天髓阐微 | [link] | 0/2/5 |
| 2026-06-08 | interpretation | 子平真诠 | [link] | 0/1/3 |
```

## 9. 错误处理

| 失败点 | 处置 |
|--------|------|
| **Step 2 books/ 探测失败** | 输出诊断并退出 |
| **Step 3 篇名不在 catalog.md 表格里** | AskUserQuestion 警告，让用户重选 |
| **subagent 派发失败** | 标记 skipped，不重试；报告里写"X 篇未完成（subagent 失败）" |
| **subagent 输出不是合法 markdown** | 主 agent 校验模板字段，缺失则该 finding 降级为"info: 输出格式异常，需人工核对" |
| **主 agent 落盘修复时 Edit 失败** | 保留修复建议原文，报告里加 "⚠️ 落盘失败：{原因}，需人工处理" |
| **loop 运行中发生致命冲突（如上一轮 fatal 报告被本轮推翻）** | loop 立即退出，主 agent 输出"loop 因致命冲突终止"，汇总已检结果 |
| **规范包漂移（general.md / SPEC 变更）** | 子 SKILL.md 启动时校验 `spec-bundles.md` 指纹；不一致则警告用户，由用户决定继续还是用新规范重启 |

**规范包漂移防护：**

`spec-bundles.md` 里给每份规范存一个指纹。**指纹格式：** `<行数>:<sha256_hex[:16]>`，其中 sha256 输入是"前 5 个 H2 标题拼接"。子 SKILL.md 启动时算一次指纹。指纹不一致则警告用户，由用户决定继续还是用新规范重启。

## 10. 测试方案

### 10.1 4 个干跑用例（首批强制通过）

| # | 类型 | 模式 | 输入 | 通过判据 |
|---|------|------|------|----------|
| 1 | source | 篇章 | 单书单篇 | 4 步引导不出错；subagent prompt 含规范包；报告落盘；含至少 1 个 finding |
| 2 | interpretation | 篇章 | 单书单篇 | 同上 |
| 3 | catalog | books | 单本 | 同上，且跳过 Step 3 |
| 4 | skill | 篇章 | 单书单篇 | 同上 |

**通过判据统一：**
- 4 步引导不出错（用户模拟 4 步走完）
- subagent prompt 含规范包（用 subagent 输出长度粗略验证 ≥ 5k tokens 反馈）
- 报告落盘到 `.claude/notes/self-check/{书}-{type}-{date}.md`
- 报告含至少 1 个 finding（用现有真实书跑，故意找能发现的真实问题）

### 10.2 静态合规测试

不入 CI 但开发期手动跑：
- 每个子 SKILL.md 文件必含必填小节（角色段 / 规范包段 / 任务段 / 输出模板段）
- shared/ 片段文件存在性 + 引用闭合性（子 SKILL.md 引用的相对路径必须解析到真实文件）
- spec-bundles.md 指纹与正本 SPEC 同步（hash 一致）

### 10.3 后续扩展

- 4 用例全部通过后，可加 books 模式 + 抽检 + loop 干跑
- 16 用例矩阵（4 类型 × 2 模式 × 2 抽检）作为长期目标

## 11. 提交策略

- **第一批（4 个干跑用例通过后）：** 单 commit
  - `feat(self-check): 初版 4 类自检 skill，含主入口+shared+4 子 SKILL`
- **后续按 issue 演进：** 每次扩展（新增"联检"、加新术数）单开 commit

## 12. 不在范围

明确不做的事，避免 scope creep：

- 不做跨类型联检（一次跑 4 类自检）—— 引导式流程只支持单类型
- 不做 GitHub Actions 自动跑（CI 不挂自检，避免双轨维护）
- 不做"自动 commit 修复"—— 主 agent 落盘修复只生成 commit message 草稿，提交由用户决定
- 不做 subagent 之间的 finding 共享（保持隔离）
- 不做随机种子用于 subagent 调度顺序（已判定为伪需求）
- 不做引导式状态的中断恢复（5 步本身只几十秒，用户中断即视为放弃本次自检）

---

_本 spec 定义 4 类自检 skill 的设计契约，从属《research-dispute》规范体系；任何与 general.md / bazi.md / 4 份 SPEC 冲突处，以正本规范为准。_
