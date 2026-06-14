# interpretation-create 解读生成技能设计

> **Spec Version:** 2026-06-14
> **Status:** Draft
> **Parent Design:** `2026-06-09-self-check-skill-design.md`（共享合规门调度思路）
> **Siblings:**
> - `2026-06-10-book-create-skill-design.md`（建 catalog.md，前置依赖）
> - `2026-06-11-source-create-skill-design.md`（录 source.md，前置依赖）
> **v1 范围：** 仅 interpretation-create（解读生成）；skill-create 留 v2
> **核心立场：** 砍掉"4 源家族整齐"的执念，按 interpretation 真实需求设计为**单点 / 批量两个独立选项**。

---

## 1. Goal

为五术研究项目提供**针对 source.md 生成解读**的入口：

- **入口**：`/interpretation-create` 起手
- **2 模式**：单点（聚焦 1 篇）/ 批量（整本或子集）
- **过程**：6 步引导式状态机（无"源模式"步骤） + 1 次强装载 gate + 1 次原文体检 gate + 落盘前 self-check 合规门
- **输出**：`books/{slug}/articles/{篇名}/interpretation.md`
- **强约束**：每次解读严格遵守 `research-dispute/SPEC-interpretation.md` + `research-dispute/general.md` + 术数专项（如 `bazi.md`）
- **写入方式**：主 agent 直写（单点） / 调 `scripts/generate-interpretations.js`（批量，新写）
- **与 source-create 的关键边界**：interpretation-create 的"源"就是 source.md 本身——**不**复用 source-create 的 URL / 文本 / 图片-PDF 三种"补录原文"模式

---

## 2. Architecture

```
.claude/skills/interpretation-create/
├── SKILL.md                              # 主入口：6 步状态机 + 单/批双模
│
└── shared/
    ├── spec-bundles.md                   # 规范包（SPEC-interpretation + general + 术数专项）+ 指纹
    ├── strategy.md                       # 单/批选择模板 + 批量命令模板
    ├── load-gate.md                      # 强装载 gate：5 份规范 Read 顺序 + 打印确认
    ├── condition-check.md                # 原文体检 gate：6 项检查清单
    ├── pipeline.md                       # 主体 9 步流水线（套 §五 Step 3-9 + §七 自评）
    ├── skeleton.md                       # interpretation.md 落盘规则
    ├── quality-gate.md                   # 落盘前 self-check-interpretation 调用协议
    └── script.md                         # 批量模式：调 generate-interpretations.js
```

**为什么 interpretation-create 不复用 source-create 的 4 源：**

source-create 的 4 源（URL / 文本 / 图片-PDF / 调脚本）解决的是"**原文从哪里来**"——`source.md` 还不存在。interpretation-create 的上游是已存在的 `books/{slug}/articles/{篇名}/source.md`，**没有"补录原文"的需求**。如果硬把 A/B/C 三个源模式塞进来，会把"补录"伪装成"写解读"，反而是陷阱。

**"家族整齐"的取舍：**

- 表面看 book-create 4 源 / source-create 4 源 / interpretation-create 2 模式，确实不齐
- 实际看，源数量 = 真实输入种类数，与形态无关
- 用户在三个 skill 间切换时不会因"少 2 个选项"误用——多出的选项是陷阱

**与 source-create 共享但不复制：**

- `spec-bundles.md` §指纹动态化思路复用
- `gate.md` 的"冲突 4 选项"形态复用（改名为 `quality-gate.md`，加入 self-check 调用）
- **不**共享 `sources/{url,text,image-pdf}.md`——语义错位

---

## 3. 2 模式契约

| 模式 | 适用 | 自动化路径 |
|------|------|------------|
| **单点** | 1 篇 source.md → 1 篇 interpretation.md | 主 agent 强装载 5 份 + 体检 + 9 步流水线 + self-check 合规门 + 直写 |
| **批量** | N 篇 source.md → N 篇 interpretation.md | 调 `node scripts/generate-interpretations.js`（新写） + 主 agent 复核 + 报告 |

### 3.1 模式：单点

**输入：**
- `books/{slug}/articles/{篇名}/source.md` 必须已存在
- 篇章在 `catalog.md` 表格中已有编号

