# source-create 模式 D 独立性改造设计

> **日期**：2026-07-01
> **范围**：`.claude/skills/source-create/` 模式 D（调脚本批量）+ 新增 `.scratch/`
> **前置规范**：[SPEC-source.md](../../research-dispute/SPEC-source.md)、《开发指南》`docs/DEVELOPMENT_GUIDE.md`
> **关联 skill**：`.claude/skills/source-create/`、`.claude/skills/book-create/`

---

## 一、目标

让 `source-create` skill **独立于**任何外部抓取脚本工作。模式 D（批量录入）不再硬编码调用 `scripts/fetch-source.js`，改为：

1. **站点分析**（运行时）→ 推断目标站点类型与 URL 规律
2. **探查现有抓取工具**（运行时）→ 在 `scripts/` 子树找能覆盖目标站点的现成工具
3. **决策路由**（三选一）→ 复用现有工具 / 建议补 extractor / 自生成临时脚本
4. **自生成临时脚本**（必要时）→ 按 SPEC-source.md §五 红线 5 条产 source.md，落 `.scratch/` 留底
5. **执行权交回用户** → skill 不擅自执行，由用户或用户确认后的 AI 执行

**驱动力（已确认）：**

1. 现 `shared/sources/script.md` 直接写死 `node scripts/fetch-source.js run …` 命令模板
2. skill 契约与具体工具路径强绑定，离开 `scripts/fetch-source.js` 就跑不起来
3. 五术研究项目应有可替换的工具集——skill 是流程规范层，不该被工具实现绑架
4. 用户体验闭环：批量录入应该"skill 给方案 → 用户确认 → 执行"，而非"skill 直接跑外部脚本"

**非目标**（显式排除）：

- 不改 `scripts/fetch-source.js` / `scripts/fetch-source/` 任何代码（仍是可用工具）
- 不改 SPEC-source.md（本次改造仅触及 skill 契约层）
- 不引入新 npm 依赖
- 不改 mode A/B/C（仅模式 D 重写）
- 不写运行时单元测试（涉及 skill 流程的人工对话，无 CI 自动化价值）
- 不重写 `scripts/lib/` 任何已有纯函数

---

## 二、最终结构

```
.claude/skills/source-create/
├── SKILL.md                                # 改：Step 3 拆 3.1-3.5
└── shared/
    ├── gate.md                             # 不动
    ├── skeleton.md                         # 不动
    ├── spec-bundles.md                     # 不动
    ├── strategy.md                         # 改：模式 D 描述 + 移除脚本命令模板
    └── sources/
        ├── url.md                          # 不动（模式 A）
        ├── text.md                         # 不动（模式 B）
        ├── image-pdf.md                    # 不动（模式 C）
        ├── script.md                       # 重写：站点分析 + 决策 + 自生成方法论
        ├── probe.md                        # 新增：探查现有抓取工具方法论
        ├── scratch-template.md             # 新增：自生成脚本 prompt 模板
        ├── SPEC-source.md                  # 不动（规范副本）
        └── general.md                      # 不动（规范副本）

scripts/
├── fetch-source.js                         # 不动（外部工具实例之一）
├── fetch-source/                           # 不动

.scratch/                                   # 新增：临时抓取脚本留底（gitignore）
└── <slug>-<YYYYMMDD>.js                    # skill 自生成的一次性脚本

.gitignore                                  # 新增 1 行：/.scratch/
```

**模块职责边界：**

- `probe.md` — 探查方法论契约，规定 skill 在 `scripts/` 子树找抓取工具的运行时步骤；**不**预设任何脚本路径
- `scratch-template.md` — skill 自生成一次性 Node 脚本的 prompt 模板契约；脚本**必须**遵守 SPEC-source.md §五 红线 5 条
- `script.md` — 模式 D 全流程契约，从「命令转发」改为「站点分析 + 探查 + 决策 + 自生成 + 执行权」
- `strategy.md` — Step 2 模式 D 描述 + 移除原「批量脚本调命令模板」段
- `SKILL.md` — Step 3 模式 D 拆为 3.1-3.5 五个子步骤

---

## 三、模式 D 数据流

