# 模式 B：URL

## 输入契约

- **必填：** 用户给目录页 URL（豆瓣读书 / 百度百科 / 出版社官网 / CText 国学大师 / 维基百科 / iwzbz.com / 任意站点）
- **URL 类型：** HTML 页（首选）；JSON API 暂不直接支持
- **可达性：** 需主 agent 用 `WebFetch` 能拿到内容

## 主 agent 动作

1. `WebFetch` 抓取 URL（默认重试 1 次）
2. 抽取纯文本：
   - 优先按 HTML 结构解析（复用模式 A 的解析逻辑）
   - 无 HTML 结构时按文本结构解析（标题、列表）
3. 填充 `BookDraft` 中间表示（同模式 A）
4. **raw HTML 持久化**（详见 §3）—— LLM 能从中生成 catalog.md 就同步落 `books/{slug}/catalog.html`

## raw HTML 持久化

**触发条件：** WebFetch 拿到的 HTML 经主 agent 解析后**能**抽出 ≥3 章节（即 LLM 能从这段 HTML 生成 catalog.md）。

**强约束：** 一旦解析成功，**原始 HTML 必须落盘**到 `books/{slug}/catalog.html`。理由：
- HTML 是 LLM 工作的输入素材，丢了下次重跑（重 WebFetch）会因站点变化/反爬/cookies 失效而失败
- 即使 fetch-source.js 当前**不**直接消费 catalog.html，LLM 在 source-create 模式 D 兜底时仍可重新读它来生成 URL 列表
- 已有书的 catalog.html 都是建书时同步落的，新书不应缺

**落盘动作（在 Step 6 由主 agent 执行）：**
```
Write books/{slug}/catalog.html
```

内容 = WebFetch 返回的 raw HTML（不二次加工、不清洗、不"美化"）。

**不触发的场景：**
- WebFetch 拿到的是 JSON / 纯文本 / Markdown（无 HTML 标签）
- HTML 内链接数 < 3（极短页、错误页、登录跳转页）
- HTML 是 SPA 骨架（`<div id="root"></div>` 之类，LLM 解析不出章节）

**与"已建书的标准位置"的统一：** 此举把 html.md 行 5-7 的"已建书的标准位置"从**用户责任**变成**skill 责任**。主 agent 在 Step 6 自动落 raw HTML，6 本旧书的"人工 cp"流程就内化为 skill 默认行为。

## 抓取容错

| 异常 | 处置 |
|------|------|
| URL 404 / 网络失败 | 重试 1 次；仍失败 → 提示"是否切换到模式 D 输入描述？"或"切换到模式 A 粘贴 HTML 文本" |
| JS 渲染页（WebFetch 拿不到正文） | 报错"该 URL 需 JS 渲染，请改用模式 C/D 或提供 HTML" |
| 403 / 验证码 / 反爬 | 报错退出，让用户改源（不在本 skill 责任内） |
| 抓取结果为无关页（如被重定向到首页） | 报错"抓取结果不包含目录结构，请检查 URL" |

## 与模式 A 的复用

URL 抓取后转为 HTML/纯文本后，复用模式 A 的解析逻辑（h 标签 + 列表/表格）。
故模式 B 的实现"在 A 之上包一层 WebFetch"。
