# 骨架生成规则

book-create 在 Step 6 落盘时创建三类产物：
1. `books/{slug}/catalog.md`
2. `books/{slug}/articles/{篇名}/.gitkeep`（N 个）
3. **`books/{slug}/catalog.html`（条件性，详见 §3）**

## catalog.md 模板

```markdown
# 《{title}》

> 作者：{author}
> 版本：{version}
> 简介：{intro}
> 术数：{shu}
> 类别：{category}
> 内容类型：{contentTypes 逗号分隔}
> 字形策略：{fontStrategy}   # 默认 原文照录

## {section.name}

| 编号 | 篇名 |
| ---- | ---- |
| {chapter.num} | {chapter.name} |
...
```

**字段填充规则：**
- `title` 用 `《》` 包裹
- `shu` 单字（山/医/命/相/卜）
- `contentTypes` 至少含 `source`
- `fontStrategy` 默认 `原文照录`，用户未声明则不写该行
- 表格 2 列：编号、篇名
- 编号格式：2 位字符串（"01"、"02"...），原 catalog.html 中若无编号则主 agent 按出现顺序自动生成
- 章节按 `sections` 顺序保留，每个 `section` 一个 `##` 小节

## 骨架 .gitkeep 生成规则

```bash
mkdir -p books/{slug}/articles/{篇名}   # 创目录（裸篇名，不加编号前缀）
touch books/{slug}/articles/{篇名}/.gitkeep  # 留空文件，保证 git 追踪
```

**目录命名硬性约定：**
- `{篇名}` 是**裸篇名**（不带"01 "、"02 "等编号前缀）
- 编号**仅**写在 `catalog.md` 表格的"编号"列，**不**写入目录名
- 7 本已建书（子平真诠、滴天髓阐微、渊海子平、穷通宝鉴、千里命稿、紫微斗数全书、三命通会）均遵守此约定

**反例（不要这样做）：**
```
books/神峰通考/articles/01 五星正说类/      # ✗ 错误
books/神峰通考/articles/12 偏官格 附弃命从杀格/  # ✗ 错误
```

**正例：**
```
books/神峰通考/articles/五星正说类/         # ✓ 正确
books/神峰通考/articles/偏官格 附弃命从杀格/  # ✓ 正确
```

**篇名 sanitize 规则：**
- 替换文件系统非法字符 `/\:*?"<>|` → 对应全角 `／：＊？＂＜＞｜`
- 长度 ≤ 200 字符（避免 Windows 260 字符路径上限）
- sanitize 后仍非法 → 报错退出
- 多词篇名（如"偏官格 附弃命从杀格"）原样保留空格，**不要** shell word-split

## 落盘顺序

1. 检查 `books/{slug}/catalog.md` 是否已存在 → 冲突时走 §4 异常处置
2. `mkdir -p books/{slug}/articles/`
3. 按 `chapter_list` 逐章 `mkdir -p` + `touch .gitkeep`
4. **raw HTML 落盘**（条件性，详见 §3）
5. `Write` `books/{slug}/catalog.md`
6. 不自动跑后续生成流程，由用户决定

## raw HTML 落盘

**触发条件：**
- `BookDraft.source_input.rawHtmlPath` 存在（模式 A 输入侧）
- **或** `BookDraft.source_input.rawHtml` 存在（模式 B WebFetch 拿到的 HTML 字符串）

**判定标准：** LLM 解析后能从中生成 catalog.md（章节数 ≥3）。

**落盘动作：**
```bash
# 模式 A：cp 用户提供的文件
cp <rawHtmlPath> books/<slug>/catalog.html

# 模式 B：Write WebFetch 拿到的 raw HTML
Write books/<slug>/catalog.html
```

**不触发的场景：**
- 模式 C（图片/PDF）：无 HTML 输入
- 模式 D（模糊描述）：无 HTML 输入
- 模式 A/B 解析后章节数 < 3（极短页/错误页/登录跳转页）—— 主 agent 警告但不阻塞

**冲突处理：**
- `books/{slug}/catalog.html` 已存在 → 走与 catalog.md 相同的 4 选项（覆盖/备份 .bak/取消/退出）
- 用户**选**取消或退出 → 整个 book-create 流程退出，已创建的 articles 骨架保留（**不**清理）

**与已建书的一致性：**
- 已有 catalog.html 的书都是建书时同步落的
- 缺 catalog.html 的旧书 → 走 source-create 模式 D 时按需手工补（**不**是 book-create 责任）
