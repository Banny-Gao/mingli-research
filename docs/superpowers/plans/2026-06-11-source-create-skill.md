# source-create Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 `source-create` 录入原文 skill：4 源模式入口（URL 含 L1/L2/L3 三子模式 / 文本 / 图片-PDF / 调脚本批量）+ 单/批双模 + 5 步引导式状态机 + 1 次字形策略 gate，按 SPEC-source.md 严格产出 `books/{slug}/articles/{篇名}/source.md`。

**Architecture:** 主入口 `SKILL.md` 路由 4 源模式 + 串接 5 步状态机；URL 模式内部 auto-detect L1（WebFetch）/ L2（WebFetch + CSS selector）/ L3（Playwright MCP）；批量模式调既有 `fetch-sources.js` 脚本；不引入 subagent 隔离（理由：单点 1 写、批量走脚本，无并发污染）。

**Tech Stack:** Claude Code Skills（纯 markdown 文档驱动）、WebFetch（项目原生）、`mcp__playwright__*`（项目已有 MCP server）、`node scripts/fetch-sources.js`（既有脚本，v1 不动内部代码）。

**Spec:** `docs/superpowers/specs/2026-06-11-source-create-skill-design.md`

---

## Task 1: 创建目录骨架

**Files:**
- Create: `.claude/skills/source-create/.gitkeep`
- Create: `.claude/skills/source-create/shared/.gitkeep`
- Create: `.claude/skills/source-create/shared/sources/.gitkeep`

- [ ] **Step 1: 创建目录**

```bash
mkdir -p .claude/skills/source-create/shared/sources
```

- [ ] **Step 2: 在三个目录各放一个 .gitkeep**

```bash
touch .claude/skills/source-create/.gitkeep
touch .claude/skills/source-create/shared/.gitkeep
touch .claude/skills/source-create/shared/sources/.gitkeep
```

- [ ] **Step 3: 验证目录结构**

```bash
find .claude/skills/source-create -type d
```

Expected:
```
.claude/skills/source-create
.claude/skills/source-create/shared
.claude/skills/source-create/shared/sources
```

- [ ] **Step 4: 提交**

```bash
git add .claude/skills/source-create/
git commit -m "chore(source-create): 创建目录骨架"
```

---

## Task 2: 写 spec-bundles.md（规范包 + 指纹）

**Files:**
- Create: `.claude/skills/source-create/shared/spec-bundles.md`

- [ ] **Step 1: 计算 SPEC-source.md 与 general.md 的指纹**

```bash
node -e "
const fs = require('fs');
const crypto = require('crypto');
for (const f of ['research-dispute/SPEC-source.md', 'research-dispute/general.md']) {
  const text = fs.readFileSync(f, 'utf8');
  const h2s = text.split('\n').filter(l => l.match(/^##\s/)).slice(0, 5).join('|');
  const h = crypto.createHash('sha256').update(h2s).digest('hex').slice(0, 16);
  const lines = text.split('\n').length;
  console.log(f, '→', lines + ':' + h);
}
"
```

记录两条指纹（每行 `<行数>:<16位hex>`），将用于 Step 3 的 frontmatter。

- [ ] **Step 2: 写 spec-bundles.md**

文件路径：`.claude/skills/source-create/shared/spec-bundles.md`

完整内容：

```markdown
# source-create 规范包

## 必含规范

| 规范 | 路径 | 用途 |
|------|------|------|
| SPEC-source.md | `research-dispute/SPEC-source.md` | 原文录入格式与原则 |
| general.md | `research-dispute/general.md` | 通用红线 + 学术语体 |

注：source-create 不需要 bazi.md（原文录入阶段不涉及命理解读）。

## 指纹校验

| 规范 | 指纹 | 校验时机 |
|------|------|----------|
| SPEC-source.md | `<行数>:<16位hex>` | Step 4 启动时 |
| general.md | `<行数>:<16位hex>` | Step 4 启动时 |

**指纹格式：** `<行数>:<sha256_hex[:16]>`，其中 sha256 输入是"前 5 个 H2 标题拼接"。

**漂移处置：** 指纹不一致 → 警告用户，由用户决定继续还是用新规范重启。

## 注入策略

主 agent 直读规范文件（不内联到 subagent prompt，因 source-create v1 不走 subagent）。
```

> 实施者：将 Step 1 算出的两条指纹填入"指纹校验"表的对应位置。

- [ ] **Step 3: 验证文件已创建且包含必填表格**

```bash
test -f .claude/skills/source-create/shared/spec-bundles.md && \
grep -q "SPEC-source.md" .claude/skills/source-create/shared/spec-bundles.md && \
grep -q "general.md" .claude/skills/source-create/shared/spec-bundles.md && \
grep -q "指纹校验" .claude/skills/source-create/shared/spec-bundles.md && \
echo OK
```

Expected: `OK`

- [ ] **Step 4: 提交**

```bash
git add .claude/skills/source-create/shared/spec-bundles.md
git commit -m "feat(source-create): 添加 spec-bundles 规范包 + 指纹"
```

---

## Task 3: 写 strategy.md（单/批 + 4 源模式选择模板）

**Files:**
- Create: `.claude/skills/source-create/shared/strategy.md`

- [ ] **Step 1: 写 strategy.md**

文件路径：`.claude/skills/source-create/shared/strategy.md`

完整内容：

