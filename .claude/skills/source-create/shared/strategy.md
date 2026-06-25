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
| D. 调脚本 | 已有 catalog.html + URL 模式整本 | `node scripts/fetch-source.js run` |

**AskUserQuestion 4 选项：**
- A. URL
- B. 文本
- C. 图片/PDF
- D. 调脚本批量

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

## 批量脚本调命令模板

```bash
# dry-run 预览
node scripts/fetch-source.js run <slug> <chapter1>,<chapter2> --force --dry-run

# 实跑
node scripts/fetch-source.js run <slug> <chapter1>,<chapter2> --force
```

> 注：v1 不动 fetch-source.js 内部代码；脚本是 data layer，skill 是 UI layer。
