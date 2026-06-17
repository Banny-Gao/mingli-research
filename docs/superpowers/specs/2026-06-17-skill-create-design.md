# skill-create 技能文章生成技能设计

> **Spec Version:** 2026-06-17
> **Status:** Draft
> **Siblings:**
> - `2026-06-10-book-create-skill-design.md`（建 catalog.md，前置依赖）
> - `2026-06-11-source-create-skill-design.md`（录 source.md，前置依赖）
> - `2026-06-14-interpretation-create-skill-design.md`（写 interpretation.md，前置依赖）
> **v1 范围：** 仅 skill-create（生产 `books/{slug}/articles/{篇名}/skill.md`）
> **核心立场：** skill-create 是与 book/source/interpretation-create 平行的「内容生产 skill」第 4 个，专攻"技能型文章"。遵守 `research-dispute/SPEC-skill.md`，不另立 SPEC-skill-create.md。

---

## 1. Goal

为五术研究项目提供**针对 source.md / interpretation.md 沉淀为"技能型文章"**的入口：

- **入口**：`/skill-create` 起手
- **模式**：单点（聚焦 1 篇）+ 主 agent 亲自干（不派 subagent，不调 llm-batch.js）
- **过程**：6 步引导式状态机（1a 选书 + 1b 选/沉淀篇 + 2 体检 + 3 写主体 + 4 self-check + 5 落盘 + 6 总结），含 3 门点（强装载 / 原文体检 / 落盘前）
- **输出**：`books/{slug}/articles/{篇名}/skill.md`
- **强约束**：每次产出严格遵守 `research-dispute/SPEC-skill.md` + `research-dispute/general.md` + 术数专项（如 `bazi.md`）
- **关键边界**：skill-create 是"内容生产 skill"，**不是**创建 `.claude/skills/` 下 Claude Code skill 的 meta-skill

---

## 2. Architecture

```
.claude/skills/skill-create/
├── SKILL.md                              # 主入口：6 步状态机
│
└── shared/
    ├── spec-bundles.md                   # 规范包（SPEC-skill + general + 术数专项）+ 14 条指纹
    ├── strategy.md                       # 单点 interactive 模式说明 + 启动命令模板
    ├── gate.md                           # 3 门点（强装载 / 原文体检 / 落盘前）模板
    ├── skeleton.md                       # skill.md 落盘规则（引用 SPEC-skill.md 章节骨架）
    └── sources/                          # 可空 / 引用三现有 skill
```

**为什么 skill-create 不需要 subagent / 脚本：**

- skill.md 是"技能型文章"，内容深度依赖主 agent 跨上下文推理（要把 source.md 原文 + interpretation.md 解读凝练为"如何独立完成 X"的步骤化指南）
- 派 subagent 会丢失跨篇的"沉淀逻辑"（同书多篇 skill 之间的指代、术语一致性）
- 单点模式 + 主 agent 亲自干 = 最低复杂度、零新基础设施

**与三现有 skill 共享但不复制：**

- `spec-bundles.md` §指纹动态化思路复用
- `gate.md` 的"冲突 4 选项"形态复用
- `skeleton.md` 的"产物骨架"形态复用
- **不**共享 `strategy.md`（单点 interactive 模式与三现有 skill 的"多模式"语义不同）
- **不**共享 `sources/`（skill-create 无"补录原文"需求）

---

## 3. 6 步状态机契约

### Step 1a — 选书

- 用户提供 `slug`（如「滴天髓阐微」「子平真诠」）
- 如未提供，扫 `books/*` 列出所有 slug 让用户选
- 输出：确认 `slug` 后进入 Step 1b

### Step 1b — 选/沉淀篇（GATE 1: 强装载 后）

- 如用户指定篇名 → 直接进入 Step 2
- 如未指定篇名 → 扫 `books/{slug}/articles/`，列出三类候选：
  1. **已有 skill.md 的篇**（让用户选「调整哪个」）
  2. **已录 source.md 但未沉淀 skill 的篇**（让用户选「沉淀哪个」）
  3. **全未沉淀的篇**（提示先去 source-create）
- 输出：确认 `篇名` 后进入 Step 2

### Step 2 — 原文体检（GATE 2: 体检）

- 必检项：
  - `books/{slug}/articles/{篇名}/source.md` 必须存在
  - `books/{slug}/articles/{篇名}/interpretation.md` 必须存在
  - `books/{slug}/catalog.md` 可选（不存在仅警告不阻断）
- **体检 gate**：
  - 全通过 → 进 Step 3
  - 缺 source.md → 阻断，给 3 选项门（调 source-create / 取消 / 退出）
  - 缺 interpretation.md → 阻断，给 3 选项门（调 interpretation-create / 取消 / 退出）

### Step 3 — 写 skill.md 主体

- 主 agent 亲自按 SPEC-skill.md 章节骨架产出
- 写完后立即 `cat -An books/{slug}/articles/{篇名}/skill.md` 自查
- 不在 session 中"先落盘再改"——所有内容在对话上下文里完成

### Step 4 — 自检（GATE 3: 落盘前）

- 14 条 SPEC-skill.md 指纹验证
- 不通过 → 4 选项门（覆盖 / 备份 / 取消 / 退出）
- 全通过 → 进 Step 5

### Step 5 — 落盘

- `Write books/{slug}/articles/{篇名}/skill.md`
- 落盘后再 `cat -An` 验一次

### Step 6 — 输出总结

- 报告：合规分、生成耗时、关键改动、与其他 skill 的交叉点
- 提示用户：「是否需要再调一版 / 调 source-create 补录上游 / 调 interpretation-create 重写解读」

---

## 4. 3 门点详细定义