**主 agent 动作：**
1. Step 1 选模式：单点（用户主动选 / shortcut 跳过）
2. Step 2 收源：定位 `books/{slug}/articles/{篇名}/source.md`，`Read` 全文
3. Step 3 强装载 gate：依次 `Read` 5 份规范（详见 §4）
4. Step 4 原文体检 gate：跑 6 项检查（详见 §5），输出体检报告
5. Step 5 主体 9 步流水线：套 `SPEC-interpretation.md` §五 Step 3-9（详见 §6）
6. Step 6 落盘：调 self-check-interpretation 合规门 → 冲突检查 → 写 interpretation.md

**输出：**
- `books/{slug}/articles/{篇名}/interpretation.md`

### 3.2 模式：批量

**输入：**
- 书 slug（与 `books/{slug}/` 一致）
- 篇章列表（逗号分隔；缺省 = 整本所有未解读篇章）
- 篇章对应的 `source.md` 必须已存在

**主 agent 动作：**
1. Step 1 选模式：批量
2. Step 2 收源：书 slug + 篇章列表
3. Step 3 强装载 gate：主 agent 强装载 5 份规范
4. Step 4 拼命令并 dry-run：
   ```bash
   node scripts/generate-interpretations.js <slug> <chapter1>,<chapter2> --force --dry-run
   ```
5. 用户确认 → 去掉 `--dry-run` 实跑
6. 脚本内部 per-篇：体检 + 9 步流水线 + self-check 合规门 + 落盘
7. 主 agent 收尾：扫 `books/{slug}/articles/*/interpretation.md` 完整性 + 抽样复核

**脚本能力继承清单（v1 必含）：**
- 读 `books/{slug}/catalog.md` 元信息（术数 / 类别 / 强装载规范清单）
- 遍历指定篇章的 `source.md`
- per-篇：调 subagent（隔离主 agent 上下文）跑 9 步流水线（脚本负责 subagent prompt 装订 5 份规范）
- per-篇：调 self-check-interpretation 作为合规门
- 失败篇章：记日志 + 跳过 + 收尾报告汇总
- `--force`：覆盖已存在 interpretation.md
- `--dry-run`：预览
- 进度条 + 错误日志 + 模糊篇章名匹配

**v1 不扩充的项：**
- 不处理 OCR 错字二次订正（v2 待）
- 不做跨篇章关联（SPEC §一.2 ❌项 5 严格禁止）
- 不做"LLM 二次元标签自动检测"（v2 待 LLM 评估器集成）

**批量预期耗时（同 source-create 模式 D）：**
| 篇章数 | 典型耗时 |
|--------|---------|
| 1-10 篇 | 1-3 分钟 |
| 10-50 篇 | 3-15 分钟 |
| 50-200 篇 | 15-60 分钟 |
| 200+ 篇 | 60+ 分钟，建议分批 |

---

## 4. 强装载 gate（Step 3）

**触发：** 主 agent 在进入体检 gate / 主体流水线前

**5 份必装载规范：**

| # | 文件 | 何时读 | 打印确认 |
|---|------|--------|---------|
| 1 | `research-dispute/SPEC-interpretation.md`（337 行）| Step 3 起始 | `⏳ 正在通读 SPEC-interpretation.md（337 行）⏳` |
| 2 | `research-dispute/general.md`（含 14 条红线）| 紧接 #1 | `⏳ 正在通读 general.md（含 14 条红线）⏳` |
| 3 | `research-dispute/{术数专项}.md`（如 `bazi.md`）| 紧接 #2 | `⏳ 正在通读 {术数专项}.md ⏳` |
| 4 | `books/{slug}/catalog.md` | 紧接 #3 | `⏳ 正在通读 books/{slug}/catalog.md ⏳` |
| 5 | `books/{slug}/articles/{篇名}/source.md` | 紧接 #4 | `⏳ 正在通读 source.md ⏳` |

**5 份全读完后，主 agent 输出一行总结确认：**

```
✅ 已完整通读 5 份规范（SPEC-interpretation + general + {术数专项} + catalog + source）
```

**未达 5 份不进入 Step 4。**

**任一文件缺失的处置：**

| 缺失文件 | 处置 |
|----------|------|
| SPEC-interpretation.md | 立即终止（无规范可循） |
| general.md | 立即终止（14 条红线是刚性约束） |
| 术数专项（如 bazi.md）| 立即终止（领域硬约束） |
| catalog.md | 立即终止（无元信息） |
| source.md | 立即终止（无原文） |

