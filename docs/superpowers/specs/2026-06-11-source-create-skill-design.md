# source-create 录入原文技能设计

> **Spec Version:** 2026-06-11
> **Status:** Draft
> **Parent Design:** `2026-06-09-self-check-skill-design.md`（共享 subagent 调度思路的反面参考）
> **Sibling:** `2026-06-10-book-create-skill-design.md`（共享 spec-bundles 思路 / 共享冲突 4 选项 gate）
> **v1 范围：** 仅 source-create（原文录入）；interp-create / skill-create 留 v2

---

## 1. Goal

为五术研究项目提供**多源入口、单/批双模、含 WebFetch + Playwright 双通道**的原文录入能力：

- **入口**：`/source-create` 起手
- **4 源模式**：URL（含 L1 通用 / L2 CSS 提示 / L3 JS 渲染 三子模式）/ 文本 / 图片-PDF / 调脚本批量
- **单/批双模**：单篇聚焦 / 整本批量
- **过程**：5 步引导式状态机 + 1 次字形策略 gate + 落盘冲突 4 选项
- **输出**：`books/{slug}/articles/{篇名}/source.md`
- **强约束**：每次录入严格遵守 `research-dispute/SPEC-source.md` + `research-dispute/general.md`
- **写入方式**：主 agent 直写（单点）/ 调 `fetch-sources.js`（批量）
- **不复制 self-check 的 subagent 隔离**（理由同 book-create：单次 1 写，无并发污染）

---

## 2. Architecture

```
.claude/skills/source-create/
├── SKILL.md                              # 主入口：5 步状态机 + 4 源模式路由
│
└── shared/
    ├── spec-bundles.md                   # 规范包（SPEC-source + general）+ 指纹
    ├── strategy.md                       # 单/批选择 + 4 源模式选择模板
    ├── gate.md                           # 字形策略 gate + 冲突 4 选项
    ├── skeleton.md                       # source.md 落盘规则（裸篇名）
    └── sources/
        ├── url.md                        # 模式 A：3 子模式 L1/L2/L3 + auto-detect
        ├── text.md                       # 模式 B：纯文本/文件
        ├── image-pdf.md                  # 模式 C：图片/PDF
        └── script.md                     # 模式 D：调 fetch-sources.js
```

**为什么独立成 `source-create/` 而非 `book-create/`：**

- book-create 是建 catalog.md 入口；source-create 是写 articles/{篇名}/source.md 录入层
- 两者职责正交：book-create 完成后才能 source-create；source-create 完成后才能 interp-create / skill-create
- 数据 pipeline 是清晰的链：DAG 而非树
- v1 暂各占顶层，v2 再考虑合并

**与 book-create 共享但不复制：**

- `gate.md` 的"冲突 4 选项"复用同一契约
- `skeleton.md` 复用"裸篇名 + 无元信息 blockquote"约定
- `spec-bundles.md` 与 book-create 平行存在（不共享）：book-create 用 SPEC-catalog 指纹，source-create 用 SPEC-source 指纹

---

## 3. 4 源模式契约

| 模式 | 适用 | 自动化路径 |
|------|------|------------|
| A. URL | 用户给单篇章 URL（任意站点）| WebFetch (L1) / WebFetch + CSS (L2) / Playwright (L3) |
| B. 文本 | 用户给 .txt / 粘到聊天 / 给文件路径 | Read + LLM 清洗 |
| C. 图片/PDF | 用户给扫描件 | 多模态读图 + LLM 提取 |
| D. 调脚本 | 已有 catalog.html + URL 模式整本 | 调 `node scripts/fetch-sources.js` |

### 3.1 模式 A：URL（含 L1/L2/L3 三子模式）

**L1 通用（默认）**

| 项 | 契约 |
|----|------|
| 输入 | URL 1 个 |
| 处理 | `WebFetch` 取 HTML → LLM 识别主内容 → 提取原文 → 格式化为 source.md |
| 适配 | 任何 WebFetch 能拿正文的静态 HTML 页 |
| 失败回退 | HTML 空 / 明显 JS 渲染 → 自动询问是否走 L3 |

**L2 CSS 提示（精准）**

