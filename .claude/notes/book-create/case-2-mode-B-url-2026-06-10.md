# book-create 干跑用例 2：模式 B URL

> 日期：2026-06-10
> 模式：B
> URL：（未实际抓取 — 结构性验证 + 用户实跑待办）
> 通过：**结构性 PASS；实跑 PENDING**

## 流程记录（结构性推理）

- **Step 1 源模式：** 锁定 B
- **Step 2 收源：** 用户给一个公开目录页 URL（豆瓣/百度百科/CText/维基）
- **Step 3 解析：**
  - WebFetch 抓取（重试 1 次）
  - 抽取 HTML/纯文本 → 复用模式 A 的解析逻辑
  - 填充 BookDraft
- **Step 4 Gate 1 策略 gate：** 与模式 A 同
- **Step 5 Gate 2 元信息 gate：** 与模式 A 同
- **Step 6 落盘：** 与模式 A 同

## spec-bundles 校验

`shared/spec-bundles.md` 指纹：
- SPEC-catalog.md: `209:0a6ac03677557779`
- general.md: `123:bbc557e8a234c874`

Step 3 启动时会校验指纹；本次未跑，验证逻辑已就绪。

## 抓取容错（来自 `shared/sources/url.md`）

| 异常 | 处置 |
|------|------|
| URL 404 / 网络失败 | 重试 1 次；失败 → 提示切换模式 D 或 A |
| JS 渲染页 | 报错让用户改源 |
| 403 / 反爬 | 报错退出 |
| 重定向到无关页 | 报错 |

## 验证

- [x] 6 步结构层走通
- [x] 抓取容错 4 条规则覆盖
- [x] 与模式 A 复用逻辑清晰（"在 A 之上包一层 WebFetch"）
- [ ] **实际 WebFetch 抓取未跑 — 用户在新会话实跑**

## 限制

本会话无法实际发起 WebFetch（无新外部 URL 输入）。模式 B 的结构性合约与 url.md 已就绪，但实际抓取→解析→落盘的真实 dry-run 需要在新的 Claude Code 会话中由用户输入 `/book-create url <URL>` 实际触发。

## 待办（用户）

在新的 Claude Code 会话中：

1. 输入 `/book-create url`
2. 给一个公开目录页 URL（建议先用已有的：`https://baike.baidu.com/item/穷通宝鉴` 或维基百科条目）
3. 走完 6 步 + 2 次 gate
4. 验证生成的 `books/穷通宝鉴/catalog.md` 与现有 catalog.md 的一致性

## 状态

**PASS（结构性）/ PENDING（端到端）**