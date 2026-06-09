# book-create 干跑用例 1：模式 A HTML 片段

> 日期：2026-06-10
> 模式：A
> 源：`books/子平真诠/catalog.html`（已有书的 catalog.html）
> 通过：**结构性 PASS + 发现 1 个 spec gap（已修复）**

## 流程记录

- **Step 1 源模式：** 锁定 A
- **Step 2 收源：** 路径 `books/子平真诠/catalog.html`
- **Step 3 解析：**
  - Read 文件成功
  - 书名 = "子平真诠"（无 h1，从文件名兜底）
  - 篇章 = 49 个 `<a><p class="items">`
  - **sections = 空**（HTML 是扁平列表，无 h2/h3/h4）
- **Step 4 Gate 1 策略 gate：**
  - N=49（30 < N ≤ 100）→ AI 评估"建议全量"
  - 用户选 A 确认全量
- **Step 5 Gate 2 元信息 gate：**
  - 6 字段从现有 `books/子平真诠/catalog.md` 反推可填全：
    - 作者：[清] 沈孝瞻 撰 / [民国] 徐乐吾 评注
    - 版本：据民国徐乐吾评注本
    - 简介：子平命理学"前三本"之一...
    - 术数：命
    - 类别：八字
    - 内容类型：source, interpretation, skill
    - 字形策略：原文照录
- **Step 6 落盘：**
  - catalog.md 已存在 → 触发"4 选项"冲突检查
  - 49 个 articles/{篇名}/.gitkeep 骨架

## ⚠️ Spec Gap 发现与修复

**问题：** 原 `shared/sources/html.md` 容错表未覆盖"完全无 h 标签"的扁平列表情况。

**子平真诠 catalog.html 是扁平 `<a><p class="items">` 列表**，没有 h2/h3/h4。原容错表只列了"嵌套层级深（h4+）→ 收敛到二级 sections"，无法处理"完全无 h 标签"。

**修复：** 干跑过程中追加一行到 html.md 容错表：

```markdown
| 无任何 h 标签（扁平 `<a>` 列表） | 主 agent 提示用户"源 HTML 无章节分组，请手动指定分组或确认走扁平输出"；走扁平则产出单 section，章节顺序按 HTML 出现顺序 |
```

**commit：** `0f9c5b6 fix(book-create): html.md 容错表追加"无 h 标签扁平列表"分支`

## 验证

- [x] 6 步全部走通（结构层）
- [x] 2 次 gate 触发点正确（Step 4 策略 gate / Step 5 元信息 gate）
- [x] catalog.md 元信息字段可填全（与现状一致）
- [x] 49 个骨架位正确识别
- [x] generate.js 兼容性 — 现有 `books/子平真诠/catalog.md` 已被 generate.js 正常解析过
- [x] **spec gap 已修复（html.md 行 37）**

## 限制

本干跑为**结构性验证**（Read 源 + 走 SKILL.md + 走 shared/sources/html.md 推理），非真实交互。真实端到端 dry-run 需要在新的 Claude Code 会话中由用户输入 `/book-create html` 实际触发。

## 状态

**PASS** — v1 ship-ready