# skill-create 3 门点模板

## GATE 1: 强装载（Step 1a 之后）

**触发**：用户确认 `slug` 后，进入 Step 1b 之前。

**动作**：

1. Read `research-dispute/SPEC-skill.md` 全文
2. Read `research-dispute/general.md` 全文
3. Read `research-dispute/{术数}.md`（如 `bazi.md`，从 catalog.md 术数字段取）
4. Read `books/{slug}/catalog.md` 全文
5. 跑 `python3 scripts/self-check-fingerprint.py | grep -E "SPEC-skill|general.md|bazi.md"`
6. 把 14 条指纹打印到对话上下文

**不通过处置**：

- SPEC-skill.md 缺失 → 全阻断，提示「请先恢复 research-dispute/SPEC-skill.md」
- 14 指纹漂移 → 警告用户，让其选择「继续 / 重启流程」

## GATE 2: 原文体检（Step 2）

**触发**：用户确认 `篇名` 后，进入 Step 3 之前。

**动作**：

1. 检查 `books/{slug}/articles/{篇名}/source.md` 是否存在
2. 检查 `books/{slug}/articles/{篇名}/interpretation.md` 是否存在
3. 检查 `books/{slug}/catalog.md` 是否存在（软依赖，仅警告不阻断）

**不通过处置**：

| 缺失项 | 处置 |
|--------|------|
| source.md | 阻断，3 选项门：调 source-create / 取消 / 退出 |
| interpretation.md | 阻断，3 选项门：调 interpretation-create / 取消 / 退出 |
| catalog.md | 警告，继续（不阻断） |

## GATE 3: 落盘前（Step 4）

**触发**：Step 3 写完主体后，落盘之前。

**动作**：

1. 14 条指纹自检（详见 `spec-bundles.md`）
2. 跑 `cat -An books/{slug}/articles/{篇名}/skill.md` 自查行号/字符

**不通过处置 — 4 选项门**：

- A. **覆盖**：直接 Write 覆盖旧版
- B. **备份**：先 `cp skill.md skill.md.bak.{N}` 再 Write
- C. **取消**：保留草稿在上下文，不落盘
- D. **退出**：丢弃草稿，结束 skill-create

**全部通过 → 进入 Step 5 落盘。**

## 中断与重启

每个 Step 间允许用户输入 `/exit` 中断：

- 未落盘内容自动不保存
- 重新启动从 Step 1a 开始（**不续上次的进度**）