```
[Step 3.1 站点分析]
   │ 读 catalog.html 1-2 篇 URL
   │ LLM 推断: siteType / urlPattern / isSSR / hasPagination
   │ 产物: siteAnalysis = { siteType, urlPattern, isSSR, hasPagination, ... }
   │
   ▼
[Step 3.2 探查现有抓取工具]
   │ 扫 scripts/ 子树 .js 文件（位置不预设）
   │ 识别: 文件名/注释含 fetch/scrape/crawl/source 关键字
   │ 匹配: 候选是否声明覆盖目标站点
   │ 产物: probeResult = { existingTools: [...], uncovered: bool }
   │
   ▼
[Step 3.3 决策路由]
   ├─ 探到 1+ 候选且覆盖 → 告知用户工具名 + runner, 等用户决定执行权
   ├─ 探到 0 个 → 进入 Step 3.4 自生成
   └─ 探到但都不覆盖 → 告知候选清单 + 建议用户在工具内补 extractor（skill 不做）
   │
   ▼
[Step 3.4 自生成临时脚本]（仅未探到或用户明确选择时）
   │ 加载 shared/sources/scratch-template.md prompt
   │ 注入 siteAnalysis / chapterList / skeletonRedLines / formatSpec
   │ LLM 生成一次性 Node 脚本代码
   │ 落 .scratch/<slug>-<YYYYMMDD>.js
   │ 跑 node --check 自检（语法错回退 Step 3.4 重生成，最多 3 次）
   │
   ▼
[Step 3.5 dry-run 合并 gate]
   │ AskUserQuestion 一次性呈现:
   │   - 范围 (slug + 篇章数 + 估算耗时)
   │   - 抓取方式 (自生成 / 复用 X / 用户自跑)
   │   - 执行权 (AI 经确认后跑 / 用户自跑)
   │
   ▼
[执行]
   ├─ 用户自跑: skill 打印完整命令，等用户回报结果
   └─ AI 跑: skill 跑进程 → 捕获 stdout/stderr → 回到 Step 5 红线复核
   │
   ▼
[Step 5 红线复核]
   │ 抽 3-5 篇 source.md: 注家块 / 字形 / 段长 / 空行 / 无解读
   │ 抽 1-2 篇含注家: > 【XX】 块引用完整
   │ 抽 1-2 篇长段: 未被错误分段
   │ fatal > 0 → 不接受产出，提示手工修补或回 Step 2
```

---

## 四、关键契约文件内容草案

### 4.1 `shared/sources/probe.md`（新增）

```markdown
# 探查现有抓取工具（模式 D 内部）

## 目标

模式 D 进入后，主 agent **不知道也不假设**项目内有哪些抓取工具，
要在 `scripts/` 子树做一次运行时探查，找能覆盖目标站点的现成工具。

## 探查方法（运行时执行，不预设路径）

1. 用 Bash 工具扫 `scripts/` 下所有 `.js` 文件
   （如 `find scripts/ -name '*.js' -type f`）
2. 用 Read/grep 抽查每个候选文件的文件头注释，识别：
   - 文件名/注释含 `fetch/scrape/crawl/source` 关键字
   - 注释或代码含明确站点名 / extractor 列表
3. 对每个候选，查找是否声明覆盖目标站点
4. 形成候选清单：`[{name, path, covers: [站点列表], runner: 调命令模板}]`

## 决策路由（探查完成后）

| 探查结果 | skill 动作 |
|---|---|
| 探到 1+ 候选且覆盖目标站点 | 告知用户工具名 + runner 命令，让用户决定执行权（用户自跑 / AI 经确认后跑） |
| 探到 0 个候选 | 进入自生成临时脚本流程（见 scratch-template.md） |
| 探到但都不覆盖 | 告知用户候选清单 + 推荐用户在工具内补 extractor（**skill 不做**补 extractor） |

## 红线

- 不预设任何脚本路径
- 不修改任何已有抓取工具
- 不在探查过程中执行任何抓取
```

### 4.2 `shared/sources/scratch-template.md`（新增）

