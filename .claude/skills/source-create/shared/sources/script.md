# 模式 D：站点分析 + 抓取决策 + 自生成（方法论契约）

## 输入契约

- **必填：** 书 slug（与 `books/{slug}/` 一致）
- **必填：** `books/{slug}/catalog.md`（篇章列表来源）
- **推荐：** `books/{slug}/catalog.html`（Step 3.1 站点分析 URL 取样）
- **可选：** 篇章列表（逗号或空格分隔；缺省 = 整本所有未录篇章）

## 主 agent 流程

### Step 3.1 站点分析

读 catalog.html 中 1-2 篇 URL，用 LLM 推断：

- `siteType`：古籍站 / 文献库 / 博客 / 论坛 / 学术平台 / 未知
- `urlPattern`：URL 模板（如 `<base>/<book>/<chapter>.html`）
- `isSSR`：是否需要 JS 渲染（true 走 Playwright，否则 fetch 即可）
- `hasPagination`：是否分页（true 需遍历页码）

产物：`siteAnalysis = { siteType, urlPattern, isSSR, hasPagination }`

### Step 3.2 探查现有抓取工具

详见 `shared/sources/probe.md`。

运行时在 `scripts/` 子树扫 `.js` 文件，识别 fetch/scrape/crawl/source 类工具，
查是否覆盖目标站点。

产物：`probeResult = { existingTools: [...], uncovered: bool }`

### Step 3.3 决策路由

| 探查结果 | skill 动作 |
|---|---|
| 探到 1+ 候选且覆盖目标站点 | 告知用户工具名 + runner，等用户决定执行权 |
| 探到 0 个候选 | 进入 Step 3.4 自生成 |
| 探到但都不覆盖 | 告知候选清单 + 建议用户在工具内补 extractor（**skill 不做**） |

### Step 3.4 自生成临时脚本（仅未探到或用户明确选择时）

详见 `shared/sources/scratch-template.md`。

加载 prompt 模板 → 注入 siteAnalysis / chapterList / skeletonRedLines / formatSpec
→ LLM 生成一次性 Node 脚本 → 落 `.scratch/<slug>-<YYYYMMDD>.js`
→ 跑 `node --check <path>` 自检（语法错回退 Step 3.4 重生成，最多 3 次）

### Step 3.5 dry-run 合并 gate

AskUserQuestion 一次性呈现：

| 项 | 内容 |
|---|---|
| 范围 | slug + 篇章数 + 估算耗时 |
| 抓取方式 | 自生成 / 复用 X / 用户自跑 |
| 执行权 | AI 经确认后跑 / 用户自跑 |

### 执行

- **用户自跑**：skill 打印完整命令（自生成脚本路径 / 复用工具的 runner），等用户回报
- **AI 跑**：skill 跑进程 → 捕获 stdout/stderr → 回到 Step 5 红线复核

### Step 5 红线复核

详见 `shared/skeleton.md` 红线 5 条（不混解读 / 不改字 / 不加标记 / 不分段 / 不加空行外的任何内容）。

抽检：

- 抽 3-5 篇 source.md：注家块 / 字形 / 段长 / 空行 / 无解读
- 抽 1-2 篇含注家：`> 【XX】` 块引用完整
- 抽 1-2 篇长段：未被错误分段

`fatal > 0` → 不接受产出，提示手工修补或回 Step 2。

## 红线

1. **不绑定任何外部脚本路径**——probe.md 的探查方法不含具体路径
2. **不修改任何已有抓取工具**——`scripts/fetch-source/` 作为外部工具实例之一存在，skill 不动它
3. **不自动覆盖已有 source.md**——4 选项 gate（覆盖/备份/取消/退出）沿用

## 失败兜底

| 异常 | 处置 |
|---|---|
| 站点分析失败（catalog.html 缺失 / URL 不可达） | 报告 + 询问：改 URL 子模式 / 改源模式 / 取消 |
| 探查失败（`scripts/` 不存在 / 无 `.js`） | 视为"未探到"，进入自生成 |
| 探到但不覆盖 | 告知候选清单 + 建议补 extractor（skill 不做） |
| 自生成脚本语法错 | 回 Step 3.4 重新生成，最多 3 次 |
| 自生成脚本产出红线违规 | 报告违规项 + 不接受产出 + 让用户决定 |
| 用户取消 dry-run gate | 不写脚本、不跑，退出模式 D |
| 用户拒绝 AI 执行 | skill 打印命令，等用户回报 |
| 自生成脚本运行时网络失败 | 脚本内已重试 3 次；最终失败 → 非 0 退出 → skill 报告 stderr |
| 自生成脚本产物行数过短（< 100 字） | 报告可疑篇名 + 让用户决定 |

## 共享契约引用

| 契约 | 路径 |
|---|---|
| 探查方法论 | `shared/sources/probe.md` |
| 自生成 prompt 模板 | `shared/sources/scratch-template.md` |
| source.md 落盘规则 + 红线 | `shared/skeleton.md` |
| 字形策略 gate | `shared/gate.md` |