---
name: source-create
description: 录入原文技能。4 源模式（URL 含 L1/L2/L3 三子模式 / 文本 / 图片-PDF / 站点分析+抓取）+ 单/批双模 + 5 步引导式状态机 + 1 次字形策略 gate + 落盘冲突 4 选项，按 SPEC-source.md 严格生成 books/{slug}/articles/{篇名}/source.md。
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
| D. 站点分析+抓取 | 书 slug + 篇章列表 | `shared/sources/script.md`（站点分析→探查→自生成） |

## 调用方式

用户输入 `/source-create` 起手。可选带参数 `/source-create url` 跳过源模式选择直接锁定。

## 5 步引导式流程

```
[Step 1] 选模式 ──→ [Step 2] 选源模式 ──→ [Step 3] 站点分析+抓取 ─→ [Step 4] 字形 gate ─→ [Step 5] 落盘
   │ 2 选 1         │ 4 选 1              │ 模式 D 拆 3.1-3.5   │ 仅简体规范化时     │ 冲突 4 选项
   │ 单/批          │ URL/文本/图/站点   │ 见 shared/sources/  │ v1 不自动 t2s     │ 覆盖/备份/取消/退
   └────────────────┴──────────────────────┴────────────────────┴────────────────────┴────────────
   shortcut: /source-create {single|batch}    /source-create {A|B|C|D}
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
| D. 站点分析+抓取 | 收 slug + 篇章列表（dry-run 后实跑）|

状态写：`source_input`

### Step 4 — 字形策略 gate

- 读 `books/{slug}/catalog.md` blockquote 的 `字形策略` 字段
- 校验 `shared/spec-bundles.md` 指纹（动态化：跑 `scripts/self-check-fingerprint.py` 实时取指纹，与上轮对比）
- `原文照录` → 直接进 Step 5
- `简体规范化` → 提示用户"建议走支持 t2s 的批量抓取通道，或手动用项目内繁简转换工具处理已录文件"；v1 不自动 t2s
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
| 模式 D：站点分析+抓取 | `shared/sources/script.md` |

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
| 站点分析+抓取后产出校验失败 | 报告详情，让用户决定 |
| 规范包指纹漂移 | 警告用户决定 |

详见 `shared/` 下各契约文件。

### Step 3 子步骤（模式 D 专用）

- **Step 3.1 站点分析**：读 catalog.html 1-2 篇 URL → LLM 推断 siteType / urlPattern / isSSR / hasPagination
- **Step 3.2 探查现有抓取工具**：扫 `scripts/` 子树 `.js` 文件，识别 fetch/scrape/crawl/source 类工具（详见 `shared/sources/probe.md`）
- **Step 3.3 决策路由**：复用 / 建议补 extractor / 自生成（三选一）
- **Step 3.4 自生成临时脚本**：加载 `shared/sources/scratch-template.md` prompt → LLM 生成一次性 Node 脚本 → 落 `.scratch/<slug>-<YYYYMMDD>.js` → `node --check` 自检
- **Step 3.5 dry-run 合并 gate**：AskUserQuestion 一次性确认范围 + 抓取方式 + 执行权