```markdown
# 自生成临时抓取脚本 prompt 模板

skill 在模式 D 进入自生成流程时，按本模板构造 prompt，调用 LLM 生成
一次性 Node 脚本。脚本**必须**遵守 SPEC-source.md §五 红线 5 条产 source.md。

## 输入

| 字段 | 来源 |
|---|---|
| slug | 用户输入 |
| chapterList | catalog.md 篇章列表 |
| siteType / urlPattern / isSSR | Step 3.1 站点分析产物 |
| skeletonRedLines | shared/skeleton.md 红线 5 条 |
| formatSpec | source.md H1 + 正文 + `> 【注家名】` 块引用 |

## Prompt 模板（注入到 LLM 调用）

你是一个 Node.js 抓取脚本生成器。任务：生成**一次性**脚本，
落盘到 `.scratch/<slug>-<YYYYMMDD>.js`，
从 `<siteType>` 站点批量抓取 `<chapterList>` 各篇章原文，
并按 SPEC-source.md §五 红线 5 条产 source.md。

【严字不改】
- 不修改任何字形（含异体字、避讳字、繁简差异）
- 不混入解读
- 不分段处理长段
- 不加非 `> 【注家名】` 块引用之外的标记
- 段与段之间用单空行分隔

【输出格式】
- 每篇一个 `books/<slug>/articles/<篇名>/source.md`
- H1 标题 = 裸篇名（无编号前缀）
- 注家以 `> 【{注家名}】` 块引用包裹

【约束】
- 使用 Node 18+ 原生 fetch
- 内嵌 USER_AGENT / 限速 / 重试 3 次（429 / 5xx 退避）
- 使用项目 `scripts/lib/utils.js` 的 `stripHtml / progressBar / formatDuration`（已存在）
- 不引入新依赖
- 不修改 scripts/fetch-source/* 任何文件

【输出】
仅输出 Node 脚本完整代码（不解释过程、不输出 markdown 围栏外内容）。
```

### 4.3 `shared/sources/script.md`（重写）

替换为「站点分析 + 探查 + 决策 + 自生成 + 执行权 + 红线复核」全流程契约。每个步骤只描述「skill 该做什么」和「产出物」，不绑定任何外部脚本路径。明确步骤编号：

1. Step 3.1 站点分析
2. Step 3.2 探查现有抓取工具（详见 probe.md）
3. Step 3.3 决策路由
4. Step 3.4 自生成临时脚本（详见 scratch-template.md）
5. Step 3.5 dry-run 合并 gate
6. 执行
7. Step 5 红线复核

### 4.4 `shared/strategy.md`（修改）

- Step 2 模式 D 描述改为：「用户给书 slug + 篇章列表（catalog.md 必需，catalog.html 用于站点分析）」
- 移除「批量脚本调命令模板」整段
- 末尾加一句：「v1 模式 D 不绑定任何外部脚本路径；详见 sources/probe.md + sources/scratch-template.md」

### 4.5 `SKILL.md` Step 3（修改）

```
旧 Step 3:
  Step 3 — 收源 + 抓取
  D. 调脚本   收 slug + 篇章列表（dry-run 后实跑）

新 Step 3:
  Step 3.1 — 站点分析（仅模式 D）
  Step 3.2 — 探查现有抓取工具（仅模式 D）
  Step 3.3 — 决策路由（复用 / 建议补 extractor / 自生成）
  Step 3.4 — 自生成临时脚本（必要时，详见 scratch-template.md）
  Step 3.5 — dry-run 合并 gate（范围 + 方式 + 执行权）
```

---

## 五、.scratch/ 约定

- 入口路径：项目根目录下的 `.scratch/`（与 `scripts/`、`books/` 平级）
- 目录不存在 → skill 在 Step 3.4 之前 `mkdir -p`
- 文件名规范：`<slug>-<YYYYMMDD>.js`（如 `子平真诠-20260701.js`）
- `.gitignore` 新增一行：`/.scratch/`
- 失败不删，留底供复盘 / 用户手动清

---

## 六、错误处理