**指纹动态化：**

复用 `spec-bundles.md` §指纹校验思路：

```bash
python3 scripts/self-check-fingerprint.py | grep -E "SPEC-interpretation|general.md|bazi.md"
```

- 主 agent 跑实时指纹，与"上次录入时的指纹"对比
- 不一致 → 警告用户"规范有更新，是否继续用旧规范解读？"
- 不在本文件维护死值

---

## 5. 原文体检 gate（Step 4）

**触发：** 强装载 gate 通过后、主体 9 步流水线启动前

**6 项检查：**

| # | 检查项 | 判据 | 输出 |
|---|--------|------|------|
| 1 | 模式判定 | `mode_of()` 函数（SPEC §一.1）：< 500 字符 = 短篇 / 500-2000 = 标准 / ≥ 2000 = 密集 | `模式：标准` |
| 2 | 有无案例 | 扫 source.md 含 `命造` / `占例` / `例如` / `如` + 八字 | `案例：是（N 个）` |
| 3 | 有无注家 | 扫 source.md 含 `> 【` 块引用 或 `【XX】` 注家标记 | `注家：是（{注家名}）` |
| 4 | 有无版本异文 | 扫源（如 catalog.md / source.md 块）含"一作 X / 异文 / 另一版本" | `异文：是` |
| 5 | 有无脱漏/残缺 | 扫 source.md 含 `【脱漏】` / `【残缺】` / `【原文此处残缺】` | `脱漏：是` |
| 6 | 是否超长 | 有效正文字符 > 5000 | `超长：是（{字符数}）` |

**体检报告输出格式：**

```
# 原文体检报告
- 模式：标准
- 案例：是（2 个）
- 注家：是（任铁樵 / 沈孝瞻）
- 异文：否
- 脱漏：否
- 超长：否
```

**异常场景策略（套 SPEC §六）：**

| 体检项 | 策略 |
|--------|------|
| 模式=短篇 | 主体 9 步 §结构梳理 段强制"原文本体文本分析"（句式 + 关键用字 + 篇名选址）|
| 模式=密集 | 主体 9 步 §结构梳理 段允许"分独立理论点"但仍按内容自由组织 |
| 案例=否 | 不设案例章节（套 §三 §1 反机械化规则：案例跟随其所属理论点，**无案例则无案例章节**）|
| 注家=否 | 仅解读【原文】本义（套 §六 §3）|
| 异文=是 | 套 §六 §1 模板：原典籍正文 + 异文标注双块引用 |
| 脱漏=是 | 套 §六 §2 固定标注：`【原文此处残缺/字句脱漏】` |
| 超长=是 | 不拆文件，在原章节内 `####` 分段梳理（套 §六 §6）|

**体检报告作为 Step 5 主体流水线的输入条件。**

---

## 6. 主体 9 步流水线（Step 5）

**套 `SPEC-interpretation.md` §五 Step 3-9 + §七 自评：**

| Step | 动作 | 输出 |
|------|------|------|
| 3 | 内容结构梳理 | 拆段、标注家、分类理论与案例；提取二级标题（反机械化规则）|
| 4 | 逐段引用+表层解读 | 套 §2.1 模板：一引一解；术语当场释义融入语言 |
| 5 | 案例/分歧处理 | 套 §2.2 案例模板；流派分歧客观陈列 |
| 6 | 深化洞见（按需）| LLM 自判：确有深层意蕴时撰，无则不强写 |
| 7 | 图解补充（按需）| 套 §2.4 必用/禁用规则 |
| 8 | 自评合规分（0-5）| 套 §七 清单逐项自评 |
| 9 | 输出最终文件 | 自评 ≥ 4 才输出 |

**§七 自评 5/4/3 分制：**
- 5 分：致命错误 0 + 格式错误 0 + 内容检查 0
- 4 分：致命错误 0 + 格式错误 0 + 内容检查 ≤ 1
- < 4 分：现场重写（不退出）；最多 3 次重写仍 < 4 → 报告用户决定

**反元自我引用硬规则（套 §一.4 §6）：**
- 禁"本解读""本文""本篇解读"
- 禁 `【原文此处疑似 OCR 错字】` 等带【】的元自我标签
- 禁 `mode_of()` / `SPEC §X.X` / `按 SPEC 公式判为` 等流水线术语
- 禁"**本篇模式**""**模式判定**"等文首元数据 blockquote
- 改写方向：「此言……」「按……」「盖……」「观此造……」