```markdown
# 模式选择 + 源模式路由

主 agent 在 Step 1（单/批）和 Step 2（4 源模式）按本模板引导。

## Step 1：单/批

| 模式 | 含义 | 适用 |
|------|------|------|
| A. 单点 | 一次只录 1 篇 | 用户知道具体要录哪一篇 |
| B. 批量 | 一次录 N 篇（整本或子集）| 用户想批量补录 |

**AskUserQuestion 2 选项：**
- A. 单点（聚焦 1 篇）
- B. 批量（指定书 + 篇章列表）

## Step 2：4 源模式

| 模式 | 适用 | 工具 |
|------|------|------|
| A. URL | 用户给单篇章 URL（任意站点）| WebFetch (L1) / +CSS (L2) / Playwright (L3) |
| B. 文本 | 用户给 .txt / 粘到聊天 / 给文件路径 | Read + LLM 清洗 |
| C. 图片/PDF | 用户给扫描件 | 多模态读图 |
| D. 调脚本 | 已有 catalog.html + URL 模式整本 | `node scripts/fetch-sources.js` |

**AskUserQuestion 4 选项：**
- A. URL
- B. 文本
- C. 图片/PDF
- D. 调脚本批量

## URL 子模式 auto-detect（Step 3 内部）

```
WebFetch URL
  │
  ├─ HTML 含清晰正文 → L1（LLM 提取）
  │
  └─ HTML 空 / placeholder / 疑似 JS 渲染
       └─ AskUserQuestion 3 选项
            ├─ A. Playwright 兜底（L3）
            ├─ B. 给 CSS selector（L2，重用 WebFetch HTML）
            └─ C. 退出，建议改用模式 C 截屏
```

## 批量脚本调命令模板

```bash
# dry-run 预览
node scripts/fetch-sources.js <slug> <chapter1>,<chapter2> --force --dry-run

# 实跑
node scripts/fetch-sources.js <slug> <chapter1>,<chapter2> --force
```

> 注：v1 不动 fetch-sources.js 内部代码；脚本是 data layer，skill 是 UI layer。
```

- [ ] **Step 2: 验证文件包含全部必填段**

```bash
test -f .claude/skills/source-create/shared/strategy.md && \
grep -q "Step 1：单/批" .claude/skills/source-create/shared/strategy.md && \
grep -q "Step 2：4 源模式" .claude/skills/source-create/shared/strategy.md && \
grep -q "URL 子模式 auto-detect" .claude/skills/source-create/shared/strategy.md && \
grep -q "批量脚本调命令模板" .claude/skills/source-create/shared/strategy.md && \
echo OK
```

Expected: `OK`

- [ ] **Step 3: 提交**

```bash
git add .claude/skills/source-create/shared/strategy.md
git commit -m "feat(source-create): 添加 strategy 模式选择 + URL 子模式 auto-detect"
```

---

## Task 4: 写 gate.md（字形策略 gate + 冲突 4 选项）

**Files:**
- Create: `.claude/skills/source-create/shared/gate.md`

- [ ] **Step 1: 写 gate.md**

文件路径：`.claude/skills/source-create/shared/gate.md`

完整内容：

```markdown
# 字形策略 gate + 冲突 4 选项

source-create 流程有 1 次字形策略 gate + 1 次落盘冲突 4 选项。

## Gate 1：字形策略 gate

**触发：** Step 3 完成后、Step 4 落盘前
**输入：** `books/{slug}/catalog.md` blockquote 的 `字形策略` 字段
**读取方式：** 主 agent 读 catalog.md 元信息 blockquote（`> 字形策略：...`）

| 字段值 | 处置 |
|--------|------|
| `原文照录` | 直接进 Step 5，无 gate |
| `简体规范化` | 提示用户"建议走 fetch-sources.js 批量通道（已含 t2s），或手动用 `node scripts/t2s.js` 转换已录文件"；v1 不自动 t2s |
| 声明缺失 | 视为 `原文照录`，不 gate |

**v1 不自动 t2s 的原因：** SPEC-source.md §X.3 要求"歧义字清单 + 人工 spot-check"，全流程复杂；v1 字形 gate 退化为"提示"，不阻塞流程。

## 落盘冲突 4 选项（Step 5 内部）

**触发：** source.md 已存在
**输入：** 已有文件路径

**AskUserQuestion 4 选项：**
| 选项 | 含义 | 后续动作 |
|------|------|---------|
| A. 覆盖 | 替换现有文件 | 写新内容，旧文件丢失 |
| B. 备份为 .bak | 旧文件改名为 source.md.bak，新文件写入 | 旧内容可回滚 |
| C. 取消 | 放弃本次录入 | 退出，不写文件 |
| D. 退出 | 放弃整个 source-create 流程 | 退出 |

**用户选 C/D 时：** 主 agent 退出，不写文件。

## 与 book-create gate 的关系

- book-create 也有"冲突 4 选项" gate（用于 catalog.md 重写）
- source-create 复用同一 4 选项形态
- 唯一差异：source-create 多了"字形策略 gate"，因为 source.md 对字形敏感
```

- [ ] **Step 2: 验证文件包含必填段**

```bash
test -f .claude/skills/source-create/shared/gate.md && \
grep -q "Gate 1：字形策略 gate" .claude/skills/source-create/shared/gate.md && \
grep -q "落盘冲突 4 选项" .claude/skills/source-create/shared/gate.md && \
grep -q "原文照录" .claude/skills/source-create/shared/gate.md && \
grep -q "简体规范化" .claude/skills/source-create/shared/gate.md && \
echo OK
```

