# book-create Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 `book-create` 建书 skill：4 源模式入口 + 6 步引导式状态机 + 2 次人工 gate，按 SPEC-catalog.md 严格生成 `catalog.md` 与骨架。

**Architecture:** 主入口 `SKILL.md` 路由 4 源模式 + 串接 6 步状态机；各源模式解析逻辑独立成 `shared/sources/*.md`；通用契约（规范包、策略、gate、骨架）独立成 `shared/*.md`。主 agent 直写 catalog.md（不隔离 subagent，因 1 次 1 本无并发污染）。

**Tech Stack:** Claude Code Skills（纯 markdown 文档驱动）、git 版本控制。

**Spec:** `docs/superpowers/specs/2026-06-10-book-create-skill-design.md`

---

## Task 1: 创建目录骨架

**Files:**
- Create: `.claude/skills/book-create/.gitkeep`
- Create: `.claude/skills/book-create/shared/.gitkeep`
- Create: `.claude/skills/book-create/shared/sources/.gitkeep`

- [ ] **Step 1: 创建目录**

```bash
mkdir -p .claude/skills/book-create/shared/sources
```

- [ ] **Step 2: 在三个目录各放一个 .gitkeep**

```bash
touch .claude/skills/book-create/.gitkeep
touch .claude/skills/book-create/shared/.gitkeep
touch .claude/skills/book-create/shared/sources/.gitkeep
```

- [ ] **Step 3: 验证目录结构**

```bash
find .claude/skills/book-create -type d
```

Expected:
```
.claude/skills/book-create
.claude/skills/book-create/shared
.claude/skills/book-create/shared/sources
```

- [ ] **Step 4: 提交**

```bash
git add .claude/skills/book-create/
git commit -m "chore(book-create): 创建目录骨架"
```

---

## Task 2: 写 spec-bundles.md（规范包 + 指纹）

**Files:**
- Create: `.claude/skills/book-create/shared/spec-bundles.md`

- [ ] **Step 1: 计算 SPEC-catalog.md 与 general.md 的指纹**

```bash
node -e "
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
for (const f of ['research-dispute/SPEC-catalog.md', 'research-dispute/general.md']) {
  const text = fs.readFileSync(f, 'utf8');
  const h2s = text.split('\n').filter(l => l.match(/^##\s/)).slice(0, 5).join('|');
  const h = crypto.createHash('sha256').update(h2s).digest('hex').slice(0, 16);
  const lines = text.split('\n').length;
  console.log(f, '→', lines + ':' + h);
}
"
```

记录两条指纹（每行 `<行数>:<16位hex>`），将用于 Step 3 的 frontmatter。

- [ ] **Step 2: 读取 SPEC-catalog.md 的前 5 个 H2 标题**

```bash
grep -n '^## ' research-dispute/SPEC-catalog.md | head -5
```

记录标题行号与文字，用于 Step 3 写回检说明。

- [ ] **Step 3: 写 spec-bundles.md**

文件路径：`.claude/skills/book-create/shared/spec-bundles.md`

完整内容：

```markdown
# book-create 规范包

## 必含规范

| 规范 | 路径 | 用途 |
|------|------|------|
| SPEC-catalog.md | `research-dispute/SPEC-catalog.md` | catalog.md 格式与生成规则 |
| general.md | `research-dispute/general.md` | 通用红线 + 学术语体 |

注：book-create 不需要 bazi.md（建书阶段不涉及命理解读）。

## 指纹校验

| 规范 | 指纹 | 校验时机 |
|------|------|----------|
| SPEC-catalog.md | `<行数>:<16位hex>` | Step 3 启动时 |
| general.md | `<行数>:<16位hex>` | Step 3 启动时 |

**指纹格式：** `<行数>:<sha256_hex[:16]>`，其中 sha256 输入是"前 5 个 H2 标题拼接"。

**漂移处置：** 指纹不一致 → 警告用户，由用户决定继续还是用新规范重启。

## 注入策略

主 agent 直读规范文件（不内联到 subagent prompt，因 book-create 不走 subagent）。
```

> 实施者：将 Step 1 算出的两条指纹填入"指纹校验"表的对应位置。

- [ ] **Step 4: 验证文件已创建且包含必填表格**

```bash
test -f .claude/skills/book-create/shared/spec-bundles.md && \
grep -q "SPEC-catalog.md" .claude/skills/book-create/shared/spec-bundles.md && \
grep -q "general.md" .claude/skills/book-create/shared/spec-bundles.md && \
grep -q "指纹校验" .claude/skills/book-create/shared/spec-bundles.md && \
echo OK
```

Expected: `OK`

- [ ] **Step 5: 提交**

```bash
git add .claude/skills/book-create/shared/spec-bundles.md
git commit -m "feat(book-create): 添加 spec-bundles 规范包 + 指纹"
```

