---
name: skill-create
description: 技能文章生成技能。单点 + 6 步引导式状态机 + 3 门点（强装载 / 原文体检 / 落盘前），主 agent 亲自产出，按 SPEC-skill.md 严格生成 books/{slug}/articles/{篇名}/skill.md。
---

# skill-create 技能文章生成技能

为五术研究项目提供**将 source.md + interpretation.md 沉淀为"技能型文章"**的入口。

## 核心立场

- **单点 interactive 模式**（不批量、不派 subagent、不调 llm-batch.js）
- **6 步引导式状态机** + **3 门点**（强装载 / 原文体检 / 落盘前）
- **严格遵守** `research-dispute/SPEC-skill.md` + `research-dispute/general.md` + 术数专项（如 `bazi.md`）
- **产物**：`books/{slug}/articles/{篇名}/skill.md`

## 何时使用本 skill

- 用户输入 `/skill-create` 或自然语言「写技能文章 / 录技能 / 创建 skill.md / 沉淀 skill / 写技能手册」
- 已有 source.md + interpretation.md 存在，想进一步凝练为"AI 可执行的技能手册"

## 何时不要使用本 skill

- source.md 尚未录 → 去 source-create
- interpretation.md 尚未写 → 去 interpretation-create
- 想创建 `.claude/skills/` 下的 Claude Code skill（不是本 skill 的范围）

## 6 步流程

详见 `shared/strategy.md` 概览 + `shared/gate.md` 门点模板 + `shared/skeleton.md` 落盘规则。

| Step | 动作 | 详情 |
|------|------|------|
| 1a | 选书 | `shared/strategy.md` §Step 1a |
| 1b | 选/沉淀篇 | `shared/strategy.md` §Step 1b |
| 2 | 原文体检（GATE 2）| `shared/gate.md` §GATE 2 |
| 3 | 写 skill.md 主体 | `shared/skeleton.md` |
| 4 | 自检（GATE 3）| `shared/skeleton.md` §14 指纹 + `shared/gate.md` §GATE 3 |
| 5 | 落盘 | `Write books/{slug}/articles/{篇名}/skill.md` + `cat -An` 验证 |
| 6 | 输出总结 | 合规分 / 耗时 / 关键改动 |

**GATE 1 强装载** 在 Step 1a 后、Step 1b 前执行。详见 `shared/gate.md` §GATE 1。

## 主 agent 执行检查清单

启动本 skill 时，按顺序确认：

- [ ] 读到本 SKILL.md
- [ ] 读到 `shared/spec-bundles.md` 了解 4 份规范
- [ ] 读到 `shared/strategy.md` 了解 1a/1b 逻辑
- [ ] 读到 `shared/gate.md` 了解 3 门点
- [ ] 读到 `shared/skeleton.md` 了解落盘规则

## 不在 scope 内

详见 spec §9：

- 不创建新的 Claude Code skill
- 不写 subagent 派发逻辑
- 不调 `scripts/lib/llm-batch.js`
- 不写 `SPEC-skill-create.md`
- 不做批量模式
- 不做干跑预览门点
- 不做跨书聚合型 skill

## 失败处置

详见 spec §5：

| 类别 | 触发 | 处置 |
|------|------|------|
| 1. 上游缺失 | source.md / interpretation.md 不存在 | 阻断，3 选项门（调上游 skill / 取消 / 退出）|
| 2. 指纹不通过 | Step 4 self-check 失败 | 4 选项门（覆盖 / 备份 / 取消 / 退出）|
| 3. 用户中途放弃 | Step 间 `/exit` | 未落盘不保存，重启从 Step 1a 开始 |
| 4. SPEC-skill.md 缺失 | 强装载 gate 失败 | 全阻断，提示恢复 SPEC |