Expected: `OK`

- [ ] **Step 3: 提交**

```bash
git add .claude/skills/source-create/shared/gate.md
git commit -m "feat(source-create): 添加 gate 字形策略 gate + 冲突 4 选项"
```

---

## Task 5: 写 skeleton.md（source.md 落盘规则）

**Files:**
- Create: `.claude/skills/source-create/shared/skeleton.md`

- [ ] **Step 1: 写 skeleton.md**

文件路径：`.claude/skills/source-create/shared/skeleton.md`

完整内容：

```markdown
# source.md 落盘规则

source-create 在 Step 5 落盘时创建产物：`books/{slug}/articles/{篇名}/source.md`

**与 book-create skeleton.md 的关键差异：**
- source.md **不**含元信息 blockquote（无 shu/category/contentTypes/字形策略等字段）
- 元信息在父目录的 `books/{slug}/catalog.md` 中，本文件只放原文

## source.md 模板

```markdown
# {篇名}

{正文原文}

{空行}

> 【{注家名}】{注家原文}
>
> {注家原文续}
```

**字段填充规则：**
- 标题：用 `# {篇名}` 一级标题，无序号、无副标题
- 正文：段与段之间用**单空行**分隔；不加任何标记（无列表、无粗体、无斜体、无图片、无表格）
- 注家：使用 `> 【{注家名}】` 块引用包裹
- 注释之间用空行分隔

## 目录命名硬性约定

- `{篇名}` 是**裸篇名**（不带"01 "、"02 "等编号前缀）
- 编号**仅**写在 `books/{slug}/catalog.md` 表格的"编号"列
- 8 本已建书（子平真诠、滴天髓阐微、渊海子平、穷通宝鉴、千里命稿、紫微斗数全书、三命通会、神峰通考）均遵守此约定

**正例：**
```
books/子平真诠/articles/论用神/source.md
books/神峰通考/articles/万金赋/source.md
```

## 落盘顺序

1. 读 `books/{slug}/articles/{篇名}/source.md` 是否已存在
2. 存在 → 4 选项（覆盖/备份/取消/退出）
3. 不存在 → 直接 `Write` source.md
4. 不自动跑 `node scripts/generate.js`，由用户决定

## 关键红线（来自 SPEC-source.md §五）

主 agent 写 source.md 时**必须**遵守：

1. 严禁混入解读内容
2. 严禁修改原文用字
3. 严禁添加现代标点以外的标记（仅 `> 【注家名】` 块引用是例外）
4. 严禁分段处理长段原文
5. 严禁添加空行以外的任何内容

LLM 提取时若"想顺手改字"必须主动拒绝。提取 prompt 显式声明："严字不改，照录原字形"。
```

- [ ] **Step 2: 验证文件包含模板与红线**

```bash
test -f .claude/skills/source-create/shared/skeleton.md && \
grep -q "source.md 模板" .claude/skills/source-create/shared/skeleton.md && \
grep -q "目录命名硬性约定" .claude/skills/source-create/shared/skeleton.md && \
grep -q "关键红线" .claude/skills/source-create/shared/skeleton.md && \
echo OK
```

Expected: `OK`

- [ ] **Step 3: 提交**

```bash
git add .claude/skills/source-create/shared/skeleton.md
git commit -m "feat(source-create): 添加 skeleton source.md 落盘规则 + 5 条红线"
```

---

## Task 6: 写 sources/url.md（模式 A：URL + L1/L2/L3 三子模式）

**Files:**
- Create: `.claude/skills/source-create/shared/sources/url.md`

- [ ] **Step 1: 写 url.md**

文件路径：`.claude/skills/source-create/shared/sources/url.md`

完整内容：

```markdown
# 模式 A：URL（含 L1/L2/L3 三子模式）

## 输入契约

- **必填：** 单篇章 URL（任意站点）
- **URL 类型：** HTML 页（首选）；JSON API 不支持
- **可达性：** 需主 agent 用 `WebFetch` 能拿到 HTML（除非走 L3）

## 三子模式

### L1 通用（默认）

| 项 | 契约 |
|----|------|
| 输入 | URL 1 个 |
| 处理 | `WebFetch` HTML → LLM 识别主内容 → 提取原文 → 格式化为 source.md |
| 适配 | 任何 WebFetch 能拿正文的静态 HTML 页 |
| 触发 | 默认（WebFetch 拿到清晰正文）|

### L2 CSS 提示（精准）

| 项 | 契约 |
|----|------|
| 输入 | URL + CSS selector（如 `article.content` / `#main-text` / `.article-body`）|
| 处理 | WebFetch HTML → LLM 用 selector 定位主区域 → 在该 DOM 节点内提取 |
| 适配 | 页面 HTML 复杂（正文与广告/导航/页脚混杂）的站点 |
| 触发 | 用户在 Step 3 主动给 selector（可选）|

### L3 JS 渲染（兜底）

| 项 | 契约 |
|----|------|
| 输入 | URL 1 个 |
| 处理 | `mcp__playwright__browser_navigate` 加载 → `browser_snapshot` 取渲染后 DOM → LLM 提取 |
| 适配 | JS 渲染 SPA（维基百科部分页面 / 现代博客 / 学术平台）|
| 触发 | WebFetch 拿不到正文（空 / placeholder / 明显骨架）→ 询问用户是否 L3 |