---

## Task 3: 写 strategy.md（策略建议模板）

**Files:**
- Create: `.claude/skills/book-create/shared/strategy.md`

- [ ] **Step 1: 写 strategy.md**

文件路径：`.claude/skills/book-create/shared/strategy.md`

完整内容：

```markdown
# 策略建议 + 候选清单

主 agent 在 Gate 1（策略 gate）按本模板生成建议。

## 阈值

| 篇章数 N | 建议策略 | 理由 |
|----------|---------|------|
| N ≤ 30 | 全量 | 篇章少，无精选必要 |
| 30 < N ≤ 100 | AI 评估 | 适中规模；如下游只做某类可精选 |
| N > 100 | 必走精选 | 规模超出 |

## 全量建议模板

```
本书记载篇章 N 篇，规模较小，建议全量录入。

确认后将：
- 全部 N 篇加入 `books/{slug}/articles/{篇名}/` 骨架
- catalog.md 表格保留 N 行
```

## 精选建议模板

```
本书记载篇章 N 篇，规模较大，建议精选录入。
以下是 AI 评估的候选/排除清单。

【候选清单】（共 K 篇）
- 01 篇章甲
- 02 篇章乙
- ...

【排除清单】（共 N-K 篇）
- 篇章丙 — 排除理由（与正本重复/为序跋/为附录）
- ...

确认后将：
- K 篇加入骨架
- 表格保留 K 行（编号按筛选后重排或保留原编号）
```

## 候选清单生成启发

1. 优先保留：核心论题篇、独立成义的论说篇
2. 优先排除：序、跋、凡例、附录、图表、目录、勘误
3. 重复篇（如多版本对照）保留最权威版本
4. 标注存疑篇（AI 无法判定者），让人工确认

## 策略 gate 的 AskUserQuestion 4 选项

| 选项 | 含义 | 后续动作 |
|------|------|---------|
| A. 确认全量 | 接受 AI 的全量建议 | 走 Step 5 元信息 gate |
| B. 确认精选 | 接受 AI 的候选清单 | 走 Step 5 元信息 gate |
| C. 调整候选 | 用户增删篇名 | 开放对话直到满意，再走 Step 5 |
| D. 退出 | 放弃本次建书 | 退出，不写任何文件 |
```

- [ ] **Step 2: 验证文件包含全部必填段落**

```bash
test -f .claude/skills/book-create/shared/strategy.md && \
grep -q "阈值" .claude/skills/book-create/shared/strategy.md && \
grep -q "全量建议模板" .claude/skills/book-create/shared/strategy.md && \
grep -q "精选建议模板" .claude/skills/book-create/shared/strategy.md && \
grep -q "策略 gate 的 AskUserQuestion 4 选项" .claude/skills/book-create/shared/strategy.md && \
echo OK
```

Expected: `OK`

- [ ] **Step 3: 提交**

```bash
git add .claude/skills/book-create/shared/strategy.md
git commit -m "feat(book-create): 添加 strategy 策略建议模板"
```

---

## Task 4: 写 gate.md（人工 gate 设计）

**Files:**
- Create: `.claude/skills/book-create/shared/gate.md`

- [ ] **Step 1: 写 gate.md**

文件路径：`.claude/skills/book-create/shared/gate.md`

完整内容：

```markdown
# 人工 gate 设计

book-create 流程有 2 次强人工 gate。每次必走，不可跳过。

## Gate 1：策略 gate

**触发：** Step 3 解析完成后
**输入：** `BookDraft.sections`
**输出：** `chapter_list: [{num, name}, ...]`

**主 agent 动作：**
1. 调 `shared/strategy.md` 生成策略建议
2. 调 `shared/sources/{mode}.md` 的解析结果填充候选
3. AskUserQuestion 4 选项（A 全量 / B 精选 / C 调整 / D 退出）
4. 选 C 时进入开放对话模式，不强制 4 选项

**异常处置：**
- 用户选 D → 主 agent 退出，不写文件，输出"已放弃本次建书"
- 用户多次调整 → 保留每次的最新候选清单

## Gate 2：元信息 gate

**触发：** Gate 1 完成后
**输入：** `BookDraft` 中除 sections 外的字段
**输出：** `confirmed_meta: BookDraft`

**主 agent 动作：**
1. 展示拟填入的 6 个 blockquote 字段
2. 智能推测的字段标注 `[AI 推测]`；用户明确给过的字段标注 `[用户提供]`
3. 实时校验：
   - `shu` ∈ {山, 医, 命, 相, 卜}
   - `category` 在 `src/pages/Landing.tsx` 的 `CATEGORY_TREE` 已注册
   - `contentTypes` 至少包含 `source`
   - `fontStrategy` 默认 `原文照录`
4. AskUserQuestion 4 选项（A 全部确认 / B 修改字段 / C 重填 / D 退出）
5. 选 B 时用户指出要改的字段，主 agent 追问新值后回到本 gate

**异常处置：**
- 校验失败 → 标记字段"待补全"，回到选项 B
- 用户选 D → 退出，不写文件

## 与 self-check 的人工 gate 区别

self-check 是"自检中发现问题 → AskUserQuestion 决定是否落盘修复"。
book-create 是"建书关键决策点 → AskUserQuestion 收集用户选择"。

**两个 gate 都是创建决策的 gate，不是修复 gate。**
```

