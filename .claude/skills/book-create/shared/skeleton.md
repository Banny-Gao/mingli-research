# 骨架生成规则

book-create 在 Step 6 落盘时创建两类产物：
1. `books/{slug}/catalog.md`
2. `books/{slug}/articles/{篇名}/.gitkeep`（N 个）

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
mkdir -p books/{slug}/articles/{篇名}   # 创目录
touch books/{slug}/articles/{篇名}/.gitkeep  # 留空文件，保证 git 追踪
```

**篇名 sanitize 规则：**
- 替换文件系统非法字符 `/\:*?"<>|` → 对应全角 `／：＊？＂＜＞｜`
- 长度 ≤ 200 字符（避免 Windows 260 字符路径上限）
- sanitize 后仍非法 → 报错退出

## 落盘顺序

1. 检查 `books/{slug}/catalog.md` 是否已存在 → 冲突时走 §4 异常处置
2. `mkdir -p books/{slug}/articles/`
3. 按 `chapter_list` 逐章 `mkdir -p` + `touch .gitkeep`
4. `Write` `books/{slug}/catalog.md`
5. 不自动跑 `node scripts/generate.js`，由用户决定
