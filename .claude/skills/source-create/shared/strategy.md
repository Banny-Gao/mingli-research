# 模式选择 + 源模式路由

主 agent 在 Step 1（单/批）和 Step 2（4 源模式）按本模板引导。

## Step 1：单/批

| 模式 | 含义 | 适用 |
|------|------|------|
| A. 单点 | 一次只录 1 篇 | 用户知道具体要录哪一篇 |
| B. 批量 | 一次录 N 篇（整本或子集）| 用户想批量补录 |

**AskUserQuestion 2 选项：**
- A. 单点（聚焦 1 篇）
- B. 批量（指定书 + 篇章列表）

## Step 2：4 源模式

| 模式 | 适用 | 工具 |
|------|------|------|
| A. URL | 用户给单篇章 URL（任意站点）| WebFetch (L1) / +CSS (L2) / Playwright (L3) |
| B. 文本 | 用户给 .txt / 粘到聊天 / 给文件路径 | Read + LLM 清洗 |
| C. 图片/PDF | 用户给扫描件 | 多模态读图 |
| D. 站点分析 + 自生成 | 用户给书 slug + 篇章列表（catalog.html 推荐） | 运行时探查 `scripts/` 子树；未覆盖则自生成临时脚本（详见 `sources/probe.md` + `sources/scratch-template.md`） |

**AskUserQuestion 4 选项：**
- A. URL
- B. 文本
- C. 图片/PDF
- D. 站点分析+抓取

## URL 子模式 auto-detect（Step 3 内部）

```
WebFetch URL
  │
  ├─ HTML 含清晰正文 → L1（LLM 提取）
  │
  └─ HTML 空 / placeholder / 疑似 JS 渲染
       └─ AskUserQuestion 3 选项
            ├─ A. Playwright 兜底（L3）
            ├─ B. 给 CSS selector（L2，重用 WebFetch HTML）
            └─ C. 退出，建议改用模式 C 截屏
```

> 模式 D 不绑定任何外部脚本路径；详见 `shared/sources/probe.md` + `shared/sources/scratch-template.md`。