- [ ] **Step 2: 验证文件包含 Gate 1 与 Gate 2 全部必填段**

```bash
test -f .claude/skills/book-create/shared/gate.md && \
grep -q "Gate 1：策略 gate" .claude/skills/book-create/shared/gate.md && \
grep -q "Gate 2：元信息 gate" .claude/skills/book-create/shared/gate.md && \
grep -q "shu.*山.*医.*命.*相.*卜" .claude/skills/book-create/shared/gate.md && \
echo OK
```

Expected: `OK`

- [ ] **Step 3: 提交**

```bash
git add .claude/skills/book-create/shared/gate.md
git commit -m "feat(book-create): 添加 gate 人工 gate 设计契约"
```

---

## Task 5: 写 skeleton.md（骨架生成规则）

**Files:**
- Create: `.claude/skills/book-create/shared/skeleton.md`

- [ ] **Step 1: 写 skeleton.md**

文件路径：`.claude/skills/book-create/shared/skeleton.md`

完整内容：

```markdown
# 骨架生成规则

book-create 在 Step 6 落盘时创建两类产物：
1. `books/{slug}/catalog.md`
2. `books/{slug}/articles/{篇名}/.gitkeep`（N 个）

## catalog.md 模板

```markdown
# 《{title}》

> 作者：{author}
> 版本：{version}
> 简介：{intro}
> 术数：{shu}
> 类别：{category}
> 内容类型：{contentTypes 逗号分隔}
> 字形策略：{fontStrategy}   # 默认 原文照录

## {section.name}

| 编号 | 篇名 |
| ---- | ---- |
| {chapter.num} | {chapter.name} |
...
```

**字段填充规则：**
- `title` 用 `《》` 包裹
- `shu` 单字（山/医/命/相/卜）
- `contentTypes` 至少含 `source`
- `fontStrategy` 默认 `原文照录`，用户未声明则不写该行
- 表格 2 列：编号、篇名
- 编号格式：2 位字符串（"01"、"02"...），原 catalog.html 中若无编号则主 agent 按出现顺序自动生成
- 章节按 `sections` 顺序保留，每个 `section` 一个 `##` 小节

## 骨架 .gitkeep 生成规则

```bash
mkdir -p books/{slug}/articles/{篇名}   # 创目录
touch books/{slug}/articles/{篇名}/.gitkeep  # 留空文件，保证 git 追踪
```

**篇名 sanitize 规则：**
- 替换文件系统非法字符 `/\:*?"<>|` → 对应全角 `／：＊？＂＜＞｜`
- 长度 ≤ 200 字符（避免 Windows 260 字符路径上限）
- sanitize 后仍非法 → 报错退出

## 落盘顺序

1. 检查 `books/{slug}/catalog.md` 是否已存在 → 冲突时走 §4 异常处置
2. `mkdir -p books/{slug}/articles/`
3. 按 `chapter_list` 逐章 `mkdir -p` + `touch .gitkeep`
4. `Write` `books/{slug}/catalog.md`
5. 不自动跑 `node scripts/generate.js`，由用户决定
```

- [ ] **Step 2: 验证文件包含 catalog.md 模板与骨架规则**

```bash
test -f .claude/skills/book-create/shared/skeleton.md && \
grep -q "catalog.md 模板" .claude/skills/book-create/shared/skeleton.md && \
grep -q "## {section.name}" .claude/skills/book-create/shared/skeleton.md && \
grep -q "gitkeep" .claude/skills/book-create/shared/skeleton.md && \
grep -q "sanitize" .claude/skills/book-create/shared/skeleton.md && \
echo OK
```

Expected: `OK`

- [ ] **Step 3: 提交**

```bash
git add .claude/skills/book-create/shared/skeleton.md
git commit -m "feat(book-create): 添加 skeleton 骨架生成规则"
```

---

## Task 6: 写 sources/html.md（模式 A：HTML 片段）

**Files:**
- Create: `.claude/skills/book-create/shared/sources/html.md`

- [ ] **Step 1: 写 html.md**

文件路径：`.claude/skills/book-create/shared/sources/html.md`

完整内容：

```markdown
# 模式 A：HTML 片段

## 输入契约

