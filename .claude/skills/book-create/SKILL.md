---
name: book-create
description: 建书技能。多源入口（HTML 片段/URL/图片-PDF/模糊描述）+ 6 步引导式状态机 + 2 次人工 gate，按 SPEC-catalog.md 严格生成 books/{slug}/catalog.md 与 articles/{篇名}/ 骨架。
trigger: 建书|创建书籍|新建目录
---

# book-create 建书技能（主入口）

本 skill 仅 book-create。**主 SKILL.md 实现完整 6 步引导式状态机 + 4 源模式路由。**

## 4 源模式

| 模式 | 输入 | 解析契约 |
|------|------|---------|
| A. HTML 片段 | 用户给 catalog.html 路径 | `shared/sources/html.md` |
| B. URL | 用户给目录页 URL | `shared/sources/url.md` |
| C. 图片/PDF | 用户给扫描页或 PDF | `shared/sources/image-pdf.md` |
| D. 模糊描述 | 用户口述书名/作者 | `shared/sources/fuzzy.md` |

## 调用方式

用户输入 `/book-create` 起手。可选带参数 `/book-create url` 跳过模式选择直接锁定。

## 6 步引导式流程

```
[Step 1] 选源模式 → AskUserQuestion 4 选 1
[Step 2] 收源 → 按模式收输入
[Step 3] 解析 → 填充 BookDraft 中间表示
[Step 4] 策略 gate → 全量/精选 + 候选清单
[Step 5] 元信息 gate → 6 个 blockquote 字段
[Step 6] 落盘 → catalog.md + 骨架 + 收尾报告
```

### Step 1 — 源模式

- AskUserQuestion 4 选项
- 带参数 `/book-create {A|B|C|D}` → 跳过本步
- 状态写：`source_mode ∈ {A, B, C, D}`

### Step 2 — 收源

- 按 `source_mode` 加载 `shared/sources/{mode}.md`，按其契约收输入
- 状态写：`source_input`

### Step 3 — 解析

- 主 agent 直读 `source_input` → 填充 `BookDraft`
- 校验 `shared/spec-bundles.md` 指纹（不一致则警告）
- 必填字段：title / sections
- 智能推测：author / version / intro / shu / category / contentTypes / fontStrategy
- 异常：解析出 0 篇 → 报错退出
- 状态写：`draft: BookDraft`

### Step 4 — 策略 gate

- 详见 `shared/strategy.md` 与 `shared/gate.md` 的 Gate 1
- 阈值：N ≤ 30 全量 / 30 < N ≤ 100 评估 / N > 100 精选
- AskUserQuestion 4 选项
- 状态写：`chapter_list`

### Step 5 — 元信息 gate

- 详见 `shared/gate.md` 的 Gate 2
- 6 字段：作者/版本/简介/术数/类别/内容类型
- 智能推测字段标 `[AI 推测]`
- 实时校验：shu 取值 / category 注册 / contentTypes 必含 source
- AskUserQuestion 4 选项
- 状态写：`confirmed_meta: BookDraft`

### Step 6 — 落盘

- 详见 `shared/skeleton.md`
- 冲突检查：catalog.md 已存在 → 4 选项（覆盖/备份/取消/退出）
- 创建 articles/{篇名}/.gitkeep 骨架
- 写 catalog.md
- 输出收尾报告（不落盘，**与 self-check 报告落盘策略不同**）

## 共享契约索引

| 契约 | 路径 |
|------|------|
| 规范包 + 指纹 | `shared/spec-bundles.md` |
| 模式 A：HTML 片段 | `shared/sources/html.md` |
| 模式 B：URL | `shared/sources/url.md` |
| 模式 C：图片/PDF | `shared/sources/image-pdf.md` |
| 模式 D：模糊描述 | `shared/sources/fuzzy.md` |
| 策略建议模板 | `shared/strategy.md` |
| 人工 gate 设计 | `shared/gate.md` |
| 骨架生成规则 | `shared/skeleton.md` |

## 与 self-check 的关系

- self-check 是只读契约（验证内容合规）
- book-create 是写入契约（生成内容文件）
- 两者**不共享** subagent 调度协议（book-create 不走 subagent）
- 共享资产：规范包 fingerprint 思路（但 book-create 自己的 spec-bundles.md 是精简版）

## 错误处理总览

| 失败点 | 处置 |
|--------|------|
| Step 2 源无效 | 提示换模式，不退出 |
| Step 3 解析 0 篇 | 报错退出 |
| Step 3 篇名非法字符 | 自动 sanitize；失败则报错退出 |
| Step 4 Gate 1 选 C | 开放对话模式 |
| Step 5 Gate 2 校验失败 | 标记字段"待补全" |
| Step 6 文件冲突 | 4 选项 |
| Step 6 写失败 | 报告后退出，清理已写部分 |
| 规范包指纹漂移 | 警告用户决定 |

详见 `shared/` 下各契约文件。