| 项 | 契约 |
|----|------|
| 输入 | URL + CSS selector（如 `article.content` / `#main-text` / `.article-body`）|
| 处理 | WebFetch HTML → LLM 用 selector 定位主区域 → 在该 DOM 节点内提取 |
| 适配 | 页面 HTML 复杂（正文与广告/导航/页脚混杂）的站点 |
| 优势 | 精度高，避免误提页脚/广告/侧栏 |
| 失败回退 | selector 不匹配 → 回退到 L1（让 LLM 自行识别）|

**L3 JS 渲染（兜底）**

| 项 | 契约 |
|----|------|
| 输入 | URL 1 个 |
| 处理 | `mcp__playwright__browser_navigate` 加载 → `browser_snapshot` 取渲染后 DOM → LLM 提取 |
| 适配 | JS 渲染 SPA（维基百科部分页面 / 现代博客 / 学术平台）|
| 触发条件 | WebFetch 拿不到正文（空 / placeholder / 明显骨架）→ 询问用户是否 L3 |
| 限制 | v1 不持久化浏览器会话（每次新建、用完即关）|

**Auto-detect 流程（Step 3 内部）：**

```
WebFetch URL
  │
  ├─ HTML 含清晰正文 → L1
  │
  └─ HTML 空 / placeholder / 疑似 JS 渲染
       └─ AskUserQuestion 3 选项
            ├─ A. Playwright 兜底（L3）
            ├─ B. 给 CSS selector（L2，重用 WebFetch HTML）
            └─ C. 退出，建议改用模式 C 截屏
```

**主 agent 动作：**

1. WebFetch URL
2. 评估 HTML（用 LLM 判断）：清晰正文 → L1；空/JS 渲染 → 询问
3. 选 L1：直接 LLM 提取
4. 选 L2：用户给 selector → LLM 提取
5. 选 L3：Playwright MCP 取渲染后 DOM → LLM 提取
6. 提取后**严格**：原文照录（一字不改）、段落空行分隔、`> 【注家名】` 块引用包裹
7. 写 source.md：H1 标题（裸篇名）+ 正文 + 注家块

**与 book-create 模式 A 的差异：**
- book-create A 模式（HTML 片段）只解析**目录结构**（标题层级 + 列表）
- source-create A 模式（URL）只解析**单篇章正文**（不解析目录）
- 两者都从 HTML 提取，但目标不同

### 3.2 模式 B：文本

| 项 | 契约 |
|----|------|
| 输入 | 用户给 .txt / 粘到聊天 / 给文件路径 |
| 处理 | `Read` 文件或接收纯文本 → LLM 清洗（去多余空行 / 修正残留格式）→ 写 source.md |
| 清洗原则 | 严格遵守 §五 红线：不解读、不改字、不分段长原文 |
| 字形策略 | 按 catalog.md 声明自动判断：原文照录 / 简体规范化 |

**主 agent 动作：**

1. 收源（读文件 / 接文本）
2. 走 LLM 清洗：去除多余空行、保留段间单空行、识别 `【XX】` 注家标记
3. 写 source.md：H1 + 正文 + 注家块

### 3.3 模式 C：图片/PDF

| 项 | 契约 |
|----|------|
| 输入 | 用户给 1 张扫描页 / 1 个 PDF / 多张扫描页 |
| 处理 | 多模态读图（`Read` 支持图片，PDF 走 Read 直接打开）→ LLM 提取原文 |
| OCR 准确度 | 多模态读图通常 95%+，但异体字/生僻字/竖排扫描易错（与 book-create 模式 C 共享风险）|
| 失败回退 | OCR 结果过短或不可读 → 让用户重新截屏或改用模式 B 手输 |

**主 agent 动作：**

1. 读图（多模态）
2. LLM 识别正文 + 注家标记
3. 写 source.md（同上）

### 3.4 模式 D：调脚本批量

| 项 | 契约 |
|----|------|
| 输入 | 书 slug + 可选篇章列表（逗号或空格分隔）|
| 处理 | 主 agent 调 `node scripts/fetch-sources.js [slug] [chapters] --force --dry-run` |
| 脚本行为 | 已实现：自动发现书、解析 catalog.html + catalog.md、URL 模糊匹配、EXTRACTORS 数组（iwzbz + generic）、t2s 转换（注：t2s 仅在字形策略为"简体规范化"时启用）|
| v1 不扩充 | 站点 EXTRACTORS 仅 iwzbz + generic，不在 v1 加新站点 |
| 主 agent 校验 | 调脚本后核对：source.md 是否存在、内容长度、生成数量 |

**主 agent 动作：**