## Auto-detect 流程（Step 3 内部）

```
WebFetch URL
  │
  ├─ HTML 含清晰正文 → L1 提取
  │
  └─ HTML 空 / placeholder / 疑似 JS 渲染
       └─ AskUserQuestion 3 选项
            ├─ A. 用 Playwright 兜底（L3）→ 重新取渲染后 DOM
            ├─ B. 给我 CSS selector（L2）→ 重用 WebFetch HTML
            └─ C. 退出，建议改用模式 C 截屏
```

## 主 agent 动作

1. WebFetch URL
2. 评估 HTML（用 LLM 判断）：清晰正文 → L1；空/JS 渲染 → 询问 L2/L3
3. 选 L1：直接 LLM 提取
4. 选 L2：用户给 selector → LLM 提取
5. 选 L3：Playwright MCP 取渲染后 DOM → LLM 提取
6. 提取后**严格**：原文照录（一字不改）、段落空行分隔、`> 【注家名】` 块引用包裹
7. 写 source.md：H1 标题（裸篇名）+ 正文 + 注家块

## LLM 提取 prompt 模板

提取时主 agent 显式声明以下约束：

```
你是一个原文提取器。任务：从以下 HTML 中提取文章正文与注家注释。

【严字不改原则】
- 异体字、避讳字、缺笔字、繁简差异字 一律照录原字形
- 不补译、不解释、不"修正"任何字
- 不混入任何现代解读

【格式要求】
- 第一个 # 标题为篇名（来自文件目录或 HTML <h1>）
- 正文段落用空行分隔
- 注家以 `> 【{注家名}】` 块引用包裹
- 注释之间空行分隔
- 无列表、无粗体、无表格、无图片

【输出】
- 仅输出 source.md 内容，不要解释过程
```

## Playwright 集成细节（L3）

### MCP server

- 名称：`playwright`（项目已有）
- 关键工具：
  - `mcp__playwright__browser_navigate {url}` 加载 URL
  - `mcp__playwright__browser_wait_for {time, text}` 等待加载
  - `mcp__playwright__browser_snapshot` 取渲染后 DOM（可访问性树形式）

### L3 流程

```
1. mcp__playwright__browser_navigate {url}
2. mcp__playwright__browser_wait_for {time: 2}  # 等待 2s 让 JS 跑完
3. mcp__playwright__browser_snapshot 拿 DOM 文本
4. LLM 在渲染后 DOM 上做 L1 同等提取
5. 不持久化浏览器会话
```

### 限制

- v1 不处理登录态 / cookies
- v1 不处理验证码
- v1 不持久化浏览器 session
- v1 不抗反爬

## 抓取容错

| 异常 | 处置 |
|------|------|
| URL 404 / 网络失败 | WebFetch 默认重试 1 次；失败 → 询问 L2/L3 |
| JS 渲染页（WebFetch 拿不到正文）| 询问 L3（Playwright 兜底）|
| 403 / 验证码 / 反爬 | 报错退出，让用户改源 |
| 抓取结果为无关页（如被重定向到首页）| 报错退出 |
| Playwright 加载超时 | 报错退出，建议模式 C 截屏 |
| OCR / 提取结果过短（< 100 字）| 询问是否重试或换源 |
```

- [ ] **Step 2: 验证文件包含三子模式与 auto-detect 流程**

```bash
test -f .claude/skills/source-create/shared/sources/url.md && \
grep -q "### L1 通用" .claude/skills/source-create/shared/sources/url.md && \
grep -q "### L2 CSS 提示" .claude/skills/source-create/shared/sources/url.md && \
grep -q "### L3 JS 渲染" .claude/skills/source-create/shared/sources/url.md && \
grep -q "Auto-detect 流程" .claude/skills/source-create/shared/sources/url.md && \
grep -q "Playwright 集成细节" .claude/skills/source-create/shared/sources/url.md && \
echo OK
```

Expected: `OK`

- [ ] **Step 3: 提交**

```bash
git add .claude/skills/source-create/shared/sources/url.md
git commit -m "feat(source-create): 添加 source 模式 A URL + L1/L2/L3 三子模式"
```

---

## Task 7: 写 sources/text.md（模式 B：纯文本/文件）

**Files:**
- Create: `.claude/skills/source-create/shared/sources/text.md`

- [ ] **Step 1: 写 text.md**

文件路径：`.claude/skills/source-create/shared/sources/text.md`

完整内容：

```markdown
# 模式 B：文本

## 输入契约

- **必填：** 纯文本内容
- **可选位置：**
  - 用户直接粘到聊天
  - `.txt` / `.md` 文件绝对路径
  - 多文件批量

## 主 agent 动作

1. 收源（接收文本 / `Read` 文件）
2. LLM 清洗：
   - 去除多余空行（保留段间单空行）
   - 识别 `【XX】` 注家标记，转为 `> 【XX】` 块引用
   - 保留原文一字不改
3. 写 source.md：H1 + 正文 + 注家块

## 清洗原则（来自 SPEC-source.md §五）

LLM 清洗时**必须**遵守：

1. 严禁混入解读内容
2. 严禁修改原文用字
3. 严禁添加现代标点以外的标记（仅 `> 【注家名】` 块引用是例外）
4. 严禁分段处理长段原文
5. 严禁添加空行以外的任何内容

