# 强装载 gate

主 agent 在进入体检 gate / 主体流水线前必须依次 Read 5 份规范。

## 5 份必装载规范

| # | 文件 | 何时读 | 打印确认 |
|---|------|--------|---------|
| 1 | `shared/sources/SPEC-interpretation.md`（337 行）| Step 3 起始 | `⏳ 正在通读 SPEC-interpretation.md（337 行）⏳` |
| 2 | `shared/sources/general.md`（含 14 条红线）| 紧接 #1 | `⏳ 正在通读 general.md（含 14 条红线）⏳` |
| 3 | `shared/sources/{术数专项}.md`（如 `bazi.md`）| 紧接 #2 | `⏳ 正在通读 {术数专项}.md ⏳` |
| 4 | `books/{slug}/catalog.md` | 紧接 #3 | `⏳ 正在通读 books/{slug}/catalog.md ⏳` |
| 5 | `books/{slug}/articles/{篇名}/source.md` | 紧接 #4 | `⏳ 正在通读 source.md ⏳` |

## 总结确认

5 份全读完后，主 agent 输出一行：

```
✅ 已完整通读 5 份规范（SPEC-interpretation + general + {术数专项} + catalog + source）
```

未达 5 份不进入 Step 4。

## 任一文件缺失的处置

| 缺失文件 | 处置 |
|----------|------|
| SPEC-interpretation.md | 立即终止（无规范可循） |
| general.md | 立即终止（14 条红线是刚性约束） |
| 术数专项（如 bazi.md）| 立即终止（领域硬约束） |
| catalog.md | 立即终止（无元信息） |
| source.md | 立即终止（无原文） |

## 术数专项动态加载

术数 → 专项文件路径的映射：
- 命 → `shared/sources/bazi.md`
- 卜 → `shared/sources/liuyao.md`（v2 待，当前不可用）
- 山 / 医 / 相 → v2 待

读取方式：解析 `catalog.md` blockquote 的 `> 术数：命` 字段，拼接得到 `shared/sources/bazi.md`。