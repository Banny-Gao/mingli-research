---
name: source-create
description: 录入原文技能。4 源模式（URL 含 L1/L2/L3 三子模式 / 文本 / 图片-PDF / 调脚本批量）+ 单/批双模 + 5 步引导式状态机 + 1 次字形策略 gate + 落盘冲突 4 选项，按 SPEC-source.md 严格生成 books/{slug}/articles/{篇名}/source.md。
trigger: 录入|录入原文|补录|录原文
---

# source-create 录入原文技能（主入口）

本 skill 仅 source-create。**主 SKILL.md 实现完整 5 步引导式状态机 + 4 源模式路由。**

## 4 源模式

| 模式 | 输入 | 解析契约 |
|------|------|---------|
| A. URL | 用户给单篇章 URL | `shared/sources/url.md`（L1 通用 / L2 CSS 提示 / L3 JS 渲染）|
| B. 文本 | 用户给 .txt / 粘到聊天 / 给文件路径 | `shared/sources/text.md` |
| C. 图片/PDF | 用户给扫描件 | `shared/sources/image-pdf.md` |
| D. 调脚本 | 书 slug + 篇章列表 | `shared/sources/script.md`（调 fetch-sources.js）|

## 调用方式

用户输入 `/source-create` 起手。可选带参数 `/source-create url` 跳过源模式选择直接锁定。

## 5 步引导式流程

```
[Step 1] 选模式（单/批）→ AskUserQuestion 2 选 1
[Step 2] 选源模式（URL/文本/图片/调脚本）→ AskUserQuestion 4 选 1
[Step 3] 收源 + 抓取（URL 模式下 auto-detect L1/L2/L3）
[Step 4] 字形策略 gate（仅当 catalog.md 声明"简体规范化"时弹出）
[Step 5] 落盘（冲突 4 选项：覆盖/备份/取消/退出）
```

### Step 1 — 模式

- AskUserQuestion 2 选项
- 带参数 `/source-create {single|batch}` → 跳过
- 状态写：`mode ∈ {single, batch}`

### Step 2 — 源模式

- AskUserQuestion 4 选项
- 带参数 `/source-create {A|B|C|D}` → 跳过
- 状态写：`source_mode ∈ {A, B, C, D}`

### Step 3 — 收源 + 抓取

按 `source_mode` 加载 `shared/sources/{mode}.md`：

| 模式 | 动作 |
|------|------|
| A. URL | WebFetch + auto-detect L1/L2/L3（见 `shared/sources/url.md`）|
| B. 文本 | Read / 收文本 |
| C. 图片/PDF | Read 多模态 |
| D. 调脚本 | 收 slug + 篇章列表（dry-run 后实跑）|

状态写：`source_input`

### Step 4 — 字形策略 gate

- 读 `books/{slug}/catalog.md` blockquote 的 `字形策略` 字段
- 校验 `shared/spec-bundles.md` 指纹（不一致则警告）
- `原文照录` → 直接进 Step 5
- `简体规范化` → 提示用户走 fetch-sources.js 通道或手动 t2s；v1 不自动转换
- 声明缺失 → 视为 `原文照录`

### Step 5 — 落盘

- 详见 `shared/skeleton.md`
- 冲突检查：source.md 已存在 → 4 选项（覆盖/备份/取消/退出）
- 写 source.md（H1 篇名 + 正文 + 注家块）
- 输出收尾报告（不落盘，**与 self-check / book-create 报告落盘策略不同**）

## 共享契约索引

| 契约 | 路径 |
|------|------|
| 规范包 + 指纹 | `shared/spec-bundles.md` |
| 模式选择 + URL auto-detect | `shared/strategy.md` |
| 字形策略 gate + 冲突 4 选项 | `shared/gate.md` |
| source.md 落盘规则 + 红线 | `shared/skeleton.md` |
| 模式 A：URL（L1/L2/L3）| `shared/sources/url.md` |
| 模式 B：文本 | `shared/sources/text.md` |
| 模式 C：图片/PDF | `shared/sources/image-pdf.md` |
| 模式 D：调脚本批量 | `shared/sources/script.md` |

## 与其他 skill 的关系

- **book-create**：建 catalog.md 入口（前置依赖）
- **self-check**：source.md 合规扫描（后置依赖）
- **v2 siblings**：interp-create / skill-create（待 source-create 完成后设计）

## 错误处理总览

| 失败点 | 处置 |
|--------|------|
| Step 3 收源失败 | 提示换源模式，不退出 |
| Step 3 WebFetch 空 | 询问 L2/L3 |
| Step 3 L3 Playwright 失败 | 报告后退出，建议模式 C 截屏 |
| Step 4 字形"简体规范化"+ 用户不愿手动 | 询问"是否继续原文照录录入" |
| Step 5 source.md 已存在 | 4 选项 |
| Step 5 写失败 | 报告后退出 |
| 调脚本后产出校验失败 | 报告详情，让用户决定 |
| 规范包指纹漂移 | 警告用户决定 |

详见 `shared/` 下各契约文件。
