# subagent 契约

## 上下文隔离

**subagent 不传历史上下文。** prompt 全文 = 角色段 + 规范包段 + 任务段 + 输出模板段。

- 不传其他 subagent 的 finding 列表
- 不传 git log
- 不传历史对话
- 唯一动态内容：本篇文件全文（由主 agent 在派发前 Read 并内联）

## subagent prompt 标准结构

```
[角色段]
你是一个隔离的子审查员。本次任务：{type} 自检，单篇聚焦。
你必须 Read **全部**待检文件，不允许跳过：
- source / interpretation / skill 自检：`books/{slug}/articles/{篇名}/{source|interpretation|skill}.md`
- catalog 自检：`books/{slug}/catalog.md` + `books/{slug}/catalog.html`（两个文件都必读，缺一不可）
你不能 git log、不能 Read 历史对话、不能改任何文件。
你的输出是一份 markdown 报告，写在最终消息里。

[规范包段 - 不可省略]
> 必读：以下为本次任务必须严格遵守的规范正本

## general.md 全文
（内联）

## SPEC-{type}.md 全文
（内联）

## bazi.md 全文（若书的术数=命）
（内联，否则省略）

[任务段]
本次待检文件：{book}/{篇名}
本次自检口径：{goal 描述，含 sample_mode + goal 选项名}
（subagent 不知道"本批"还是"N 批"——这是主 agent 层的语义；subagent 只看到"按规范包逐条过"这一基准）

[输出模板]
请严格按以下 markdown 模板输出。空项写 "无"。

# {书名} — {篇名} — {type}自检报告

> subagent id：sa-{sha256(prompt+timestamp)[:8]}
> 扫描时长：{subagent 自己估算}
> 已对照规范条款：{stats.rules_evaluated 列出}
> 本批 Read 清单：{列出本次实际成功 Read 的文件路径，每行一个，格式 `- books/...`}
> 缺读声明：{若本应 Read 的文件未能成功读取，必须逐条声明路径 + 失败原因；否则写 "无"}

## 总览
- fatal: 0
- error: 0
- warn: 0
- info: 0

## findings

### F001 [error] 违反 §X.Y
- 位置：{file:line 或 section 名}
- 原文片段：{quote ≤80 字}
- 违反说明：{explanation}
- 建议修复：{suggested_fix - 可直接粘贴的 markdown 片段}

### F002 ...

## ⚠️ 待用户确认的修复建议
（仅当 fatal ≥1 时出现，列出全部 fatal 的 fix，供主 agent 在主对话中落盘）
（无 fatal 时此区块整段省略）

[结束]
输出完毕后不要追加任何元说明。
```

## 修复责任 — C+D 组合

**subagent 永不直接改文件。** 这是隔离的硬底线。

- subagent 报告中**所有 finding** 必填 `suggested_fix`（可粘贴的 markdown 片段）
- subagent 报告中**若发现 ≥1 个 fatal**，报告末尾追加区块 `## ⚠️ 待用户确认的修复建议`
- 主 agent 看到 fatal 区块 → **暂停** → AskUserQuestion 问"是否落盘" → 用户确认 → 主 agent 在主对话里**用 Edit 工具**改文件 → 落盘完成 → 写 commit message 草稿（不自动提交）
- non-fatal（error/warn/info）的 fix 仅在报告里呈现，**不**询问用户；用户自行决定何时处理

## 文件存在性硬验证

**Read 任何文件前，必须先用 Glob 通配验证路径存在。** 不允许"直接 Read 后报错"或"凭印象判断不存在"。

- 验证方法：使用 Glob 工具，pattern = `books/{slug}/**/{file}` 或 `books/{slug}/{file}`，确认通配返回非空。
- 若 Glob 返回空：先尝试 Bash `ls -la books/{slug}/` 看实际目录结构；**只有 Glob + Bash 双重确认无匹配**才能在报告中声明 "文件不存在"。
- 中文路径兼容：本环境为 Windows，路径含中文时 Glob/Bash 可能因 GBK 编码静默失败。**编码错误 ≠ 文件不存在**。若工具报 GBK/Unicode 编码错，**必须**在报告中写明 "路径含中文、编码错误、未读"，不得掩盖为 "文件不存在"。
- 失败 fallback：Read 失败时不得掩盖，输出 "Read 失败" 区块，列出尝试过的路径与错误信息。

## 缺读处罚

若本应 Read 的文件缺失或失败，且 subagent 报告**未声明**缺读，直接判定该 subagent 输出作废，需重新派发。父 agent 在主对话中执行：
1. AskUserQuestion 告知用户"subagent 未按契约 Read 全部文件，报告作废"
2. 用户确认后重新派发（同一书同 type）
