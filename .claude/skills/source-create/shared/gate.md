# 字形策略 gate + 冲突 4 选项

source-create 流程有 1 次字形策略 gate + 1 次落盘冲突 4 选项。

## Gate 1：字形策略 gate

**触发：** Step 3 完成后、Step 4 落盘前
**输入：** `books/{slug}/catalog.md` blockquote 的 `字形策略` 字段
**读取方式：** 主 agent 读 catalog.md 元信息 blockquote（`> 字形策略：...`）

| 字段值 | 处置 |
|--------|------|
| `原文照录` | 直接进 Step 5，无 gate |
| `简体规范化` | 提示用户"建议走 fetch-sources.js 批量通道（已含 t2s），或手动用 `node scripts/t2s.js` 转换已录文件"；v1 不自动 t2s |
| 声明缺失 | 视为 `原文照录`，不 gate |

**v1 不自动 t2s 的原因：** SPEC-source.md §X.3 要求"歧义字清单 + 人工 spot-check"，全流程复杂；v1 字形 gate 退化为"提示"，不阻塞流程。

## 落盘冲突 4 选项（Step 5 内部）

**触发：** source.md 已存在
**输入：** 已有文件路径

**AskUserQuestion 4 选项：**
| 选项 | 含义 | 后续动作 |
|------|------|---------|
| A. 覆盖 | 替换现有文件 | 写新内容，旧文件丢失 |
| B. 备份为 .bak | 旧文件改名为 source.md.bak，新文件写入 | 旧内容可回滚 |
| C. 取消 | 放弃本次录入 | 退出，不写文件 |
| D. 退出 | 放弃整个 source-create 流程 | 退出 |

**用户选 C/D 时：** 主 agent 退出，不写文件。

## 与 book-create gate 的关系

- book-create 也有"冲突 4 选项" gate（用于 catalog.md 重写）
- source-create 复用同一 4 选项形态
- 唯一差异：source-create 多了"字形策略 gate"，因为 source.md 对字形敏感
