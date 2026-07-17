# 插图 subagent 契约

插图子流程（mode=illustrate）调用 subagent 对 interpretation.md 做只读分析，输出是否值得插图、prompt、图题、位置。主 agent 拿结果做逐图确认 + 调 t2i + 写 md。

**subagent 不传历史上下文。** prompt 全文 = 角色段 + 规范包段 + 任务段 + 输出模板段（仿 self-check subagent 契约风格）。

## 隔离硬底线

- subagent **只读** interpretation.md，不改文件
- subagent **不调 t2i**，不下载图片，不写任何文件
- subagent **不输出 md 编辑片段**，只输出结构化分析结果
- 主 agent 在 Step 4 拿 subagent 结果后做落盘

## 输入

| 字段 | 来源 |
|------|------|
| `file_path` | interpretation.md 路径 |
| `book_slug` | 从 file_path 推导（如 `books/穷通宝鉴/...` → `穷通宝鉴`） |
| `article_slug` | 从 file_path 推导（如 `穷通宝鉴/articles/四月甲木/...` → `四月甲木`） |
| `existing_illustrations` | 主 agent 在派发前 grep `md` 内 `![](/images/articles/`，列出已存在的图片路径（用于 subagent 上下文） |

> **已有插图判定：** 主 agent 派发 subagent 前先 grep，若 md 内已存在 `![](/images/articles/...` 引用，**直接跳过插图流程**（不派 subagent），报告"已有插图，跳过"。subagent 假设被调用时 md 无插图。

## subagent 任务

通读整篇 interpretation.md，判定：

1. **是否值得插图**（should_illustrate）：宁缺毋滥
   - 默认 `false`
   - 仅当全文有鲜明意象可作为视觉锚点时 `true`（如意象具体、可感、画面感强——"枯木待润"、"春初寒湿"、"杀逞财势"等）
   - 八字命例堆叠、干支术语密布、纯抽象义理论述等场景 → `false`
   - 单篇上限 1 张（subagent 不必考虑上限问题，密度约束在主 agent 侧）

2. **图性质**（必为意境/氛围图）：subagent 必须理解"非结构图、非信息承载图"——任何关系图、流程图、表格应归 mermaid(R15)，不由本流程生成

3. **插入位置**（position）：固定为 `before_first_h2`（篇首：H1 后 / 第一个 `##` 前），不需 subagent 决策

4. **图题**（caption）：5-15 字中文短语，与篇章意象契合；与 R15 mermaid 图题风格对齐

5. **t2i prompt**（prompt）：中文为主，可附简短英文风格关键词。须覆盖：
   - 主体意象（篇章核心场景）
   - 风格（默认水墨/国画/古典意境，因 R1 是命理古籍）
   - 色调（与篇章情绪匹配——暖/冷/中性）
   - 不要包含文字（避免在图上写字）

## 输出模板

subagent 必须返回结构化 JSON（用 `mcp__sequential-thinking__sequentialthinking` 整理思路后输出，或直接以 JSON 块返回）：

```json
{
  "should_illustrate": true,
  "reason": "篇章以'四月甲木枯木待润'为核心意象，有鲜明画面感，适合作为视觉锚点",
  "prompt": "水墨国画风格，墨色淡雅。画面主体为一株初夏将枯的古木，枝干遒劲而叶色枯黄，根部湿润有水气蒸腾。背景留白，远处一抹远山淡影。整体色调偏冷，传达'待润'之渴。无文字。",
  "caption": "四月甲木·枯木待润",
  "position": "before_first_h2",
  "confidence": "high"
}
```

或不需要插图时：

```json
{
  "should_illustrate": false,
  "reason": "全文以六十甲子纳音表与干支配对为主，纯数据/术语密布，无鲜明意象可作视觉锚点"
}
```

## 主 agent 落盘流程

拿到 subagent 输出后：

1. **should_illustrate=false**：
   - 报告"LLM 判定无需插图"
   - 写入 notes/format-check/{book}-{article}-illustrate.md 留痕
   - 退出

2. **should_illustrate=true**：
   - AskUserQuestion 展示：插入位置 + 图题 + prompt + confidence
   - 选项：[生成并插入] [改 prompt] [跳过]
   - 用户确认后：
     - `mkdir -p ./public/images/articles`（若不存在）
     - 调用 `node scripts/t2i.js --prompt "<prompt>" --name {书名}-{篇名} --output-dir ./public/images/articles`
     - 等待 t2i 完成，确认输出文件存在
     - Edit interpretation.md 在 H1 后插入：
       ```
       ![**{caption}**](/images/articles/{书名}-{篇名}.png)

       **图：{caption}**
       ```
     - 重新 Read 写入区域，确认引用路径正确
     - 报告插图结果

3. **subagent 报告不合规**（缺字段、prompt 含文字、confidence 非 high/medium/low）：重新派发一次；二次不合规则放弃，记录到 notes

## 失败模式

| 失败场景 | 处理 |
|---------|------|
| subagent 报告 `should_illustrate=true` 但 prompt 含「写有XX文字」类描述 | 拒绝生成，提示 subagent prompt 含文字会导致图上写字，重新派发 |
| t2i 调用失败 | 报告"图片生成失败"，不动 md |
| t2i 成功但输出文件名与预期 `{书名}-{篇名}.png` 不一致 | 拒绝写入 md（避免引用与文件错位），报告"文件名不符，已中止写入" |
| md 已存在指向同一路径的 `![`（race condition） | 拒绝写入，报告"已有同名引用" |

## 命名规范

文件名 = `{书名}-{篇名}.png`，与 `src/data/books.ts` 封面图命名风格一致（全中文）。

- 例：`穷通宝鉴-四月甲木.png`
- t2i 调用：`--name 穷通宝鉴-四月甲木 --output-dir ./public/images/articles`
- md 引用：`/images/articles/穷通宝鉴-四月甲木.png`

> t2i 的 `validateName` 禁字符清单（`/ \ : * ? " < > | 控制字符`）不含中文字符，命名合法。