| 失败点 | 触发条件 | 处置 | 回退到 |
|---|---|---|---|
| 站点分析失败 | catalog.html 缺失 / URL 不可达 / HTML 空 | 报告 + 询问：改 URL 子模式 / 改源模式 / 取消 | Step 2 |
| 探查失败 | `scripts/` 不存在 / 无 `.js` 文件 | 视为"未探到"，进入自生成 | Step 3.4 |
| 探查到但不覆盖 | 候选清单中无覆盖目标站点的工具 | 告知用户候选清单 + 建议补 extractor（skill 不做） | Step 2 或退出 |
| 自生成脚本语法错 | `node --check` 或自检失败 | 回 Step 3.4 重新生成，最多 3 次 | Step 3.4 |
| 自生成脚本产出红线违规 | Step 5 抽检发现 fatal > 0 | 报告违规项 + 不接受产出 + 让用户决定：手工修补 / 重跑 / 改源模式 | Step 2 或退出 |
| 用户取消 dry-run gate | AskUserQuestion 选"取消" | 不写脚本、不跑 | 退出模式 D |
| 用户拒绝 AI 执行 | AskUserQuestion 选"用户自跑" | skill 打印完整命令（自生成脚本路径 / 复用工具的 runner）+ 等待用户回报 | 等用户输入 |
| 自生成脚本运行时网络失败 | 429 / 5xx / 超时 | 脚本内已重试 3 次退避；最终失败 → 非 0 退出 → skill 报告 stderr | Step 2 或退出 |
| 自生成脚本产物行数过短 | `< 100` 字标记过短 | 报告可疑篇名 + 让用户决定：补录 / 重抓 / 接受 | Step 2 或退出 |
| 字形策略 `简体规范化` 且未启 t2s | Step 4 gate 触发 | 提示用户：复用现有工具跑（含 t2s）/ 手动 `node scripts/t2s.js` 转换 | Step 4（沿用现有 gate） |
| 落盘冲突 | source.md 已存在 | 4 选项（覆盖/备份/取消/退出），沿用现有 | Step 5（沿用） |
| 规范指纹漂移 | Step 4 gate 启动时指纹与上轮不一致 | 警告 + 用户决定继续/重启 | Step 4（沿用） |

**核心原则：**

1. skill **永不**静默失败——任何 fatal 必有 stderr 摘要 + 受影响篇章清单
2. skill **永不**自动覆盖已有 source.md——4 选项 gate 沿用
3. 自生成脚本跑失败**永不**自动删除 `.scratch/` 留底文件——用户可手动清

---

## 七、测试策略

本次是契约文档 + skill 状态机改造，**不写运行时代码**（`.scratch/` 是 skill 生成的，不是项目代码）。所以测试策略聚焦「契约自检 + 演练路径」。

### 7.1 契约层自检（必做）

| 检查项 | 方法 | 通过标准 |
|---|---|---|
| skill 契约不出现脚本路径 | grep `scripts/fetch-source` 在 `.claude/skills/source-create/shared/sources/`（契约层目录） | 0 命中；规范副本目录（SPEC-source.md）允许引用 |
| skill 契约不出现 `node scripts/...` 命令模板 | grep `node scripts/` 在 `.claude/skills/source-create/shared/sources/` | 0 命中 |
| `.scratch/` 已在 .gitignore | grep `.scratch` 在 `.gitignore` | 1 命中 |
| Step 3 拆分语义完整 | 人工审 `SKILL.md` | 3.1-3.5 五步骤齐全 |
| probe.md 不预设路径 | grep `scripts/fetch-source` 在 `probe.md` | 0 命中 |
| scratch-template.md prompt 模板含红线 5 条 | grep 5 条关键词 | 全命中 |

### 7.2 演练路径（手动，1 次）

不走 CI，因为涉及 skill 流程的人工对话：

1. 选 1 本已有 catalog.md + catalog.html 的书（如 `穷通宝鉴`）
2. 在 Claude Code 内跑 `/source-create batch D`
3. 走完 Step 3.1-3.5 + Step 5 全流程
4. 验证：source.md 字节级正确 / `.scratch/` 留底文件存在且可读 / 跑完后 skill 不报红线 fatal
5. 故意制造一次失败（如关网络）→ 验证 §六 错误处理

### 7.3 回归检查

- 已录 source.md 不动（变更只触及 skill 契约）
- `scripts/fetch-source.js` 完全不动（仍是可用工具）
- 模式 A/B/C 不受影响（仅 D 重写）

---

## 八、变更总览

| 文件 | 操作 | 改动量 |
|---|---|---|
| `.claude/skills/source-create/SKILL.md` | 改 Step 3 | 约 30 行 |
| `.claude/skills/source-create/shared/strategy.md` | 改 Step 2 模式 D 描述 + 移除脚本模板 | 约 10 行 |
| `.claude/skills/source-create/shared/sources/script.md` | 重写 | 约 100 行 |
| `.claude/skills/source-create/shared/sources/probe.md` | 新增 | 约 40 行 |
| `.claude/skills/source-create/shared/sources/scratch-template.md` | 新增 | 约 60 行 |
| `.scratch/` | 新增目录 + `.gitkeep` | 1 文件 |
| `.gitignore` | 新增 1 行 `/.scratch/` | 1 行 |

**总计**：5 个契约文件改动 + 1 个目录新建 + 1 行 .gitignore。

**不动**：SPEC-source.md / `scripts/fetch-source.js` / `scripts/fetch-source/` / mode A/B/C / `scripts/lib/`。