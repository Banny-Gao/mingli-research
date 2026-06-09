# 模式 A：HTML 片段

## 输入契约

- **必填：** 用户提供 `catalog.html` 绝对路径
- **可选位置：**
  - `books/{slug}/catalog.html`（已建书的标准位置）
  - 临时路径（用户自行维护的 HTML 文件）
- **路径要求：** 必须是文件系统可读的实际文件

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
     sections: [{name, chapters: [{num, name}]}]
   }
   ```
   - `sections` 必填
   - 其余字段留空（"AI 推测"占位，留给 Step 5 元信息 gate）

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