---

## 7. 落盘 + 合规门（Step 6）

**7.1 调 self-check-interpretation 作为合规门**

- 主 agent 写完 interpretation.md（草稿在主上下文）→ 调 self-check-interpretation subagent
- self-check 报告按 `shared/report-template.md` 落盘到 `.claude/notes/self-check/{书-slug}-interpretation-{date}.md`
- fatal 数 = 0 → 准许落盘
- fatal 数 > 0 → 报告致命项 → 回 Step 5 重写（spec 收紧的部分）

**7.2 冲突检查**

- `books/{slug}/articles/{篇名}/interpretation.md` 已存在 → 4 选项（覆盖 / 备份为 .bak / 取消 / 退出）
- 与 source-create 共享同一 4 选项形态

**7.3 写文件**

- Write 完整 interpretation.md
- 不自动跑 `node scripts/generate.js`，由用户决定

**7.4 收尾报告**

- 模式：单点 → 输出产物路径 + 自检合规分
- 模式：批量 → 扫 N 个 interpretation.md + 汇总报告（成功 N / 失败 M / fatal 列表）
- **不落盘**（与 source-create / book-create 报告策略一致）

---

## 8. interpretation.md 落盘规则

**与 source.md 落盘的关键差异：**

| 维度 | source.md | interpretation.md |
|------|-----------|-------------------|
| 元信息 blockquote | **无**（元信息在 catalog.md）| **无**（同上） |
| 一级标题 | `# {篇名}` 裸篇名 | 无 H1（不重复篇名）|
| 块引用 | 仅 `> 【注家名】` 注家 | 多类块引用（【原文】/【原注】/【诸家评】/【后人补注】/【夹注】/【异文标注】/【命造】/【占例】）|
| 表格 | 无 | 允许（流派分歧 / 案例对比）|
| Mermaid | 无 | 允许（套 §2.4 规则）|
| Markdown 语法 | 仅 `>` 块引用 | 允许块引用 + 二~四级标题 + **粗体** + 表格 + mermaid + 原生简单 HTML |

**interpretation.md 模板：**

```markdown
## {理论点 1 标题（从原文关键词抓取，反机械化）}

> 【原文】完整原文整句

义理解读正文（引后必解；术语当场释义融入语言）

> 【原注】完整原注整句

解读续

## {理论点 2 标题}

> 【原文】完整原文整句

义理解读正文

（案例跟随其所属理论点，不单独抽离）
> 【命造一（原注第X段）】基础信息

案例解读：罗列基础信息 → 格局/流程分析 → 结合原文结论

## 全书定位（笼统表述，不做具体跨篇断言）

{末节}
```

**字段填充规则：**
- 无 H1（裸篇名由目录系统推导）
- 二级标题从原文中提炼，禁 source 分层标签作标题
- 注家标识优先读 catalog.md 预设；缺失用兜底（【原文】/【原注】/【诸家评】/【后人补注】/【夹注】）
- 引文必须 `>` 块引用 + 完整整句
- 通俗注释融入写作语言（无独立【白话】行）
- 案例必须原典/原注自带，禁自创

---

## 9. 错误处理总览

| 失败点 | 处置 |
|--------|------|
| Step 3 任一规范文件缺失 | 立即终止 + 缺失清单（**SPEC §五 Step 1.1 刚性条款**）|
| Step 3 通读未达 5 份 | 不解锁 Step 4 |
| Step 4 体检某项异常 | 报告用户 + 套 §六 对应规则继续 |
| Step 5 §七 自评 < 4 分 | 现场重写；最多 3 次仍 < 4 → 报告用户决定 |
| Step 6 self-check fatal > 0 | 报告致命项 + 回 Step 5 重写 |
| Step 6 文件冲突 | 4 选项（覆盖 / 备份 / 取消 / 退出）|
| Step 6 写失败 | 报告 + 退出，清理已写部分 |
| 批量模式脚本失败（非 0 退出）| 报告 stderr + 列出失败篇章，不重试 |
| 批量模式 per-篇失败 | 记日志 + 跳过 + 收尾报告汇总 |
| 批量模式规范指纹漂移 | 警告用户（与 source-create 复用策略）|

---

## 10. 测试策略

