# interpretation.md 落盘规则

主 agent 在 Step 6 落盘时创建产物：`books/{slug}/articles/{篇名}/interpretation.md`

## 与 source.md 的关键差异

| 维度 | source.md | interpretation.md |
|------|-----------|-------------------|
| 元信息 blockquote | **无**（元信息在 catalog.md）| **无**（同上） |
| 一级标题 | `# {篇名}` 裸篇名 | **无 H1**（不重复篇名）|
| 块引用 | 仅 `> 【注家名】` 注家 | 多类块引用（【原文】/【原注】/【诸家评】/【后人补注】/【夹注】/【异文标注】/【命造】/【占例】）|
| 表格 | 无 | 允许（流派分歧 / 案例对比）|
| Mermaid | 无 | 允许（套 §2.4 规则）|
| Markdown 语法 | 仅 `>` 块引用 | 允许块引用 + 二~四级标题 + **粗体** + 表格 + mermaid + 原生简单 HTML |

## interpretation.md 模板

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

## 字段填充规则

- 无 H1（裸篇名由目录系统推导）
- 二级标题从原文中提炼，禁 source 分层标签作标题
- 注家标识优先读 catalog.md 预设；缺失用兜底（【原文】/【原注】/【诸家评】/【后人补注】/【夹注】）
- 引文必须 `>` 块引用 + 完整整句
- 通俗注释融入写作语言（无独立【白话】行）
- 案例必须原典/原注自带，禁自创

## 冲突 4 选项（Step 6 内部）

**触发：** interpretation.md 已存在

| 选项 | 含义 | 后续动作 |
|------|------|---------|
| A. 覆盖 | 替换现有文件 | 写新内容，旧文件丢失 |
| B. 备份为 .bak | 旧文件改名为 interpretation.md.bak，新文件写入 | 旧内容可回滚 |
| C. 取消 | 放弃本次录入 | 退出，不写文件 |
| D. 退出 | 放弃整个 interpretation-create 流程 | 退出 |

**实现：** `scripts/lib/conflict.js` 的 `resolveConflict(choice, filePath, newContent)`。

## 落盘顺序

1. 调 self-check 精简版（详见 `quality-gate.md`）→ fatal=0 才继续
2. 检查 `books/{slug}/articles/{篇名}/interpretation.md` 是否已存在
3. 存在 → 主 agent 走 4 选项 gate（subagent 派发时由主 agent 替用户决定）
4. 不存在或已决定 → 写文件
5. 不自动跑 `node scripts/generate.js`，由用户决定