1. 收源：书 slug + 篇章列表
2. 拼命令：`node scripts/fetch-sources.js 子平真诠 论用神,论伤官 --force --dry-run`
3. Bash 调脚本（先 dry-run 让用户确认范围）
4. 确认后去掉 `--dry-run` 实跑
5. 读产出（`ls books/子平真诠/articles/论用神/source.md` 存在性 + 行数）
6. 收尾报告

---

## 4. 5 步引导式状态机

主 SKILL.md 实现完整 5 步流程。

```
[Step 1] 选模式（单/批）→ AskUserQuestion 2 选 1
[Step 2] 选源模式（URL/文本/图片/调脚本）→ AskUserQuestion 4 选 1
[Step 3] 收源 + 抓取（URL 模式下 auto-detect L1/L2/L3）
[Step 4] 字形策略 gate（仅当 catalog.md 声明"简体规范化"时弹出）
[Step 5] 落盘（冲突 4 选项：覆盖/备份/取消/退出）
```

### 4.1 Step 1 — 模式（单/批）

- AskUserQuestion 2 选项
- 带参数 `/source-create {single|batch}` → 跳过
- 状态写：`mode ∈ {single, batch}`

### 4.2 Step 2 — 源模式

- AskUserQuestion 4 选项（URL / 文本 / 图片 / 调脚本）
- 选 URL → Step 3 内嵌 auto-detect L1/L2/L3
- 选 调脚本 → Step 3 跳过收源，直接进 Step 4（脚本收 slug + 篇章）
- 状态写：`source_mode ∈ {A, B, C, D}`

### 4.3 Step 3 — 收源 + 抓取

按 `source_mode` 加载 `shared/sources/{mode}.md`：

| 模式 | 动作 |
|------|------|
| A. URL | WebFetch + auto-detect L1/L2/L3（见 §3.1）|
| B. 文本 | Read / 收文本 |
| C. 图片/PDF | Read 多模态 |
| D. 调脚本 | 收 slug + 篇章列表 |

状态写：`source_input`（URL/文本/图片路径/脚本参数）

### 4.4 Step 4 — 字形策略 gate

读 `books/{slug}/catalog.md` blockquote 的 `字形策略` 字段：

| 字段值 | 处置 |
|--------|------|
| `原文照录` | 直接进 Step 5 |
| `简体规范化` | **v1 不自动 t2s**；提示用户"建议走 fetch-sources.js 批量通道（已含 t2s），或手动用 `node scripts/t2s.js` 转换已录文件" |
| 声明缺失 | 视为 `原文照录` |

**为什么 v1 不自动 t2s：** SPEC-source.md §X.3 要求"歧义字清单 + 人工 spot-check"，全流程复杂；v1 字形 gate 退化为"提示"，不阻塞流程。

### 4.5 Step 5 — 落盘

按 `shared/skeleton.md` 规则：

1. 检查 `books/{slug}/articles/{篇名}/source.md` 是否已存在
   - 不存在 → 直接写
   - 存在 → **4 选项**（覆盖 / 备份为 .bak / 取消 / 退出）
2. 写 source.md（H1 篇名 + 正文 + 注家块）
3. 报告：单点 1 行 / 批量 N 行 + 汇总
4. 不自动跑 `node scripts/generate.js`（与 book-create 一致）

---

## 5. 主 agent 行为规范

### 5.1 上下文隔离

source-create **不传历史上下文**给 subagent（虽然 v1 不调 subagent，但如 v2 引入需遵守）。

### 5.2 写入责任 — 主 agent 直写

- 单点（A/B/C）：主 agent `Write` source.md
- 批量（D）：调 `fetch-sources.js` 自己写 → 主 agent 校验产出

**理由：** 与 book-create 一致——1 次 1 写（单点）或 N 次脚本写（批量），隔离 subagent 价值低。

### 5.3 关键红线（来自 SPEC-source.md §五）

主 agent 在写 source.md 时**必须**遵守：

1. 严禁混入解读内容
2. 严禁修改原文用字
3. 严禁添加现代标点以外的标记（仅 `> 【注家名】` 块引用是例外）
4. 严禁分段处理长段原文
5. 严禁添加空行以外的任何内容

LLM 提取时若"想顺手改字"必须主动拒绝。提取 prompt 显式声明："严字不改，照录原字形"。

---

## 6. 与 fetch-sources.js 协作（v1 关键决策）

