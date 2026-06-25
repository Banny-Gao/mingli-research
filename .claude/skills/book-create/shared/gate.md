# 人工 gate 设计

book-create 流程有 2 次强人工 gate。每次必走，不可跳过。

## Gate 1：策略 gate

**触发：** Step 3 解析完成后
**输入：** `BookDraft.sections`
**输出：** `chapter_list: [{num, name}, ...]`

**主 agent 动作：**
1. 调 `shared/strategy.md` 生成策略建议
2. 调 `shared/sources/{mode}.md` 的解析结果填充候选
3. AskUserQuestion 4 选项（A 全量 / B 精选 / C 调整 / D 退出）
4. 选 C 时进入开放对话模式，不强制 4 选项

**异常处置：**
- 用户选 D → 主 agent 退出，不写文件，输出"已放弃本次建书"
- 用户多次调整 → 保留每次的最新候选清单

## Gate 2：元信息 gate

**触发：** Gate 1 完成后
**输入：** `BookDraft` 中除 sections 外的字段
**输出：** `confirmed_meta: BookDraft`

**主 agent 动作：**
1. 展示拟填入的 6 个 blockquote 字段
2. 实时校验：
   - `shu` ∈ {山, 医, 命, 相, 卜}
   - `category` 在 `scripts/lib/category-tree.js` 的 `CATEGORY_TREE` 已注册
   - `contentTypes` 至少包含 `source`
   - `fontStrategy` 默认 `原文照录`
4. AskUserQuestion 4 选项（A 全部确认 / B 修改字段 / C 重填 / D 退出）
5. 选 B 时用户指出要改的字段，主 agent 追问新值后回到本 gate

**异常处置：**
- 校验失败 → 标记字段"待补全"，回到选项 B
- 用户选 D → 退出，不写文件

## 与 self-check 的人工 gate 区别

self-check 是"自检中发现问题 → AskUserQuestion 决定是否落盘修复"。
book-create 是"建书关键决策点 → AskUserQuestion 收集用户选择"。

**两个 gate 都是创建决策的 gate，不是修复 gate。**