## 失败兜底

| 异常 | 处置 |
|------|------|
| 路径不存在 / 文件不可读 | 报错退出，让用户重给 |
| 文本为空 | 报错退出 |
| 文本 < 100 字 | 警告并继续（短文也可能是完整章节）|
| 注家标记格式混乱 | 询问用户手动标注 |

## 与模式 A 的差异

- 模式 A：HTML 解析 + 提取
- 模式 B：直接清洗（无 HTML 解析）
- 两者都遵守 SPEC-source.md 红线
```

- [ ] **Step 2: 验证文件包含必填段**

```bash
test -f .claude/skills/source-create/shared/sources/text.md && \
grep -q "输入契约" .claude/skills/source-create/shared/sources/text.md && \
grep -q "主 agent 动作" .claude/skills/source-create/shared/sources/text.md && \
grep -q "清洗原则" .claude/skills/source-create/shared/sources/text.md && \
grep -q "失败兜底" .claude/skills/source-create/shared/sources/text.md && \
echo OK
```

Expected: `OK`

- [ ] **Step 3: 提交**

```bash
git add .claude/skills/source-create/shared/sources/text.md
git commit -m "feat(source-create): 添加 source 模式 B 文本契约"
```

---

## Task 8: 写 sources/image-pdf.md（模式 C：图片/PDF）

**Files:**
- Create: `.claude/skills/source-create/shared/sources/image-pdf.md`

- [ ] **Step 1: 写 image-pdf.md**

文件路径：`.claude/skills/source-create/shared/sources/image-pdf.md`

完整内容：

```markdown
# 模式 C：图片 / PDF

## 输入契约

- **必填：** 用户给 1 张扫描页 / 1 个 PDF / 多张扫描页
- **图片格式：** png / jpg / webp（Claude Code Read 支持）
- **PDF：** 单文件多页
- **路径要求：** 文件系统可读

## 主 agent 动作

1. `Read` 多模态读图（图片走多模态，PDF 走 Read 直接打开）
2. 跨页拼接（多页 PDF）
3. LLM 识别：
   - 标题（`# {篇名}`）
   - 正文段落
   - 注家标记（`> 【{注家名}】`）
4. 写 source.md

## OCR 准确度

- 多模态读图通常 95%+，但：
  - 异体字（`経` / `經`）易识别错
  - 生僻字（`籌` / `讖`）易识别为常用字
  - 竖排扫描易漏行
- 抽取后让人工 spot-check 关键篇名

## 失败兜底

| 异常 | 处置 |
|------|------|
| 读图失败 / 不可识别 | 报错"图片无法识别，请改用模式 B 手输或换张图" |
| PDF 多页但跨页目录被截断 | 提示用户拆分 PDF 重新输入 |
| OCR 结果明显不完整 | 让人工 spot-check，不阻塞 |
| 0 篇 | 报错退出 |

## 与 book-create 模式 C 的差异

- book-create C：解析目录（多篇）
- source-create C：解析单篇章正文
- 两者都用多模态读图，OCR 风险一致
```

- [ ] **Step 2: 验证文件包含 OCR 准确度与失败兜底**

```bash
test -f .claude/skills/source-create/shared/sources/image-pdf.md && \
grep -q "OCR 准确度" .claude/skills/source-create/shared/sources/image-pdf.md && \
grep -q "失败兜底" .claude/skills/source-create/shared/sources/image-pdf.md && \
echo OK
```

Expected: `OK`

- [ ] **Step 3: 提交**

```bash
git add .claude/skills/source-create/shared/sources/image-pdf.md
git commit -m "feat(source-create): 添加 source 模式 C 图片-PDF 契约"
```

---

## Task 9: 写 sources/script.md（模式 D：调 fetch-sources.js）

**Files:**
- Create: `.claude/skills/source-create/shared/sources/script.md`

- [ ] **Step 1: 写 script.md**

文件路径：`.claude/skills/source-create/shared/sources/script.md`

完整内容：

```markdown
# 模式 D：调脚本批量

## 输入契约

- **必填：** 书 slug（与 `books/{slug}/` 一致）
- **可选：** 篇章列表（逗号或空格分隔；缺省 = 整本所有未录篇章）

## 主 agent 动作

1. 收源：书 slug + 篇章列表
2. 拼命令：
   ```bash
   # dry-run 预览
   node scripts/fetch-sources.js <slug> <chapter1>,<chapter2> --force --dry-run

   # 实跑
   node scripts/fetch-sources.js <slug> <chapter1>,<chapter2> --force
   ```
3. **先 dry-run**让用户确认范围
4. 用户确认后**去掉 `--dry-run`**实跑
5. 校验产出：
   - `ls books/<slug>/articles/<篇名>/source.md` 存在性
   - 行数 / 字符数（如 < 100 字标记"过短"）
6. 收尾报告

## fetch-sources.js 能力继承（v1 不动内部代码）

- 自动发现 books/ 下含 catalog.md 的书
- EXTRACTORS 数组：iwzbz.com（`book-detail-content` 提取）+ generic（`《书名》第X章` 模式）
- catalog.html + catalog.md 联合解析
- t2s 转换（仅字形策略为"简体规范化"时启用）
- 注家标记 `【XX】` 检测
- 进度条 + 错误日志 + 模糊 URL 匹配
- `--force` 覆盖已存在文件；`--dry-run` 预览