| 模式 | 是否调脚本 | 理由 |
|------|----------|------|
| A. URL 单点 | ❌ 不调 | 单点灵活性优先；LLM 通用通道 + 任意站点；脚本是 CLI 不适合单点 |
| B. 文本 单点 | ❌ 不调 | 本地输入，脚本无意义 |
| C. 图片/PDF 单点 | ❌ 不调 | OCR 不是脚本专长 |
| D. 调脚本 批量 | ✅ 调 | 已有 CLI 成熟（EXTRACTORS + t2s + 进度条 + 错误日志）；不重复造轮子 |

**fetch-sources.js 能力继承：**
- EXTRACTORS 数组（iwzbz.com + generic）
- catalog.html + catalog.md 联合解析
- t2s 转换（仅"简体规范化"时启用）
- 注家标记 `【XX】` 检测
- 进度条 + 错误日志

**v1 不动 fetch-sources.js 内部代码**——脚本是 data layer，skill 是 UI layer。

---

## 7. Playwright 集成（L3 子模式）

### 7.1 复用项目已有 MCP server

- MCP server: `playwright`（已在项目 MCP 列表中）
- 关键工具：
  - `mcp__playwright__browser_navigate` 加载 URL
  - `mcp__playwright__browser_snapshot` 取渲染后 DOM（可访问性树形式）
  - `mcp__playwright__browser_evaluate` 必要时执行 JS（如等待动态加载完成）

### 7.2 L3 流程

```
1. mcp__playwright__browser_navigate {url}
2. 等待页面加载（mcp__playwright__browser_wait_for 或 sleep）
3. mcp__playwright__browser_snapshot 拿 DOM 文本
4. LLM 在渲染后 DOM 上做 L1 同等提取
5. 不持久化浏览器会话（每次新建、用完即关）
```

### 7.3 限制

- v1 不处理登录态 / cookies
- v1 不处理验证码
- v1 不持久化浏览器 session
- v1 不抗反爬

---

## 8. 错误处理

| 失败点 | 处置 |
|--------|------|
| Step 3 收源失败 | 提示换源模式，不退出 |
| Step 3 WebFetch 返回空 | 询问 L2/L3 |
| Step 3 L3 Playwright 失败 | 报告后退出，建议模式 C 截屏 |
| Step 3 OCR 结果过短 | 重新截屏或改模式 B |
| Step 3 调脚本失败（非 0 退出） | 报告 stderr，不重试 |
| Step 4 字形"简体规范化" + 用户不愿手动 | 询问"是否继续原文照录录入" |
| Step 5 source.md 已存在 | 4 选项（覆盖/备份/取消/退出） |
| Step 5 写文件失败（权限/磁盘） | 报告后退出 |
| 调脚本后产出校验失败（行数过少/缺失篇）| 报告详情，让用户决定 |
| 规范包指纹漂移 | 警告用户决定 |

**规范包漂移防护：**

`spec-bundles.md` 存指纹。格式：`<行数>:<sha256_hex[:16]>`（sha256 输入 = 前 5 个 H2 标题拼接）。Step 4 启动时算一次。漂移 → 警告用户决定。

---

## 9. 报告（不落盘，与 self-check 不同）

落盘成功后，主 agent 输出 markdown 报告（写在主对话里）：

```markdown
## source-create 录入完成

> 时间：YYYY-MM-DD HH:MM
> 模式：{single|batch}
> 源模式：A / B / C / D（A 时标注 L1/L2/L3）
> 字形策略：原文照录 / 简体规范化
> 批次数：1 / N

### 产物

- `books/{slug}/articles/{篇名}/source.md`（行数 + 字符数）
- ...

### 后续建议

1. 跑 `node scripts/generate.js` 刷新数据文件
2. 跑 `/self-check source {slug}` 做合规扫描
3. （如需解读）准备进入 v2 interp-create

### 状态

- [x] Step 1-5 全部完成
- [x] 字形策略 gate 通过
- [x] 落盘冲突已处理
```

不持久化到 `.claude/notes/source-create/`（v1 不开此路径）。

---

## 10. 与其他 skill 的关系

### 10.1 与 book-create

- 顺序依赖：book-create 完成 → source-create 才能录原文
- book-create 写 `books/{slug}/catalog.md`（入口）
- source-create 写 `books/{slug}/articles/{篇名}/source.md`（录入层）
- 两者都遵循"裸篇名 + 不带编号前缀"约定
- 两者都共享冲突 4 选项 gate 形态

