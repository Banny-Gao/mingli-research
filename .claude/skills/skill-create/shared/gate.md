# skill-create 3 门点模板

## GATE 1: 强装载（Step 1a 之后）

**触发**：用户确认 `section` + `subcategory` 后，进入 Step 1b 之前。

**动作**：

1. Read `shared/sources/SPEC-skill.md` 全文（含"继承自 SPEC-interpretation §2.1"那条对 rules/ 块引用格式的声明）
2. Read `shared/sources/general.md` 全文
3. Read `shared/sources/{术数}.md`（如 `bazi.md`，从 catalog.md 术数字段取）
4. Read `shared/sources/category-tree.json` 全文（确认 CATEGORY_TREE 当前注册情况）
5. 跑 `python3 shared/sources/scripts/self-check-fingerprint.py --project-root shared/sources --source-prefix "" | grep -E "SPEC-skill|general.md|bazi.md"`
6. 把指纹打印到对话上下文

**不通过处置**：

- 副本缺失 → 全阻断，提示「请跑 ingest-skill-sources 重录」
- 17 指纹漂移 → 警告用户，让其选择「继续 / 重启流程」

---

## GATE 2: 原文体检（Step 2）

**触发**：用户确认 `bookSlugs` + `perBook` 后，进入 Step 3 之前。

**动作（每本书每篇循环）**：

1. 检查 `books/{slug}/articles/{篇名}/source.md` 是否存在
2. 检查 `books/{slug}/articles/{篇名}/interpretation.md` 是否存在
3. 检查 `books/{slug}/catalog.md` 中 `> 类别：` 字段 === 本 skill 的 `subcategory`（**类别一致性**）
4. 检查 `books/{slug}/catalog.md` 中 `> 内容类型：` 字段包含 `skill`（如果不含 → 警告但继续，旧书可能未声明 skill 能力）

**不通过处置**：

| 缺失项 | 处置 |
|--------|------|
| source.md | 阻断，3 选项门：调 source-create / 取消 / 退出 |
| interpretation.md | 阻断，3 选项门：调 interpretation-create / 取消 / 退出 |
| 类别不一致 | 阻断，3 选项门：调 catalog.md / 选其他书 / 退出 |
| `skill` 不在内容类型 | 警告，继续（不阻断） |

**迭代模式特别处置**：

- 若 SKILL.md 已存在但 interpretation.md 不存在 → 警告"上游已消失，迭代前是否调 interpretation-create 补齐？"，不阻断（允许纯修订规则不依赖上游重读）

---

## GATE 3: 落盘前（Step 4）

**触发**：Step 3 写完 SKILL.md + rules/ 主体后，落盘之前。

**动作**：

1. **指纹 17 条自检**（详见 SPEC-skill.md §五，完整 17 条清单）
2. **额外 cat 引用完整性校验**（spec §十 风险 7）：

   ```bash
   # 提取 SKILL.md + rules/*.md 中所有 `cat <path>.md` 引用
   grep -hE '`cat\s+[^`]+\.md`' skills/{一级}/{二级}/{slug}/SKILL.md skills/{一级}/{二级}/{slug}/rules/*.md
   # 主 agent 人工核对每个 cat 路径能 resolve 到真实文件
   ```

3. 跑 `cat -An skills/{一级}/{二级}/{slug}/SKILL.md` 自查行号/字符
4. 跑 `cat -An skills/{一级}/{二级}/{slug}/rules/*.md` 自查

**不通过处置 — 4 选项门**：

- A. **覆盖**：直接 Write 覆盖旧版（仅当 SKILL.md / rules/ 已存在）
- B. **备份**：先 `cp SKILL.md SKILL.md.bak.{N}` 再 Write（仅当文件已存在）
- C. **取消**：保留草稿在上下文，不落盘
- D. **退出**：丢弃草稿，结束 skill-create

**全部通过 → 进入 Step 5 落盘。**

---

## 中断与重启

每个 Step 间允许用户输入 `/exit` 中断：

- 未落盘内容自动不保存
- 重新启动从 Step 0 开始（**不续上次的进度**）
- 迭代模式若用户已选 skill → 重新启动需重新走 Step 0.5 选 skill