**v1 最小测试集：**

1. **契约单测**：每份 `shared/*.md` 契约可在 spec fixture 库跑校验
   - `condition-check.md` 6 项检查规则化后可被 grep 验证
   - `pipeline.md` 9 步列表可被结构化解析验证
2. **端到端单点测试**：对 1 篇已存在的 source.md（如 `子平真诠/articles/论用神/source.md`）跑 `/interpretation-create single`，主 agent 确认：
   - 产物路径 `interpretation.md` 存在
   - self-check-interpretation 报告 0 fatal
   - 反元自我引用 grep 全 0
3. **批量回归**：对 1 本书的 5-10 篇跑批量模式，确认：
   - 脚本产出 N 个 interpretation.md
   - 失败篇章有日志
   - 主 agent 抽样复核通过
4. **红线回归**：人工 spot-check 1-2 篇"易违规"原文（流派分歧 / 异文 / 案例 / 短篇），确认产物：
   - 无自创理论
   - 无元自我引用
   - 注家标识统一
   - 通俗注释融入写作语言

**不写自动化 LLM-as-judge**（v1 阶段）——v2 待 LLM 评估器集成。

---

## 11. 显式不在 v1 范围

- 跨书跨篇章关联（SPEC §一.2 ❌项 5 严格禁止）
- LLM 二次元标签（"本解读..."）自动检测（v2 待 LLM 评估器集成）
- source.md 侧 `.meta.json` 机制（v2 源侧扩展）
- interpretation 跨术数迁移（v2 待紫微斗数等专项文件）
- 协作式 / 注入式 / 反馈式等"非主路径"模式（v2 视用户反馈再考虑）

---

## 12. 与其他 skill 的关系

| 关系对象 | 关系性质 | 接口 |
|----------|----------|------|
| **book-create**（前置）| 依赖 catalog.md | Step 3 强装载读 catalog.md |
| **source-create**（前置）| 依赖 source.md | Step 2 收源读 source.md；不共享 URL/文本/PDF 三种"补录"源 |
| **self-check-interpretation**（后置·合规门）| Step 6 强制调用 | fatal 走主 agent 落盘 gate；subagent 永不直接改文件 |
| **writing-plans**（设计完成后）| brainstorming 收尾转交 | 由 writing-plans 写实施计划 |
| **self-check**（同源族）| 共享 spec-bundles.md 指纹动态化思路 | 复用指纹校验机制 |

---

## 13. 与 source-create 的最终对比

| 维度 | source-create | interpretation-create |
|------|---------------|----------------------|
| 模式数 | 单/批 × 4 源 = 8 组合 | 单/批（无源步骤）= 2 组合 |
| 步骤数 | 5 步 + 1 字形 gate | 6 步 + 1 强装载 gate + 1 体检 gate |
| 强装载 | 仅 2 份（SPEC-source + general）| **5 份**（多 source.md / catalog.md / 术数专项）|
| 体检 | 无 | 6 项（SPEC §六硬规则化）|
| 主体流水线 | 模式 A/B/C/D 各自流程 | **统一 9 步**（套 SPEC §五 Step 3-9）|
| 自评 | 无 | **5/4/3 分制**（套 SPEC §七）|
| 合规门 | 无（落盘后由 self-check 兜底）| **落盘前必调** self-check-interpretation |
| 写入契约 | 严字不改（客观）| 解读合规（主观，主线强约束）|
| 批量脚本 | 复用 fetch-sources.js | **新写** generate-interpretations.js |
| 元自我引用 | 不适用 | **硬禁**（SPEC §一.4 §6）|

**核心立场：interpretation-create 比 source-create 在"约束性"上强一个量级——"流程性"弱（少分支），"契约性"强（多红线、多 gate、多自评）。**

---

## 14. v2 路线图（占位，待源侧 / 评估器就位后启动）

- 协作式 / 注入式 / 反馈式模式
- LLM 二次元标签自动检测（LLM-as-judge）
- 跨书跨篇章关联（前提：SPEC §一.2 ❌项 5 修订）
- source.md `.meta.json` 机制（OCR 异文 / 脱漏位置结构化）
- 紫微斗数 / 六爻等术数专项文件
- 与 skill-create 的衔接（v2 启动后再设计）

---

_本 spec 定义 interpretation-create v1 的设计契约，支持五术平台所有典籍的解读生成。_
