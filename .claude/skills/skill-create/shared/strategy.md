# 模式选择 + 6 步流程总览

skill-create 仅支持**单点 interactive 模式**。主 agent 按本模板引导。

## Step 1a：选书

**AskUserQuestion：**

- Q: 「请选择书目 slug（books/ 下的目录名）」
- 列出 `books/*` 下的所有 slug（用 Glob 扫描）
- 选项：每个 slug 一项 + 「其他」兜底

输出：`slug`（如「滴天髓阐微」）。

## Step 1b：选/沉淀篇

如用户 `/skill-create {slug} {篇名}` 提供了篇名 → 跳过本步。

如未提供篇名 → 扫 `books/{slug}/articles/`，分三类列出：

| 类型 | 触发条件 | 提示语 |
|------|----------|--------|
| 已有 skill.md | `articles/{篇名}/skill.md` 存在 | 「本篇已有 skill.md，是否调整？」 |
| 未沉淀 skill | `articles/{篇名}/source.md` 存在但无 `skill.md` | 「本篇已录原文未沉淀技能，是否沉淀？」 |
| 全未录 | `articles/{篇名}/source.md` 不存在 | 「本篇尚未录原文，请先去 source-create」 |

**AskUserQuestion 选项：**

- A. 选已有 skill.md（列具体篇名）
- B. 选未沉淀篇（列具体篇名）
- C. 退出（先去 source-create）

输出：`篇名`。

## 6 步流程总览

| Step | 名称 | 门点 | 输出 |
|------|------|------|------|
| 1a | 选书 | — | slug |
| 1b | 选/沉淀篇 | — | 篇名 |
| 2 | 原文体检 | GATE 2 | 上游存在性确认 |
| 3 | 写 skill.md 主体 | — | 草稿（在上下文）|
| 4 | 自检 | GATE 3 | 14 指纹通过 |
| 5 | 落盘 | — | 写入文件 |
| 6 | 输出总结 | — | 用户报告 |

**GATE 1（强装载）** 在 Step 1a 之后、Step 1b 之前执行。详见 `gate.md`。
