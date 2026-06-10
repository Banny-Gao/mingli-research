# 模式 A：URL（含 L1/L2/L3 三子模式）

## 输入契约

- **必填：** 单篇章 URL（任意站点）
- **URL 类型：** HTML 页（首选）；JSON API 不支持
- **可达性：** 需主 agent 用 `WebFetch` 能拿到 HTML（除非走 L3）

## 三子模式

### L1 通用（默认）

| 项 | 契约 |
|----|------|
| 输入 | URL 1 个 |
| 处理 | `WebFetch` HTML → LLM 识别主内容 → 提取原文 → 格式化为 source.md |
| 适配 | 任何 WebFetch 能拿正文的静态 HTML 页 |
| 触发 | 默认（WebFetch 拿到清晰正文）|

### L2 CSS 提示（精准）

| 项 | 契约 |
|----|------|
| 输入 | URL + CSS selector（如 `article.content` / `#main-text` / `.article-body`）|
| 处理 | WebFetch HTML → LLM 用 selector 定位主区域 → 在该 DOM 节点内提取 |
| 适配 | 页面 HTML 复杂（正文与广告/导航/页脚混杂）的站点 |
| 触发 | 用户在 Step 3 主动给 selector（可选）|

### L3 JS 渲染（兜底）

| 项 | 契约 |
|----|------|
| 输入 | URL 1 个 |
| 处理 | `mcp__playwright__browser_navigate` 加载 → `browser_snapshot` 取渲染后 DOM → LLM 提取 |
| 适配 | JS 渲染 SPA（维基百科部分页面 / 现代博客 / 学术平台）|
| 触发 | WebFetch 拿不到正文（空 / placeholder / 明显骨架）→ 询问用户是否 L3 |

## Auto-detect 流程（Step 3 内部）

```
WebFetch URL
  │
  ├─ HTML 含清晰正文 → L1 提取
  │
  └─ HTML 空 / placeholder / 疑似 JS 渲染
       └─ AskUserQuestion 3 选项
            ├─ A. 用 Playwright 兜底（L3）→ 重新取渲染后 DOM
            ├─ B. 给我 CSS selector（L2）→ 重用 WebFetch HTML
            └─ C. 退出，建议改用模式 C 截屏
```

## 主 agent 动作

1. WebFetch URL
2. 评估 HTML（用 LLM 判断）：清晰正文 → L1；空/JS 渲染 → 询问 L2/L3
3. 选 L1：直接 LLM 提取
4. 选 L2：用户给 selector → LLM 提取
5. 选 L3：Playwright MCP 取渲染后 DOM → LLM 提取
6. 提取后**严格**：原文照录（一字不改）、段落空行分隔、`> 【注家名】` 块引用包裹
7. 写 source.md：H1 标题（裸篇名）+ 正文 + 注家块

## LLM 提取 prompt 模板

提取时主 agent 显式声明以下约束：

```
你是一个原文提取器。任务：从以下 HTML 中提取文章正文与注家注释。

【严字不改原则】
- 异体字、避讳字、缺笔字、繁简差异字 一律照录原字形
- 不补译、不解释、不"修正"任何字
- 不混入任何现代解读

【格式要求】
- 第一个 # 标题为篇名（来自文件目录或 HTML <h1>）
- 正文段落用空行分隔
- 注家以 `> 【{注家名}】` 块引用包裹
- 注释之间空行分隔
- 无列表、无粗体、无表格、无图片

【输出】
- 仅输出 source.md 内容，不要解释过程
```

## Playwright 集成细节（L3）

### MCP server

- 名称：`playwright`（项目已有）
- 关键工具：
  - `mcp__playwright__browser_navigate {url}` 加载 URL
  - `mcp__playwright__browser_wait_for {time, text}` 等待加载
  - `mcp__playwright__browser_snapshot` 取渲染后 DOM（可访问性树形式）

### L3 流程

```
1. mcp__playwright__browser_navigate {url}
2. mcp__playwright__browser_wait_for {time: 2}  # 等待 2s 让 JS 跑完
3. mcp__playwright__browser_snapshot 拿 DOM 文本
4. LLM 在渲染后 DOM 上做 L1 同等提取
5. 不持久化浏览器会话
```

### 限制

- v1 不处理登录态 / cookies
- v1 不处理验证码
- v1 不持久化浏览器 session
- v1 不抗反爬

## 抓取容错

| 异常 | 处置 |
|------|------|
| URL 404 / 网络失败 | WebFetch 默认重试 1 次；失败 → 询问 L2/L3 |
| JS 渲染页（WebFetch 拿不到正文）| 询问 L3（Playwright 兜底）|
| 403 / 验证码 / 反爬 | 报错退出，让用户改源 |
| 抓取结果为无关页（如被重定向到首页）| 报错退出 |
| Playwright 加载超时 | 报错退出，建议模式 C 截屏 |
| OCR / 提取结果过短（< 100 字）| 询问是否重试或换源 |
