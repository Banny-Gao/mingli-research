# 模式 A：HTML 片段

## 输入契约

- **必填：** 用户提供 `catalog.html` 绝对路径
- **路径要求：** 必须是文件系统可读的实际文件

**输入与持久化的关系：** 用户提供的 catalog.html 是 LLM 解析的**输入素材**，主 agent 在 Step 6 必须**自动 cp** 到 `books/{slug}/catalog.html`（详见 `shared/skeleton.md` §落盘顺序）。这不是"建议"，是 skill 默认行为——避免"读完即丢"造成 3 本新书（命理探原/神峰通考/紫微斗数全书）无 catalog.html 的死法重演。

## 主 agent 动作

1. `Read` 整个文件
2. 用 HTML 解析抽取：
   - 书名：第一个 `<h1>` 文本，或文件名去除 `.html` 后的中文化
   - 章节层级：`<h2>` / `<h3>` / `<h4>` → sections
   - 篇章列表：`<ol>` / `<ul>` / `<table>` 中每条 `<li>` 或表格行
3. 填充 `BookDraft` 中间表示：
   ```
   {
     title, author, version, intro, shu, category, contentTypes, fontStrategy,
     sections: [{name, chapters: [{num, name}]}],
     source_input: { rawHtmlPath: '/abs/path/to/catalog.html' }
   }
   ```
   - `sections` 必填
   - 其余字段留空（"AI 推测"占位，留给 Step 5 元信息 gate）
   - **`source_input.rawHtmlPath` 必填**——骨架生成器据此 cp 到 books/{slug}/

## 解析容错

| 异常 | 处置 |
|------|------|
| 0 篇 | 报错退出，提示"可能源不对，请检查或换模式" |
| 1-2 篇 | 警告并继续（极端短书） |
| ≥ 3 篇 | 正常 |
| 篇名含非法字符 | 自动 sanitize（见 skeleton.md） |
| 嵌套层级深（h4+） | 收敛到二级 sections（h2/h3 视为分类；h4 视为篇章） |
| 无任何 h 标签（扁平 `<a>` 列表） | 主 agent 提示用户"源 HTML 无章节分组，请手动指定分组或确认走扁平输出"；走扁平则产出单 section，章节顺序按 HTML 出现顺序 |

## 与现状的差异

项目已建书（子平真诠、滴天髓阐微等）都已有 `books/{slug}/catalog.html` 与 `catalog.md`。
模式 A 对这些书只走"读 → 解析 → 人工 gate → 重写 catalog.md"流程，是幂等可重入的。

**v1 改进（本次）：** 把"用户提供的 HTML 是否保留到 books/{slug}/"从**用户责任**转为**skill 责任**。Step 6 自动 cp 一份，原文件保留在用户原位置不动。