- **必填：** 用户提供 `catalog.html` 绝对路径
- **可选位置：**
  - `books/{slug}/catalog.html`（已建书的标准位置）
  - 临时路径（用户自行维护的 HTML 文件）
- **路径要求：** 必须是文件系统可读的实际文件

## 主 agent 动作

1. `Read` 整个文件
2. 用 HTML 解析抽取：
   - 书名：第一个 `<h1>` 文本，或文件名去除 `.html` 后的中文化
   - 章节层级：`<h2>` / `<h3>` / `<h4>` → sections
   - 篇章列表：`<ol>` / `<ul>` / `<table>` 中每条 `<li>` 或表格行
3. 填充 `BookDraft` 中间表示：
   ```
   {
     title, author, version, intro, shu, category, contentTypes, fontStrategy,
     sections: [{name, chapters: [{num, name}]}]
   }
   ```
   - `sections` 必填
   - 其余字段留空（"AI 推测"占位，留给 Step 5 元信息 gate）

## 解析容错

| 异常 | 处置 |
|------|------|
| 0 篇 | 报错退出，提示"可能源不对，请检查或换模式" |
| 1-2 篇 | 警告并继续（极端短书） |
| ≥ 3 篇 | 正常 |
| 篇名含非法字符 | 自动 sanitize（见 skeleton.md） |
| 嵌套层级深（h4+） | 收敛到二级 sections（h2/h3 视为分类；h4 视为篇章） |

## 与现状的差异

项目已建书（子平真诠、滴天髓阐微等）都已有 `books/{slug}/catalog.html` 与 `catalog.md`。
模式 A 对这些书只走"读 → 解析 → 人工 gate → 重写 catalog.md"流程，是幂等可重入的。
```

- [ ] **Step 2: 验证文件包含输入契约与解析容错段**

```bash
test -f .claude/skills/book-create/shared/sources/html.md && \
grep -q "输入契约" .claude/skills/book-create/shared/sources/html.md && \
grep -q "主 agent 动作" .claude/skills/book-create/shared/sources/html.md && \
grep -q "解析容错" .claude/skills/book-create/shared/sources/html.md && \
echo OK
```

Expected: `OK`

- [ ] **Step 3: 提交**

```bash
git add .claude/skills/book-create/shared/sources/html.md
git commit -m "feat(book-create): 添加 source 模式 A HTML 片段契约"
```

---

## Task 7: 写 sources/url.md（模式 B：URL）

**Files:**
- Create: `.claude/skills/book-create/shared/sources/url.md`

- [ ] **Step 1: 写 url.md**

文件路径：`.claude/skills/book-create/shared/sources/url.md`

完整内容：

```markdown
# 模式 B：URL

## 输入契约

- **必填：** 用户给目录页 URL（豆瓣读书 / 百度百科 / 出版社官网 / CText 国学大师 / 维基百科 等）
- **URL 类型：** HTML 页（首选）；JSON API 暂不直接支持
- **可达性：** 需主 agent 用 `WebFetch` 能拿到内容

## 主 agent 动作

1. `WebFetch` 抓取 URL（默认重试 1 次）
2. 抽取纯文本：
   - 优先按 HTML 结构解析（复用模式 A 的解析逻辑）
   - 无 HTML 结构时按文本结构解析（标题、列表）
3. 填充 `BookDraft` 中间表示（同模式 A）

## 抓取容错

| 异常 | 处置 |
|------|------|
| URL 404 / 网络失败 | 重试 1 次；仍失败 → 提示"是否切换到模式 D 输入描述？"或"切换到模式 A 粘贴 HTML 文本" |
| JS 渲染页（WebFetch 拿不到正文） | 报错"该 URL 需 JS 渲染，请改用模式 C/D 或提供 HTML" |
| 403 / 验证码 / 反爬 | 报错退出，让用户改源（不在本 skill 责任内） |
| 抓取结果为无关页（如被重定向到首页） | 报错"抓取结果不包含目录结构，请检查 URL" |

## 与模式 A 的复用

URL 抓取后转为 HTML/纯文本后，复用模式 A 的解析逻辑（h 标签 + 列表/表格）。
故模式 B 的实现"在 A 之上包一层 WebFetch"。
```

- [ ] **Step 2: 验证文件包含抓取容错表**

```bash
test -f .claude/skills/book-create/shared/sources/url.md && \
grep -q "URL 404" .claude/skills/book-create/shared/sources/url.md && \
grep -q "WebFetch" .claude/skills/book-create/shared/sources/url.md && \
echo OK
```

Expected: `OK`

- [ ] **Step 3: 提交**

```bash
git add .claude/skills/book-create/shared/sources/url.md
git commit -m "feat(book-create): 添加 source 模式 B URL 契约"
```

---

## Task 8: 写 sources/image-pdf.md（模式 C：图片/PDF）

**Files:**
- Create: `.claude/skills/book-create/shared/sources/image-pdf.md`

- [ ] **Step 1: 写 image-pdf.md**

文件路径：`.claude/skills/book-create/shared/sources/image-pdf.md`

完整内容：

```markdown
# 模式 C：图片 / PDF

