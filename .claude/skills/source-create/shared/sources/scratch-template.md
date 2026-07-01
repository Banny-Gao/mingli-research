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
- 不修改项目已有抓取工具的任何文件

【输出】
仅输出 Node 脚本完整代码（不解释过程、不输出 markdown 围栏外内容）。
