# Self-Check Report — 子平真诠 / interpretation

**Date:** 2026-06-15
**Mode:** article
**Goal:** 连续 2 轮无新 fatal 才退出
**Loop:** 达到即停
**Final Result:** ✅ **PASSED — 0 fatal / 0 format (3 轮收敛)**

## 收敛路径

| Round | Fatal | Format | 趋势 | 主要动作 |
|-------|-------|--------|------|----------|
| **Round 1** | **21** | 0 | 起点 | 发现 13 跨篇断言 + 7 元自我 + 1 标题机械化 |
| Round 2 | 6 | 0 | -71% | pipeline.js 增 3 类硬约束 + self-check-lite 7→10 fatal + 重跑批量（48/50 success，2 fail） |
| Round 3 | **0** | 0 | -100% | rule 8/9 二次硬化覆盖 LLM 规避模式 + 修 6 篇存量 + 删 1 篇自评章节 |

## Round 1 → Round 2 → Round 3 修复路径

### Round 1（21 fatal）

**13 篇跨篇断言违规**（§一.2 ❌项 5）:
- 论正官:83 / 论外格用舍:80 / 论宫分用神配六亲:118 / 论喜忌干支有别:114 / 论十干十二支:70 / 等

**7 篇元自我断言违规**（§一.4 §6）:
- 论食神取运:290（最严重——"致命错误（8 项）" 表格进解读正文）
- 论四凶神能成格:92 / 论十干得时不旺失时不弱:155 / 等

**1 篇标题机械化违规**（§一.1）:
- 论四吉神能破格:31（"## 原注申说与四句扩展"）

### Round 2（6 fatal）

**修复动作**:
1. `pipeline.js` 9 步 prompt 模板新增 3 类硬约束（元自我自评 / 跨篇 / 标题机械化）
2. `self-check-lite.js` 扩 7→10 fatal + 2→3 format，共 12 项 grep
3. 重跑批量 50 篇（48/50 success，2 fail）

**剩余 6 fatal 是 LLM 系统性规避新规则**：
- 论偏官:175 "前承论正官之法"（"论" 在 "前承" 后面但被包在篇名里）
- 论刑冲会合解法:259 "前承「论X」"（**全角「」** 替代《》）
- 论用神成败救应:229 / 论相神紧要:119 同「」规避
- 论财:203 "前承格局通论之大要"（**笼统但有方向动词**）
- 论阳刃:105 "前承正官、财、印诸格"（无引号包章名）
- 论偏官:179 "## 自评合规分" 章节（self-check 报告语言进解读）

### Round 3（0 fatal）

**修复动作**:
1. `self-check-lite.js` rule 9 二次硬化：用 positive lookahead `(上承|下启|前承|后启)(?=.{0,4}[《「【'\"”、论章程格])` 覆盖 6 种规避模式
2. 手动修 6 篇存量的"前承/后启"为"本书承...而..."笼统表述
3. 删 论偏官:179 整个 "## 自评合规分" 章节

## 最终状态

```
总 50 篇 | Clean 50 | Format-only 0 | Fatal 0
```

**所有 50 篇均通过 12 项 self-check-lite（10 fatal + 3 format 规则）。**

## Round 3 vs Round 1

- Round 1 → Round 3: 21 → 0 fatal（**-100%**）
- 触发原因：pipeline.js prompt 模板硬约束不足 + self-check-lite.js 规则太宽松 → LLM 自由发挥产生大量元自我 + 跨篇断言 + self-check 报告语言
- 修复路径：3 轮迭代硬化 prompt + regex，最终正则覆盖 LLM 主要规避模式

## Recommendations

### 已完成
- ✅ 12 项 self-check-lite 已覆盖
- ✅ pipeline.js prompt 硬约束已强化
- ✅ 50 篇全检 0 fatal

### 建议（v2 路线）
1. **更强的"模板 + 模板"双层防线**：在 self-check-lite 的 12 项之外，加 1 项"LLM 反向校验"——对 fatal 内容，LLM 主动生成 1 段"为何不违规"的简短辩护（在 LLM 内部），仅当辩护通顺时落盘
2. **跨篇断言的"白名单"**：维护 `books/{slug}/catalog.md` 已记录的篇章顺序作为**合法**跨篇依据白名单——LLM 引用白名单内的篇章不算违规（白名单内的引用是合理的"全书定位"）
3. **prompt 的"反向示例"**：在 9 步 prompt 末尾加 2-3 个**反例**（"❌ 不要这样写：前承《论X》..."），比规则陈述更有效
4. **self-check 报告模板独立化**：把"§七 自评"的 5/4/3 分制明确放到 LLM 内部，不暴露任何字段名（致命错误 / 格式错误 / 内容检查）给 LLM 输出
5. **下一个 book 跑前先 dry-run 5 篇验证 prompt**：避免在 50 篇上重复踩坑

## Round 1 报告引用

Round 1 详细报告见 `.claude/notes/self-check/子平真诠-interpretation-2026-06-14.md`（21 fatal 详单）

本报告（Round 3 收敛）落盘于本文件。