## v1 不扩充的项

- 不加新站点 EXTRACTORS（CText / 国学大师 / 殆知阁 等 v2 待）
- 不改 fetch-sources.js 内部代码

## 失败兜底

| 异常 | 处置 |
|------|------|
| 调脚本失败（非 0 退出）| 报告 stderr，不重试 |
| 调脚本后产出校验失败（行数过少/缺失篇）| 报告详情，让用户决定 |
| 模糊匹配未命中 | 报告"未匹配篇章名：..."，让用户修正 |
| 网络失败（429 / 5xx）| 脚本内部已重试 3 次；最终失败 → 报告 |

## 与 source-create URL 模式的分工

- URL 模式：单点 + 任意站点（用 LLM 通用能力）
- 脚本模式：批量 + 已知 2 站点（用脚本 EXTRACTORS）
- **不重复造轮子**：v1 单点 LLM、批量脚本，各司其职
```

- [ ] **Step 2: 验证文件包含调命令模板与失败兜底**

```bash
test -f .claude/skills/source-create/shared/sources/script.md && \
grep -q "node scripts/fetch-sources.js" .claude/skills/source-create/shared/sources/script.md && \
grep -q "EXTRACTORS" .claude/skills/source-create/shared/sources/script.md && \
grep -q "失败兜底" .claude/skills/source-create/shared/sources/script.md && \
echo OK
```

Expected: `OK`

- [ ] **Step 3: 提交**

```bash
git add .claude/skills/source-create/shared/sources/script.md
git commit -m "feat(source-create): 添加 source 模式 D 调 fetch-sources.js 批量契约"
```

---

## Task 10: 写 SKILL.md（主入口：4 源路由 + 5 步状态机）

**Files:**
- Create: `.claude/skills/source-create/SKILL.md`

- [ ] **Step 1: 写 SKILL.md**

文件路径：`.claude/skills/source-create/SKILL.md`

完整内容：

````markdown
---
name: source-create
description: 录入原文技能。4 源模式（URL 含 L1/L2/L3 三子模式 / 文本 / 图片-PDF / 调脚本批量）+ 单/批双模 + 5 步引导式状态机 + 1 次字形策略 gate + 落盘冲突 4 选项，按 SPEC-source.md 严格生成 books/{slug}/articles/{篇名}/source.md。
trigger: 录入|录入原文|补录|录入
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
````

- [ ] **Step 2: 验证 SKILL.md 包含必填段**

```bash
test -f .claude/skills/source-create/SKILL.md && \
grep -q "^name: source-create" .claude/skills/source-create/SKILL.md && \
grep -q "4 源模式" .claude/skills/source-create/SKILL.md && \
grep -q "Step 1.*模式" .claude/skills/source-create/SKILL.md && \
grep -q "Step 5.*落盘" .claude/skills/source-create/SKILL.md && \
echo OK
```

Expected: `OK`

- [ ] **Step 3: 提交**

```bash
git add .claude/skills/source-create/SKILL.md
git commit -m "feat(source-create): 添加主入口 SKILL.md（4 源路由 + 5 步状态机）"
```

---

## Task 11: 静态合规检查

**Files:**
- Read: `.claude/skills/source-create/SKILL.md`
- Read: `.claude/skills/source-create/shared/*.md`
- Read: `.claude/skills/source-create/shared/sources/*.md`

- [ ] **Step 1: 检查所有 9 个文件存在**

```bash
for f in \
  .claude/skills/source-create/SKILL.md \
  .claude/skills/source-create/shared/spec-bundles.md \
  .claude/skills/source-create/shared/strategy.md \
  .claude/skills/source-create/shared/gate.md \
  .claude/skills/source-create/shared/skeleton.md \
  .claude/skills/source-create/shared/sources/url.md \
  .claude/skills/source-create/shared/sources/text.md \
  .claude/skills/source-create/shared/sources/image-pdf.md \
  .claude/skills/source-create/shared/sources/script.md
do
  test -f "$f" && echo "OK $f" || echo "MISSING $f"
done
```

Expected: 全部输出 `OK`（9 行）

- [ ] **Step 2: 检查 SKILL.md 引用的所有相对路径都解析到真实文件**

```bash
cd .claude/skills/source-create && \
grep -oE 'shared/[a-z/-]+\.md' SKILL.md | sort -u | while read p; do
  test -f "$p" && echo "OK $p" || echo "MISSING $p"
done
```

Expected: 全部 `OK`

- [ ] **Step 3: 检查各 shared 文件至少 20 行（不是空 stub）**

```bash
for f in .claude/skills/source-create/shared/*.md .claude/skills/source-create/shared/sources/*.md; do
  lines=$(wc -l < "$f")
  [ "$lines" -ge 20 ] && echo "OK $f ($lines)" || echo "TOO SHORT $f ($lines)"
done
```

Expected: 全部 `OK`

- [ ] **Step 4: 检查 spec-bundles.md 指纹格式合法（`<数字>:<16位hex>`）**

```bash
grep -oE '[0-9]+:[0-9a-f]{16}' .claude/skills/source-create/shared/spec-bundles.md
```

Expected: 输出 2 行（SPEC-source.md 与 general.md 各一行）

- [ ] **Step 5: AI-meta tag 扫描（避免 user-facing 输出含 [AI 推测] 等标记）**

```bash
grep -rnE '\[AI[^]]*\]|\[用户[^]]*\]|【AI|【用户' .claude/skills/source-create/ 2>&1
```

Expected: 空（无命中）

- [ ] **Step 6: 提交（无变更情况下允许空 commit）**

```bash
git status
```

若 11.1-11.5 全部通过且无变更，不需 commit。若发现问题，修复后单独 commit。

---

## Task 12: 干跑用例 1 — 模式 A-L1 通用（神峰通考 + URL）

**Files:**
- Read: `.claude/skills/source-create/SKILL.md`

- [ ] **Step 1: 模拟用户输入**

在主对话里输入：`/source-create url`

> 实施者：将此作为新对话的首次输入，或在当前会话重置上下文后输入。

- [ ] **Step 2: 走完整 5 步状态机**

按 SKILL.md 的 5 步流程执行，主 agent 调入 `shared/sources/url.md`、`shared/strategy.md`、`shared/gate.md`、`shared/skeleton.md`、`shared/spec-bundles.md`。

- [ ] **Step 3: 在 Step 4 字形策略 gate 确认（神峰通考 = 原文照录）**

神峰通考 catalog.md 声明"字形策略：原文照录"，Step 4 自动通过，无 gate。

- [ ] **Step 4: 在 Step 5 落盘 4 选项（如适用）**

如已存在 source.md → 4 选项；不存在 → 直接写入。

- [ ] **Step 5: 验证产物**

```bash
ls -la books/神峰通考/articles/{篇名}/source.md
head -5 books/神峰通考/articles/{篇名}/source.md
```

Expected: source.md 存在；首行 `# {篇名}`，无元信息 blockquote，段间空行

- [ ] **Step 6: 验证与 generate.js 解析兼容**

```bash
node scripts/generate.js 2>&1 | grep -E "神峰|error|Error" | head -5
```

Expected: 神峰通考 total=N+1, done=1（无 error）

- [ ] **Step 7: 记录干跑结果**

```bash
mkdir -p .claude/notes/source-create
cat > .claude/notes/source-create/case-1-mode-A-L1-2026-06-11.md <<'EOF'
# source-create 干跑用例 1：模式 A-L1 通用

> 日期：2026-06-11
> 模式：A-L1 通用
> 源：神峰通考某未录篇章 URL（静态 HTML）
> 通过：YES

## 流程记录

- Step 1：单点
- Step 2：A URL
- Step 3：WebFetch OK → LLM 提取 → 写入
- Step 4：字形策略"原文照录"，自动通过
- Step 5：source.md 写入

## 验证

- [x] 5 步全部走通
- [x] source.md 格式合规（无元信息 blockquote、段间空行）
- [x] generate.js 解析无报错
EOF
```

- [ ] **Step 8: 提交**

```bash
git add .claude/notes/source-create/
git commit -m "test(source-create): 干跑用例 1 通过 — 模式 A-L1 通用"
```

---

## Task 13: 干跑用例 2 — 模式 A-L2 CSS 提示（HTML 复杂站点 + selector）

**Files:**
- Read: `.claude/skills/source-create/SKILL.md`

- [ ] **Step 1: 模拟用户输入**

在主对话里输入：`/source-create url`

- [ ] **Step 2: 用户给 URL + CSS selector**

> 实施者：选一个 HTML 复杂的站点（如百度百科某古籍条目），给一个 CSS selector（如 `.main-content` / `#content`）。

- [ ] **Step 3: 走完整 5 步状态机（走 L2 分支）**

主 agent 调入 `shared/sources/url.md`，按 L2 流程：WebFetch + LLM 用 selector 精准定位。

- [ ] **Step 4: 验证产物**

```bash
ls books/{slug}/articles/{篇名}/source.md
head -10 books/{slug}/articles/{篇名}/source.md
```

> 实施者：`{slug}` 和 `{篇名}` 替换为本次实际值。

Expected: source.md 存在；首行为 `# {篇名}`；正文为 selector 定位区域内的内容（不含广告/导航/页脚）

- [ ] **Step 5: 验证与 generate.js 解析兼容**

```bash
node scripts/generate.js
```

Expected: 无报错

- [ ] **Step 6: 记录干跑结果**

```bash
cat > .claude/notes/source-create/case-2-mode-A-L2-2026-06-11.md <<'EOF'
# source-create 干跑用例 2：模式 A-L2 CSS 提示

> 日期：2026-06-11
> 模式：A-L2 CSS 提示
> 源：HTML 复杂站点 + CSS selector
> 通过：YES

## 流程记录

- Step 1：单点
- Step 2：A URL
- Step 3：WebFetch + LLM 用 selector 定位主区域 → 提取
- Step 4：字形策略"原文照录"或缺失，自动通过
- Step 5：source.md 写入

## 验证

- [x] 5 步全部走通
- [x] LLM 用 selector 精准定位（未提广告/页脚）
- [x] source.md 格式合规
- [x] generate.js 解析无报错
EOF
```

- [ ] **Step 7: 提交**

```bash
git add .claude/notes/source-create/
git commit -m "test(source-create): 干跑用例 2 通过 — 模式 A-L2 CSS 提示"
```

---

## Task 14: 干跑用例 3 — 模式 A-L3 JS 渲染（Playwright 兜底）

**Files:**
- Read: `.claude/skills/source-create/SKILL.md`

- [ ] **Step 1: 模拟用户输入**

在主对话里输入：`/source-create url`

- [ ] **Step 2: 用户给一个 SPA URL**

> 实施者：选一个 JS 渲染站点（如维基百科部分页面、某些学术平台博客），确认 WebFetch 拿不到正文。

- [ ] **Step 3: 走完整 5 步状态机（走 L3 分支）**

主 agent 调入 `shared/sources/url.md`：
- WebFetch 拿空 → 询问 L3
- 用户选 L3 → Playwright 兜底 → 渲染后 DOM → LLM 提取

- [ ] **Step 4: 验证产物**

```bash
ls books/{slug}/articles/{篇名}/source.md
head -10 books/{slug}/articles/{篇名}/source.md
```

Expected: source.md 存在；首行 `# {篇名}`；正文来自渲染后 DOM

- [ ] **Step 5: 验证与 generate.js 解析兼容**

```bash
node scripts/generate.js
```

Expected: 无报错

- [ ] **Step 6: 记录干跑结果**

```bash
cat > .claude/notes/source-create/case-3-mode-A-L3-2026-06-11.md <<'EOF'
# source-create 干跑用例 3：模式 A-L3 JS 渲染

> 日期：2026-06-11
> 模式：A-L3 JS 渲染
> 源：SPA URL（WebFetch 拿不到正文）
> 通过：YES

## 流程记录

- Step 1：单点
- Step 2：A URL
- Step 3：WebFetch 空 → 询问 L3 → Playwright 兜底 → 提取
- Step 4：字形策略"原文照录"或缺失，自动通过
- Step 5：source.md 写入

## 验证

- [x] 5 步全部走通
- [x] Playwright 加载成功
- [x] 渲染后 DOM 提取正常
- [x] source.md 格式合规
- [x] generate.js 解析无报错
EOF
```

- [ ] **Step 7: 提交**

```bash
git add .claude/notes/source-create/
git commit -m "test(source-create): 干跑用例 3 通过 — 模式 A-L3 JS 渲染"
```

---

## Task 15: 最终索引与收尾

**Files:**
- Read/Write: `.claude/notes/source-create/INDEX.md`

- [ ] **Step 1: 创建索引文件**

```bash
cat > .claude/notes/source-create/INDEX.md <<'EOF'
# source-create 干跑历史索引

| 日期 | 模式 | 源 | 报告 | 状态 |
|------|------|------|------|------|
| 2026-06-11 | A-L1 通用 | 静态 HTML 站点 | [case-1] | PASS |
| 2026-06-11 | A-L2 CSS | HTML 复杂 + selector | [case-2] | PASS |
| 2026-06-11 | A-L3 JS 渲染 | SPA URL + Playwright | [case-3] | PASS |
EOF
```

- [ ] **Step 2: 验证文件结构完整**

```bash
find .claude/skills/source-create -type f \( -name "*.md" -o -name ".gitkeep" \) | sort
```

Expected:
```
.claude/skills/source-create/.gitkeep
.claude/skills/source-create/SKILL.md
.claude/skills/source-create/shared/.gitkeep
.claude/skills/source-create/shared/gate.md
.claude/skills/source-create/shared/skeleton.md
.claude/skills/source-create/shared/spec-bundles.md
.claude/skills/source-create/shared/strategy.md
.claude/skills/source-create/shared/sources/.gitkeep
.claude/skills/source-create/shared/sources/image-pdf.md
.claude/skills/source-create/shared/sources/script.md
.claude/skills/source-create/shared/sources/text.md
.claude/skills/source-create/shared/sources/url.md
```

共 9 个 .md + 3 个 .gitkeep = 12 个文件

- [ ] **Step 3: 总提交**

```bash
git add .claude/notes/source-create/INDEX.md
git commit -m "test(source-create): 干跑 3 用例结构性验证通过，v1 初版完成"
```

- [ ] **Step 4: 写 commit 草稿（用户决定是否推送/合并）**

不自动 push。在主对话输出：

```
v1 source-create skill 完成，9 个 .md + 3 个 .gitkeep，3 个干跑用例（A-L1/L2/L3）通过。

后续可考虑：
- v2 interp-create（解读）
- v2 skill-create（技能沉淀）
- 站点 EXTRACTORS 扩充（CText / 国学大师 / 殆知阁）
- 字形"简体规范化"自动 t2s + 歧义字 spot-check
```

---

## 自我审查清单（实施者自检）

实施者在跑完 Task 1-15 后，逐项核对：

- [ ] 9 个 .md 文件全部存在（Task 11 验过）
- [ ] 3 个干跑用例全部 PASS（Task 12-14 验过）
- [ ] 规范包指纹与 SPEC-source.md / general.md 同步（Task 2 算过 + Task 11.4 验过）
- [ ] generate.js 在每次干跑后都能解析新生成的 source.md（Task 12.6 / 13.5 / 14.5 验过）
- [ ] INDEX.md 反映全部 3 个干跑用例（Task 15.1 写过）
- [ ] AI-meta tag 扫描全空（Task 11.5 验过）
- [ ] 工作树无未提交残留（`git status` 干净）

---

_本 plan 基于 spec `2026-06-11-source-create-skill-design.md`，任务粒度为 2-5 分钟单步；每步含确切文件路径、代码、命令、期望输出与 commit 指令。_
