# 修复执行器契约

主 agent 根据模式和 issue 的 fix_type 执行修复。

## 修复模式

### --fix 自动修复模式

直接应用修复，不询问用户。仅在 interpretation.md 上生效。

**可自动修复的规则：**

| 规则 | 修复操作 | 使用的工具 |
|------|----------|-----------|
| R1 | 韵文行尾加 `  `（两空格）或转双换行 | Edit |
| R5 | `###` → `##`（去掉一个 #） | Edit |
| R6 | 引用块/正文段间插入空行分段 + 关键术语加粗（仅 `--analyze`） | Edit |
| R7 | 引用块段间插入空 `>` 行 | Edit |
| R10 | 3+ 空行 → 2 空行 | Edit |
| R13 | 删除行尾空格 | Edit |
| R14 | 补全缺失的节点定义 | Edit |

**跳过的规则：**
- R2（代码块包裹引用，` ``` ` 是合法语法，需用户确认意图）
- R3, R4, R15（需要 LLM 分析）
- R8, R9, R11, R12（建议类，不自动修）

### 交互模式

对每个 issue 按严重度排序展示：

1. 输出 issue 描述 + 上下文（前后 2 行）
2. AskUserQuestion：应用修复 / 跳过 / 查看完整上下文
3. 用户选择后执行

交互问题模板见各规则的 `rules/*.md` 中的"交互模板"。

### --analyze LLM 分析模式

对 R3, R4, R15 触发 LLM 深度分析（仅 interpretation.md）：

**R3 LLM 流程：**
1. 主 agent 阅读全文
2. 识别内容的逻辑分段（按主题/论域切换点）
3. 为每段生成 5-15 字的 `##` 标题
4. 列出标题建议列表，AskUserQuestion 逐条确认
5. 确认后 Edit 写入文件

**R4 LLM 流程：**
1. 主 agent 阅读含 `【】` 标记或平铺引用块的区域
2. 识别每个条目的主题
3. 为每个条目生成 `###` 标题
4. 列出标题建议列表，AskUserQuestion 逐条确认
5. 确认后 Edit 写入文件

**R15 LLM 流程：**
1. 主 agent 阅读 Mermaid 图代码
2. 分析图的逻辑结构（分组、层级、方向）
3. 生成优化建议：
   - 方向调整（LR→TD）
   - subgraph 分组建议
   - 节点标签缩短建议
   - 图标题建议
4. AskUserQuestion 逐项确认
5. 确认后 Edit 写入文件

**R6 正文 LLM 流程（`--analyze` 下，仅 interpretation.md）：**
1. 主 agent 阅读正文文字墙段落
2. 识别语义断点（句号、分号、转折处）→ 拆段插空行
3. 识别关键术语（如"用神""格局""日主""食伤"等命理术语）→ 加 `**` 粗体
4. 列出拆段 + 加粗建议，AskUserQuestion 逐条确认
5. 确认后 Edit 写入文件

## 插图子流程（mode=illustrate）

详见 `shared/illustrator.md`。主 agent 执行步骤：

1. 确认 target 为 interpretation.md（否则报错退出）
2. 判定已有插图：grep md 内是否出现指向 `/images/articles/` 的 `![` → 若有，提示"已有插图，跳过"并退出
3. 派 subagent（按 `illustrator.md` 契约）只读 interpretation.md → 输出 `{should_illustrate, reason, prompt, caption, position}`
4. 若 `should_illustrate=false`，报告"LLM 判定无需插图"，结束
5. 若 `should_illustrate=true`，AskUserQuestion 逐图确认：
   - 展示：插入位置 + 图题 + t2i prompt
   - 选项：[生成并插入] [改 prompt] [跳过]
6. 用户确认后，创建 `./public/images/articles/`（若不存在）
7. 调用 t2i：`node scripts/t2i.js --prompt "<prompt>" --name {书名}-{篇名} --output-dir ./public/images/articles`
8. 等待 t2i 完成，确认输出文件存在
9. Edit 写入 interpretation.md 篇首（H1 后 / 第一个 `##` 前）：
   ```markdown
   ![**图题**](/images/articles/{书名}-{篇名}.png)

   **图：{图题}**
   ```
   （图题行格式与 R15 mermaid 图题约定对齐）
10. 重新 Read 写入区域，确认引用路径正确

**全本插图逃生阀：** `--illustrate` 不与 `--book` 同用（Step 1 已拦截）。如用户在按书场景需要插图，须逐篇手动触发 `/format-check --illustrate <file>`；已有插图的篇章在步骤 2 被跳过。

## 修复后验证

每条修复完成后：
1. 重新 Read 修复区域，确认修改正确
2. 如果是 Mermaid 修复（R14/R15），额外检查：`graph` 关键字存在、括号闭合、无孤立引用
3. 插图修复完成后，额外检查：md 引用路径与 t2i 输出文件名一致、图题存在
4. 修复失败 → 回退该条修复，记录到 report.skipped

## 报告输出

```
format-check 报告
━━━━━━━━━━━━━━━━
范围：books/{slug}（N 个文件）
模式：{interactive/fix/analyze/illustrate}
━━━━━━━━━━━━━━━━
🔴 严重：M 个
  - 已修复：X
  - 已跳过：Y
🟡 警告：N 个
  - 已修复：X
  - 已跳过：Y
🔵 建议：P 个
  - 已应用：X
  - 已跳过：Y
━━━━━━━━━━━━━━━━
总计：T 个问题，已处理 H 个，跳过 S 个
```

插图模式下报告单独形态：
```
format-check 插图报告
━━━━━━━━━━━━━━━━
目标：{interpretation.md 路径}
LLM 判定：{需插图 / 无需插图}
已生成图片：{文件名}
已写入 md 引用：{引用路径}
━━━━━━━━━━━━━━━━
```