### GATE 1：强装载（Step 1a 后）

- **触发**：每次进入 skill-create
- **动作**：必读 `research-dispute/SPEC-skill.md` 全文 + `research-dispute/general.md` + 术数专项（如 `bazi.md`）
- **指纹**：列出本篇要遵守的 14 条指纹到对话上下文
- **不通过**：SPEC-skill.md 缺失或被破坏 → 全阻断，提示恢复该 SPEC

### GATE 2：原文体检（Step 2）

- **触发**：每次进入 skill-create
- **动作**：检测 source.md / interpretation.md / catalog.md 存在性
- **不通过**：缺上游 → 阻断，给 3 选项门（调上游 skill / 取消 / 退出）

### GATE 3：落盘前（Step 4）

- **触发**：Step 3 写完主体后
- **动作**：14 条指纹 + 4 选项门（覆盖 / 备份 / 取消 / 退出）
- **不通过**：指纹不达标 → 回 Step 3 修复

---

## 5. 错误处理与失败模式

| 类别 | 触发 | 处置 |
|------|------|------|
| 1. 上游缺失 | source.md / interpretation.md 不存在 | 阻断，给 3 选项门（调上游 skill / 取消 / 退出） |
| 2. 指纹不通过 | Step 4 self-check 失败 | 4 选项门（覆盖 / 备份 / 取消 / 退出），回 Step 3 |
| 3. 用户中途放弃 | 每个 Step 间 `/exit` | 未落盘内容自动不保存，重启从 Step 1 开始（不续上次的进度） |
| 4. SPEC-skill.md 缺失 | 强装载 gate 检测失败 | 全阻断，提示恢复该 SPEC |

---

## 6. 与三现有 skill 的关系

| 维度 | book-create | source-create | interpretation-create | **skill-create** |
|------|-------------|---------------|----------------------|------------------|
| 产物 | catalog.md | source.md | interpretation.md | **skill.md** |
| 状态机步数 | 6 步 | 5 步 | 6 步（单点）| **6 步** |
| 门控 | 2 | 1 | 2 | **3** |
| Subagent | ✗ | ✗ | ✓ | **✗** |
| 脚本 | ✗ | ✓ fetch-sources | ✓ llm-batch | **✗** |
| SPEC | SPEC-catalog | SPEC-source | SPEC-interpretation | **SPEC-skill** |
| 模式 | 4 源 | 4 源 | 单点 / 批量 | **仅单点** |
| 主体 | 主 agent | 主 agent | 主 agent（单点）| **主 agent** |

**关键交叉点：**

- skill-create Step 1a 扫 `books/*`（与 book-create 同源）
- skill-create Step 2 读 source.md / interpretation.md（与 interpretation-create 体检同源）
- skill-create Step 4 14 条指纹（与三现有 skill 的 14 条指纹结构对齐）

---

## 7. 测试方法

### 干测试

- 用一篇已存在的 `books/子平真诠/articles/论用神/skill.md`（如不存在则先手写一份）走一次 6 步状态机
- 验证：强装载 gate 列出 14 条指纹 / 体检 gate 检测到 source.md 存在 / self-check 通过 / 落盘后 `cat -An` 验内容不变

### 湿测试

- 选定《滴天髓阐微》中一个**未沉淀 skill** 的篇（如「气象篇」），从 0 走完 6 步状态机
- 验证：篇名推荐正确（Step 1b 候选列表合理）/ 体检 gate 阻断上游缺失 / 落盘后内容与 SPEC-skill.md 14 条指纹对齐

### 回归测试

- 与 interpretation-create 同时跑两个 skill 时 session 上下文不冲突
- 验证：跑完 interpretation-create 后立刻跑 skill-create，强装载 gate 仍能正确列出 14 条指纹

---

## 8. 实施步骤

1. **先决条件**：确认 `research-dispute/SPEC-skill.md` 存在且 §1-§6 完整（不存在则补全）
2. **写 SKILL.md**：6 步状态机主体（~200-300 行，与 interpretation-create 同量级）
3. **写 shared/ 5 份文件**：spec-bundles / strategy / gate / skeleton / sources/
4. **干测试**：选 1 篇已有 skill.md 走全流程
5. **湿测试**：选 1 篇未沉淀 skill 的篇走全流程
6. **回归测试**：与 interpretation-create 并发跑
7. **入 commit**

---

## 9. 不在 scope 内（明确不做）

- 不创建新的 Claude Code skill（不向 `.claude/skills/` 之外的目录写）
- 不写 subagent 派发逻辑
- 不调 `scripts/lib/llm-batch.js`
- 不写 `SPEC-skill-create.md`（沿用 `SPEC-skill.md`）
- 不做批量模式
- 不做干跑预览门点
- 不做跨书聚合型 skill（如「从《子平》《三命通会》共同提炼看命法」）

---

## 10. 依赖关系

- **强依赖**：`research-dispute/SPEC-skill.md` 必须存在且 §1-§6 完整
- **软依赖**：`books/{slug}/articles/{篇名}/source.md` 必须在 Step 2 体检前就绪
- **软依赖**：`books/{slug}/articles/{篇名}/interpretation.md` 必须在 Step 2 体检前就绪
- **软依赖**：`books/{slug}/catalog.md` 可选（不存在仅警告不阻断）

---

## 11. 成功标准

- skill-create 可被 `/skill-create` 触发
- 6 步状态机可在 1 个 session 内跑完
- 产出 `books/{slug}/articles/{篇名}/skill.md` 严格遵守 SPEC-skill.md 14 条指纹
- 3 门点（强装载 / 体检 / 落盘前）全部生效
- 4 错误类别全部有处置路径
- 与三现有 skill 并发跑无上下文冲突
