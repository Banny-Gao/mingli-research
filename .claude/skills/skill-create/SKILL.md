---
name: skill-create
description: 类别化 skill 创建与迭代技能。单点 + 6 步引导式状态机 + 3 门点（强装载 / 原文体检 / 落盘前），主 agent 亲自产出，按 SPEC-skill.md 严格生成 skills/{一级}/{二级}/{slug}/SKILL.md + rules/<书slug>.md。
---

# skill-create 类别化 skill 创建技能（主入口）

为五术研究项目提供**将 source.md + interpretation.md 沉淀为"类别化 AI 可执行技能"**的入口。

## 核心立场

- **单点 interactive 模式**（不批量、不派 subagent、不调批量核心库）
- **6 步引导式状态机** + **3 门点**（强装载 / 原文体检 / 落盘前）
- **严格遵守** `shared/sources/SPEC-skill.md`（v2 类别化版，录入自 `research-dispute/SPEC-skill.md`；含 rules/ 块引用格式引用 SPEC-interpretation §2.1）+ `shared/sources/general.md` + 术数专项（如 `shared/sources/bazi.md`）
- **产物**：`skills/{一级类别}/{二级类别}/{skill-slug}/SKILL.md` + `rules/<书slug>.md`
- **路径必须在 CATEGORY_TREE 注册**（副本：`shared/sources/category-tree.json`；录入自 category-tree）

## 何时使用本 skill

- 用户输入 `/skill-create` 或自然语言「写技能 / 录 skill / 创建 skill / 沉淀 skill / 写技能手册 / 迭代 skill」
- 已有 source.md + interpretation.md 存在，想进一步凝练为"AI 可执行的技能手册"
- 想在已有 `skills/{一级}/{二级}/{slug}/SKILL.md` 基础上**迭代**（新增 rules/、修订正文）

## 何时不要使用本 skill

- source.md 尚未录 → 去 source-create
- interpretation.md 尚未写 → 去 interpretation-create
- 想创建 `.claude/skills/` 下的 Claude Code skill（不是本 skill 范围；用 skill-builder）
- 想新增书籍/篇章 → 去 book-create
- 已有 skill 但只需查阅 → 直接 `cat skills/{一级}/{二级}/{slug}/SKILL.md`

---

## 6 步流程

详见 `shared/strategy.md` 概览 + `shared/gate.md` 门点模板 + `shared/skeleton.md` 落盘规则。

| Step | 动作 | 详情 |
|------|------|------|
| 1a | 选类别路径（一级+二级） | `shared/strategy.md` §Step 1a |
| 1b | 选 skill slug（中文） | `shared/strategy.md` §Step 1b |
| 1c | 选源书（≥1 本） | `shared/strategy.md` §Step 1c |
| 1d | 选/沉淀篇（每本书） | `shared/strategy.md` §Step 1d |
| 2 | 原文体检（GATE 2）| `shared/gate.md` §GATE 2 |
| 3 | 写 SKILL.md + rules/ 主体 | `shared/skeleton.md` |
| 4 | 自检（GATE 3）| v2 指纹 17 条 + `shared/gate.md` §GATE 3 |
| 5 | 落盘 | `Write skills/{一级}/{二级}/{slug}/SKILL.md` + `Write rules/<书slug>.md` + `cat -An` 验证 |
| 6 | 输出总结 | 合规分 / 耗时 / 关键改动 / CI 提示 |

**GATE 1 强装载** 在 Step 1a 之后、Step 1b 之前执行。详见 `shared/gate.md` §GATE 1。

---

## 主 agent 执行检查清单

启动本 skill 时，按顺序确认：

- [ ] 读到本 SKILL.md
- [ ] 读到 `shared/spec-bundles.md` 了解 5 份规范
- [ ] 读到 `shared/strategy.md` 了解 1a/1b/1c/1d 逻辑
- [ ] 读到 `shared/gate.md` 了解 3 门点
- [ ] 读到 `shared/skeleton.md` 了解落盘规则
- [ ] 读过 `shared/sources/SPEC-skill.md`（v2 类别化版；含 rules/ 块引用 §2.1 引用 SPEC-interpretation）

---

## 不在 scope 内

详见 SPEC-skill.md §八：

- 不创建新的 Claude Code skill
- 不写 subagent 派发逻辑
- 不调批量核心库
- 不做批量模式
- 不做干跑预览门点
- 不直接调 CI 生成流程（git commit 后自动触发）

---

## 失败处置

详见 SPEC-skill.md §九：

| 类别 | 触发 | 处置 |
|------|------|------|
| 1. CATEGORY_TREE 未注册 | 所选类别路径未在 `shared/sources/category-tree.json` 注册 | 阻断，2 选项门：先注册类别（改 category-tree 后重跑录入）/ 退出 |
| 2. 源书类别不一致 | 书的 `> 类别：X` ≠ skill 目标二级类别 | 阻断，3 选项门：调 catalog.md / 选其他书 / 退出 |
| 3. 上游缺失 | source.md / interpretation.md 不存在 | 阻断，3 选项门：调 source-create / interpretation-create / 退出 |
| 4. 指纹不通过 | v2 17 条指纹任一失败 | 4 选项门：覆盖（仅当文件已存在）/ 取消 / 回 Step 3 修复 / 退出 |
| 5. 用户中途放弃 | Step 间 `/exit` | 未落盘不保存，重启从 Step 1a 开始 |
| 6. SPEC-skill.md 缺失 | 强装载 gate 失败 | 全阻断，提示恢复 SPEC |
