# 报告落盘格式

## 每本书一份报告

文件位置：`.claude/notes/self-check/{书-slug}-{type}-{YYYY-MM-DD}.md`

模板：

```markdown
# {书名} — {类型}自检报告

> 生成时间：YYYY-MM-DD HH:MM
> 类型：catalog | source | interpretation | skill
> 覆盖范围：{N} 篇（books 模式）| 单篇「{篇名}」（篇章模式）
> 随机种子：{seed 或 "未指定"}
> 抽检：{全检 | 抽检 N 篇}
> goal：{用户给定 goal 选项 + 抽检模式，如 "sample + 本批通过" / "all + 连续 2 轮自检"}

## 总览

| 严重度 | 数量 | 示例 |
|--------|------|------|
| fatal  | 0    | —    |
| error  | 3    | F002 |
| warn   | 7    | F005 |
| info   | 2    | F011 |

## findings 清单

### F001 [error] 违反 §X.Y
- 书：{slug} 篇：{篇名}
- 位置：{location}
- 原文片段：{quote}
- 违反说明：{explanation}
- 建议修复：{suggested_fix}

### F002 ...
```

## 汇总索引

文件位置：`.claude/notes/self-check/INDEX.md`

每次自检完成后追加一行（不覆盖已有行）：

```markdown
# 自检历史索引

| 日期 | 类型 | 书籍 | 报告 | fatal/error/warn |
|------|------|------|------|------------------|
| 2026-06-09 | source | 滴天髓阐微 | [link] | 0/2/5 |
| 2026-06-08 | interpretation | 子平真诠 | [link] | 0/1/3 |
```

`[link]` 格式：相对路径 `./{书-slug}-{type}-{date}.md`。