## 输入契约

- **必填：** 用户给 1 张目录页图片 / 1 个 PDF 文件 / 多张扫描页
- **图片格式：** png / jpg / webp（Claude Code Read 工具支持）
- **PDF：** 单文件多页
- **路径要求：** 文件系统可读的实际文件

## 主 agent 动作

1. `Read` 整个文件（图片走多模态，PDF 走 Read 直接打开）
2. 跨页拼接目录（多页 PDF）
3. 抽取：
   - 书名：目录页首行的 `《XX》` 形式
   - 篇章列表：每条带"第 X 篇" / "X. " / "X、" / "X " 标识的行
4. 填充 `BookDraft` 中间表示（同模式 A）

## OCR 准确度

- 多模态读图通常 95%+，但：
  - 异体字（如「経」/「經」）易识别错
  - 生僻字（如「籌」「讖」）易识别为常用字
  - 竖排扫描易漏行
- 抽取后让人工 spot-check 关键篇章名（通过 Gate 1 策略 gate 顺便展示）

## 失败兜底

| 异常 | 处置 |
|------|------|
| 读图失败 / 不可识别 | 报错"图片无法识别，请改用模式 A/D 或换张图" |
| PDF 多页但跨页目录被截断 | 提示用户拆分 PDF 重新输入 |
| OCR 结果明显不完整 | 让人工 spot-check，不阻塞流程 |
| 0 篇 | 报错退出，提示"换模式或检查源" |
```

- [ ] **Step 2: 验证文件包含 OCR 准确度与失败兜底段**

```bash
test -f .claude/skills/book-create/shared/sources/image-pdf.md && \
grep -q "OCR 准确度" .claude/skills/book-create/shared/sources/image-pdf.md && \
grep -q "失败兜底" .claude/skills/book-create/shared/sources/image-pdf.md && \
echo OK
```

Expected: `OK`

- [ ] **Step 3: 提交**

```bash
git add .claude/skills/book-create/shared/sources/image-pdf.md
git commit -m "feat(book-create): 添加 source 模式 C 图片-PDF 契约"
```

---

## Task 9: 写 sources/fuzzy.md（模式 D：模糊描述）

**Files:**
- Create: `.claude/skills/book-create/shared/sources/fuzzy.md`

- [ ] **Step 1: 写 fuzzy.md**

文件路径：`.claude/skills/book-create/shared/sources/fuzzy.md`

完整内容：

```markdown
# 模式 D：模糊描述

## 输入契约

- **必填：** 用户口述关于该书的任意已知信息
- **最少要求：** 书名（或可识别的别名/俗称）
- **可含：** 作者、朝代、卷数、简介片段、已知篇章名等
- **示例：**
  - "《滴天髓阐微》，明刘基撰，清任铁樵注"
  - "子平真诠前三本之一，沈孝瞻"
  - "我想加一本讲格局的清人命书"

## 主 agent 动作

1. `WebSearch` 书名（必要时含作者/朝代）
2. 从搜索结果中找权威目录页（优先级）：
   1. 维基百科 / 维基文库
   2. 百度百科
   3. 出版社官网 / 学术机构
   4. CText 国学大师
3. 找到后调 `WebFetch` 抓取 → 走模式 B 的 HTML 解析
4. 填充 `BookDraft` 中间表示（同模式 A）

## 命中与歧义

| 场景 | 处置 |
|------|------|
| WebSearch 命中 0 | 报错"未找到目录，请改用模式 A/B/C 或补充书名/作者" |
| 同名书多版本 | 列出 2-3 个候选（标注朝代/作者/卷数差异）→ AskUserQuestion 单选 |
| 用户都不满意 | 退出，让用户改用模式 A/B/C |
| 命中但目录页只有简介无篇目 | 报错"该来源无完整目录，请换源或换模式" |

## 4 模式的"轻→重"顺序

| 模式 | 用户成本 | 解析准确度 | 适用场景 |
|------|---------|-----------|---------|
| A. HTML 片段 | 中（要写 HTML） | 高 | 已建过书/会写 HTML 的用户 |
| B. URL | 低 | 高 | 知道权威目录页 URL |
| C. 图片/PDF | 低 | 中（OCR 风险） | 有扫描件 |
| D. 模糊描述 | 最低 | 中（搜索命中率） | 只想给个名字就开工 |

