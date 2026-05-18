# 项目进度

> 更新于：2026-05-18
> 目标：逐一完成 issues/01-architecture-issues.md 全部内容，未经确认不得提交代码，每个模块完成后在真实浏览器 Playwright 验证。

---

## 任务清单与状态

### 🔴 P0 — Section 数据模型（五术扩展根基）

| 子任务 | 状态 | 说明 |
|--------|------|------|
| 更新 SPEC-catalog.md 新增术数字段 | ✅ 完成 | blockquote 加 `术数：命` |
| 更新 books/ditiansui-site/catalog.md | ✅ 完成 | 补术数元信息 |
| 更新 scripts/generate.js 解析术数字段 | ✅ 完成 | META_KEYS + parseBookMeta + books |
| 更新 src/data/book-types.ts 加 section | ✅ 完成 | `ArtSection` 类型 + `Book.section` |
| 更新 src/data/books.ts 标注 section | ✅ 完成 | ditiansui-site → '命' |
| 更新 src/pages/Landing.tsx 按 section 分组 | ✅ 完成 | SECTION_ORDER + booksBySection |
| 添加 section-header 样式 | ✅ 完成 | landing.less |
| Playwright 验证 Landing 分组展示 | ✅ 完成 | 截图确认：命理学分组正常 |

---

### 🔴 P1 — react-markdown 改造（对应原问题三）

| 子任务 | 状态 | 说明 |
|--------|------|------|
| 安装 react-markdown remark-gfm rehype-raw | ✅ 完成 | react-markdown 10.1.0 |
| 更新 ModalReader.tsx 渲染层 | ✅ 完成 | dangerouslySetInnerHTML → ReactMarkdown |
| 修复 main.tsx 循环引用错误 | ✅ 完成 | ThemeToggle 抽取为独立组件 |
| Playwright 验证内容渲染 | ✅ 完成 | 天道解读 modal 正常打开，内容正确 |
| 内容迁移（.ts → .md） | 🔴 待做 | 201 个文件还未迁移，render 使用兼容模式 |

---

### 🟡 P2 — ContentSchema 接口（扩展阻塞点）

| 子任务 | 状态 | 说明 |
|--------|------|------|
| 抽象 ContentProvider 接口 | 🔴 待做 | 第二本书上线前做 |
| generate.js 改为 schema 声明式 | 🔴 待做 | 动态生成加载器和类型 |

---

### 🟡 P3 — H5 响应式改造（抖音用户风险）

| 子任务 | 状态 | 说明 |
|--------|------|------|
| 确认 H5 目标定位 L1/L2/L3 | 🔴 待确认 | 用户需确认级别 |
| Tailwind 响应式断点配置 | 🔴 待做 | |
| hamburger menu / drawer 组件 | 🔴 待做 | |
| Playwright mobile viewport 测试 | 🔴 待做 | |

---

### 🟡 P4 — 路由结构设计（与 P0 联动）

| 子任务 | 状态 | 说明 |
|--------|------|------|
| 确认 URL 结构 `/books/命/ditiansui` | 🔴 待确认 | 是否接受 URL 变化 |
| 重构 main.tsx 路由 | 🔴 待做 | |
| 各术数板块独立 SEO meta | 🔴 待做 | |

---

### 🟢 P5 — Search Index 分层

| 子任务 | 状态 | 说明 |
|--------|------|------|
| generate.js 生成按 section 分组的 index | 🔴 待做 | 扩展后处理 |

---

### 🟢 P6 — CI/CD

| 子任务 | 状态 | 说明 |
|--------|------|------|
| GitHub Actions 配置 | 🔴 待做 | 编译 + 测试 + 部署 |

---

## 当前进度

**完成：** 无（刚完成架构分析，尚未开始实施）

**进行中：** P0-1 开始前准备 — 确认 SPEC-catalog.md 更新方案

---

## 下一步操作

P0-1 第一步：更新 `SPEC-catalog.md` blockquote 新增 `术数` 字段 → 用户确认后 → 更新 catalog.md → 修改 generate.js → 修改类型文件 → Playwright 验证

---