### 10.2 与 self-check

- 顺序依赖：source-create 完成 → self-check source 才能扫
- self-check source 类别扫描 source.md 是否合规
- source-create 的产出应 100% 通过 self-check source

### 10.3 与 v2 siblings（interp-create / skill-create）

- 顺序依赖：source-create 完成 → interp-create → skill-create
- v2 siblings 暂未设计；本 spec 不预判

### 10.4 不共享 self-check 的 subagent 调度

- self-check 跑 N 篇文章并行扫描，需要 subagent 隔离
- source-create 单点 1 写、批量走脚本，subagent 价值低
- 共享资产：spec-bundles 指纹思路（但 spec 本身独立）

---

## 11. 不在范围（v1 明确不做）

| 项 | 留到 | 原因 |
|----|------|------|
| 站点 EXTRACTORS 扩充（CText / 国学大师 / 殆知阁 等）| v2 | 批量已够用 2 站点；单点由 LLM 通用通道覆盖 |
| 字形"简体规范化"自动 t2s + 歧义字 spot-check | v2 | 全流程复杂；v1 字形 gate 退化为"提示" |
| 报告落盘到 .claude/notes/source-create/ | v2 | v1 报告仅主对话输出 |
| 隔离 subagent 写入 | v2 | 主 agent 直写 + 调脚本足够 |
| 浏览器会话持久化（cookies / 登录态）| v2 | v1 每次新建、无状态 |
| 错误恢复（断点续传）| v2 | fetch-sources.js 已有进度条 |
| 干跑 case 落盘 | v2 | v1 3 干跑 case 仅做结构性验证 |
| 跨书批量（如"录所有未录入的篇章"）| v2 | 一次性扫描 N 本书，复杂度高 |
| 与 self-check 报告格式统一 | v2 | 写入 vs 只读两套体系 |
| 引入新依赖（cheerio / puppeteer 等）| 不做 | 走 LLM 通用能力 + Playwright MCP |

---

## 12. 测试方案

### 12.1 3 个干跑用例（v1 强制通过）

| # | 模式 | 源 | 通过判据 |
|---|------|----|----------|
| 1 | A-L1 通用 | 神峰通考某未录篇章 URL（静态 HTML 站点）| 5 步走通；source.md 写出；generate.js 解析无报错 |
| 2 | A-L2 CSS | URL + CSS selector（HTML 复杂的站点）| LLM 用 selector 精准定位；同上 |
| 3 | A-L3 JS 渲染 | 一个 SPA URL（维基百科 / 现代博客）| WebFetch 空 → 询问 → Playwright 兜底 → 提取 |

**通过判据统一：**
- 5 步引导不出错
- 字形策略 gate 正确弹出（如适用）
- 落盘冲突 4 选项正确触发（如适用）
- source.md 元信息字段（无！SPEC-source.md 不要求 blockquote）齐全但简洁
- 段落空行分隔、注家 `> 【XX】` 块引用
- generate.js 解析无报错
- 不混入解读内容（红线条 1）

### 12.2 静态合规测试（开发期手动跑）

- SKILL.md 必含 5 步状态机
- `shared/sources/*.md` 4 份文件存在性
- `shared/spec-bundles.md` 指纹与正本 SPEC 同步
- `shared/skeleton.md` 模板与 SPEC-source.md §三 / §五 逐字对齐

### 12.3 后续扩展（v1 不做）

- 批量 case（A/B/C 各 5 篇）
- 干跑 case 落盘到 .claude/notes/source-create/INDEX.md
- 与 self-check 联检（录入后立即 self-check）

---

## 13. 提交策略

- **第一批（3 个干跑用例通过后）：** 单 commit
  - `feat(source-create): 初版录入原文 skill，含 4 源模式 + 单/批双模 + URL 模式 L1/L2/L3 三子模式`
- **后续按 issue 演进：** 每次扩展（站点 EXTRACTORS 扩充 / 字形自动 t2s）单开 commit

---

_本 spec 定义 source-create 录入原文 skill 的设计契约，从属《research-dispute》规范体系；任何与 general.md / SPEC-source.md 冲突处，以正本规范为准。v1 范围严格限定为 source-create（原文录入）；v2 interp-create（解读）/ skill-create（技能沉淀）的 skill 设计待本次实施完成后再开新 spec 讨论。_
