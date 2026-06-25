# source.md 落盘规则

source-create 在 Step 5 落盘时创建产物：`books/{slug}/articles/{篇名}/source.md`

**与 book-create skeleton.md 的关键差异：**
- source.md **不**含元信息 blockquote（无 shu/category/contentTypes/字形策略等字段）
- 元信息在父目录的 `books/{slug}/catalog.md` 中，本文件只放原文

## source.md 模板

```markdown
# {篇名}

{正文原文}

{空行}

> 【{注家名}】{注家原文}
>
> {注家原文续}
```

**字段填充规则：**
- 标题：用 `# {篇名}` 一级标题，无序号、无副标题
- 正文：段与段之间用**单空行**分隔；不加任何标记（无列表、无粗体、无斜体、无图片、无表格）
- 注家：使用 `> 【{注家名}】` 块引用包裹
- 注释之间用空行分隔

## 目录命名硬性约定

- `{篇名}` 是**裸篇名**（不带"01 "、"02 "等编号前缀）
- 编号**仅**写在 `books/{slug}/catalog.md` 表格的"编号"列
- 已有建书均遵守此约定

**正例：**
```
books/子平真诠/articles/论用神/source.md
books/神峰通考/articles/万金赋/source.md
```

## 落盘顺序

1. 读 `books/{slug}/articles/{篇名}/source.md` 是否已存在
2. 存在 → 4 选项（覆盖/备份/取消/退出）
3. 不存在 → 直接 `Write` source.md
4. 不自动跑 `node scripts/generate.js`，由用户决定

## 关键红线（来自 SPEC-source.md §五）

主 agent 写 source.md 时**必须**遵守：

1. 严禁混入解读内容
2. 严禁修改原文用字
3. 严禁添加现代标点以外的标记（仅 `> 【注家名】` 块引用是例外）
4. 严禁分段处理长段原文
5. 严禁添加空行以外的任何内容

LLM 提取时若"想顺手改字"必须主动拒绝。提取 prompt 显式声明："严字不改，照录原字形"。