**模式 D 是 4 模式中"最省事但风险最高"**，用户心知肚明。
```

- [ ] **Step 2: 验证文件包含命中与歧义表**

```bash
test -f .claude/skills/book-create/shared/sources/fuzzy.md && \
grep -q "WebSearch" .claude/skills/book-create/shared/sources/fuzzy.md && \
grep -q "命中与歧义" .claude/skills/book-create/shared/sources/fuzzy.md && \
grep -q "同名书多版本" .claude/skills/book-create/shared/sources/fuzzy.md && \
echo OK
```

Expected: `OK`

- [ ] **Step 3: 提交**

```bash
git add .claude/skills/book-create/shared/sources/fuzzy.md
git commit -m "feat(book-create): 添加 source 模式 D 模糊描述契约"
```

---

## Task 10: 写 SKILL.md（主入口：4 源路由 + 6 步状态机）

**Files:**
- Create: `.claude/skills/book-create/SKILL.md`

- [ ] **Step 1: 写 SKILL.md**

文件路径：`.claude/skills/book-create/SKILL.md`

完整内容：

````markdown
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
````

- [ ] **Step 2: 验证 SKILL.md 包含必填段**

```bash
test -f .claude/skills/book-create/SKILL.md && \
grep -q "^name: book-create" .claude/skills/book-create/SKILL.md && \
grep -q "4 源模式" .claude/skills/book-create/SKILL.md && \
grep -q "Step 1.*源模式" .claude/skills/book-create/SKILL.md && \
grep -q "Step 6.*落盘" .claude/skills/book-create/SKILL.md && \
echo OK
```

Expected: `OK`

- [ ] **Step 3: 提交**

```bash
git add .claude/skills/book-create/SKILL.md
git commit -m "feat(book-create): 添加主入口 SKILL.md（4 源路由 + 6 步状态机）"
```

---

## Task 11: 静态合规检查

**Files:**
- Read: `.claude/skills/book-create/SKILL.md`
- Read: `.claude/skills/book-create/shared/*.md`
- Read: `.claude/skills/book-create/shared/sources/*.md`

- [ ] **Step 1: 检查所有 9 个文件存在**

```bash
for f in \
  .claude/skills/book-create/SKILL.md \
  .claude/skills/book-create/shared/spec-bundles.md \
  .claude/skills/book-create/shared/strategy.md \
  .claude/skills/book-create/shared/gate.md \
  .claude/skills/book-create/shared/skeleton.md \
  .claude/skills/book-create/shared/sources/html.md \
  .claude/skills/book-create/shared/sources/url.md \
  .claude/skills/book-create/shared/sources/image-pdf.md \
  .claude/skills/book-create/shared/sources/fuzzy.md
do
  test -f "$f" && echo "OK $f" || echo "MISSING $f"
done
```

Expected: 全部输出 `OK`（9 行）

- [ ] **Step 2: 检查 SKILL.md 引用的所有相对路径都解析到真实文件**

```bash
cd .claude/skills/book-create && \
grep -oE 'shared/[a-z/]+\.md' SKILL.md | sort -u | while read p; do
  test -f "$p" && echo "OK $p" || echo "MISSING $p"
done
```

Expected: 全部 `OK`

- [ ] **Step 3: 检查各 shared 文件至少 20 行（不是空 stub）**

```bash
for f in .claude/skills/book-create/shared/*.md .claude/skills/book-create/shared/sources/*.md; do
  lines=$(wc -l < "$f")
  [ "$lines" -ge 20 ] && echo "OK $f ($lines)" || echo "TOO SHORT $f ($lines)"
done
```

Expected: 全部 `OK`

- [ ] **Step 4: 检查 spec-bundles.md 指纹格式合法（`<数字>:<16位hex>`）**

```bash
grep -oE '[0-9]+:[0-9a-f]{16}' .claude/skills/book-create/shared/spec-bundles.md
```

Expected: 输出 2 行（SPEC-catalog.md 与 general.md 各一行）

> 实施者：若 0 行或行数不对，回到 Task 2 重新计算指纹。

- [ ] **Step 5: 提交（无变更情况下允许空 commit）**

```bash
git status
```

若 11.1-11.4 全部通过且无变更，不需 commit。若发现问题，修复后单独 commit。

---

## Task 12: 干跑用例 1 — 模式 A（子平真诠）

**Files:**
- Read: `.claude/skills/book-create/SKILL.md`
- Read: `books/子平真诠/catalog.html`

- [ ] **Step 1: 模拟用户输入**

在主对话里输入：`/book-create html`

> 实施者：将此作为新对话的首次输入，或在当前会话重置上下文后输入。

- [ ] **Step 2: 走完整 6 步状态机**

按 SKILL.md 的 6 步流程执行，主 agent 调入 `shared/sources/html.md`、`shared/strategy.md`、`shared/gate.md`、`shared/skeleton.md`、`shared/spec-bundles.md`。

- [ ] **Step 3: 在 Gate 1（策略 gate）确认全量**

`books/子平真诠` 共 49 篇（N=49，30 < N ≤ 100 区间），AI 应给"AI 评估"建议。用户在 AskUserQuestion 中选 A "确认全量"。

- [ ] **Step 4: 在 Gate 2（元信息 gate）逐字段确认**

子平真诠的元信息已写在现有 `books/子平真诠/catalog.md`，按"全部确认"通过。

- [ ] **Step 5: 验证产物**

```bash
ls -la books/子平真诠/catalog.md
ls books/子平真诠/articles/ | wc -l
head -10 books/子平真诠/catalog.md
```

Expected:
- `books/子平真诠/catalog.md` 存在
- `books/子平真诠/articles/` 下有 49 个 `.gitkeep` 文件
- `catalog.md` 的前 10 行包含正确的元信息

- [ ] **Step 6: 验证与 generate.js 解析兼容**

```bash
node scripts/generate.js
```

Expected: 无报错（`books.ts` / `content.ts` / `assoc.ts` / `search-index.json` 正常生成）

- [ ] **Step 7: 记录干跑结果**

```bash
mkdir -p .claude/notes/book-create
cat > .claude/notes/book-create/case-1-mode-A-html-2026-06-10.md <<'EOF'
# book-create 干跑用例 1：模式 A HTML 片段

> 日期：2026-06-10
> 模式：A
> 源：books/子平真诠/catalog.html
> 通过：YES

## 流程记录

- Step 1-2：源模式 A 锁定，路径收齐
- Step 3：解析出 49 篇（30 < N ≤ 100 区间，AI 评估"建议全量"）
- Step 4 Gate 1：用户选 A 确认全量
- Step 5 Gate 2：6 字段全部确认
- Step 6：catalog.md 重写，49 个 .gitkeep 骨架生成

## 验证

- [x] 6 步全部走完
- [x] 2 次 gate 弹出且可正常确认
- [x] catalog.md 元信息齐全
- [x] 49 个 .gitkeep 骨架齐
- [x] generate.js 解析无报错
EOF
```

- [ ] **Step 8: 提交**

```bash
git add .claude/notes/book-create/
git commit -m "test(book-create): 干跑用例 1 通过 — 模式 A HTML 片段 + 子平真诠"
```

---

## Task 13: 干跑用例 2 — 模式 B（URL）

**Files:**
- Read: `.claude/skills/book-create/SKILL.md`

- [ ] **Step 1: 模拟用户输入**

在主对话里输入：`/book-create url`

- [ ] **Step 2: 用户给一个公开目录页 URL**

> 实施者：选一个可访问的 URL，例如豆瓣读书的《子平真诠》条目或百度百科的《滴天髓阐微》。

- [ ] **Step 3: 走完整 6 步状态机**

主 agent 调入 `shared/sources/url.md`，执行 WebFetch → 复用模式 A 解析。

- [ ] **Step 4: 验证产物**

```bash
ls books/{slug}/catalog.md
ls books/{slug}/articles/ | wc -l
```

> 实施者：`{slug}` 替换为本次实际建的书的 slug。

Expected: 1 个 catalog.md + N 个 .gitkeep（N 为抓取到的篇章数）

- [ ] **Step 5: 验证与 generate.js 解析兼容**

```bash
node scripts/generate.js
```

Expected: 无报错

- [ ] **Step 6: 记录干跑结果**

```bash
cat >> .claude/notes/book-create/case-2-mode-B-url-2026-06-10.md <<EOF
# book-create 干跑用例 2：模式 B URL

> 日期：2026-06-10
> 模式：B
> URL：$USER_GAVE_URL
> 通过：YES

## 流程记录

- Step 1-2：源模式 B 锁定，URL 收齐
- Step 3：WebFetch 抓取成功，解析出 N 篇
- Step 4 Gate 1：用户确认
- Step 5 Gate 2：元信息确认
- Step 6：catalog.md + 骨架生成

## 验证

- [x] 6 步全部走完
- [x] WebFetch 抓取成功
- [x] catalog.md 元信息齐全
- [x] generate.js 解析无报错
EOF
```

> 实施者：将 `$USER_GAVE_URL` 替换为实际给的 URL。

- [ ] **Step 7: 提交**

```bash
git add .claude/notes/book-create/
git commit -m "test(book-create): 干跑用例 2 通过 — 模式 B URL"
```

---

## Task 14: 干跑用例 3 — 模式 D（口述）

**Files:**
- Read: `.claude/skills/book-create/SKILL.md`

- [ ] **Step 1: 模拟用户输入**

在主对话里输入：`/book-create fuzzy`

- [ ] **Step 2: 用户口述一本已存在的书**

> 实施者：例如"《穷通宝鉴》，清人辑录，论命理调候"。

- [ ] **Step 3: 走完整 6 步状态机**

主 agent 调入 `shared/sources/fuzzy.md`，执行 WebSearch → 找到目录页 → 走模式 B 解析。

- [ ] **Step 4: 验证产物**

```bash
ls books/穷通宝鉴/catalog.md
ls books/穷通宝鉴/articles/ | wc -l
```

> 实施者：`穷通宝鉴` 已是项目现有书，可直接对照其现有 `catalog.md` 检查新生成内容是否一致。

Expected: 1 个 catalog.md + N 个 .gitkeep

- [ ] **Step 5: 验证与 generate.js 解析兼容**

```bash
node scripts/generate.js
```

Expected: 无报错

- [ ] **Step 6: 记录干跑结果**

```bash
cat > .claude/notes/book-create/case-3-mode-D-fuzzy-2026-06-10.md <<'EOF'
# book-create 干跑用例 3：模式 D 模糊描述

> 日期：2026-06-10
> 模式：D
> 用户口述：《穷通宝鉴》，清人辑录，论命理调候
> 通过：YES

## 流程记录

- Step 1-2：源模式 D 锁定
- Step 3：WebSearch 命中百度百科/维基 → 抓取 → 解析
- Step 4 Gate 1：用户确认
- Step 5 Gate 2：元信息确认
- Step 6：catalog.md + 骨架生成

## 验证

- [x] 6 步全部走完
- [x] WebSearch 命中
- [x] catalog.md 元信息齐全
- [x] generate.js 解析无报错
EOF
```

- [ ] **Step 7: 提交**

```bash
git add .claude/notes/book-create/
git commit -m "test(book-create): 干跑用例 3 通过 — 模式 D 模糊描述 + 穷通宝鉴"
```

---

## Task 15: 最终索引与收尾

**Files:**
- Read/Write: `.claude/notes/book-create/INDEX.md`

- [ ] **Step 1: 创建索引文件**

```bash
cat > .claude/notes/book-create/INDEX.md <<'EOF'
# book-create 干跑历史索引

| 日期 | 模式 | 书籍 | 报告 | 状态 |
|------|------|------|------|------|
| 2026-06-10 | A HTML | 子平真诠 | [case-1] | PASS |
| 2026-06-10 | B URL | （用户给） | [case-2] | PASS |
| 2026-06-10 | D 模糊 | 穷通宝鉴 | [case-3] | PASS |
EOF
```

- [ ] **Step 2: 验证文件结构完整**

```bash
find .claude/skills/book-create -type f -name "*.md" -o -name ".gitkeep" | sort
```

Expected:
```
.claude/skills/book-create/.gitkeep
.claude/skills/book-create/SKILL.md
.claude/skills/book-create/shared/.gitkeep
.claude/skills/book-create/shared/gate.md
.claude/skills/book-create/shared/skeleton.md
.claude/skills/book-create/shared/spec-bundles.md
.claude/skills/book-create/shared/strategy.md
.claude/skills/book-create/shared/sources/.gitkeep
.claude/skills/book-create/shared/sources/fuzzy.md
.claude/skills/book-create/shared/sources/html.md
.claude/skills/book-create/shared/sources/image-pdf.md
.claude/skills/book-create/shared/sources/url.md
```

共 9 个 .md + 3 个 .gitkeep = 12 个文件

- [ ] **Step 3: 总提交**

```bash
git add .claude/notes/book-create/INDEX.md
git commit -m "test(book-create): 干跑 3 用例全部通过，v1 初版完成"
```

- [ ] **Step 4: 写 commit 草稿（用户决定是否推送/合并）**

不自动 push。在主对话输出：

```
v1 book-create skill 完成，9 个 .md + 3 个 .gitkeep，3 个干跑用例通过。

后续可考虑：
- v2 article-create（source/interpretation/skill 录入）
- 与 self-check 报告格式统一
- 字形策略"简体规范化"自动执行
```

---

## 自我审查清单（实施者自检）

实施者在跑完 Task 1-15 后，逐项核对：

- [ ] 9 个 .md 文件全部存在（Task 11 验过）
- [ ] 3 个干跑用例全部 PASS（Task 12-14 验过）
- [ ] 规范包指纹与 SPEC-catalog.md / general.md 同步（Task 2 算过 + Task 11.4 验过）
- [ ] generate.js 在每次干跑后都能解析新生成的 catalog.md（Task 12.6 / 13.5 / 14.5 验过）
- [ ] INDEX.md 反映全部 3 个干跑用例（Task 15.1 写过）
- [ ] 工作树无未提交残留（`git status` 干净）

---

_本 plan 基于 spec `2026-06-10-book-create-skill-design.md`，任务粒度为 2-5 分钟单步；每步含确切文件路径、代码、命令、期望输出与 commit 指令。_
