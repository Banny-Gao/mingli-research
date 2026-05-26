# SearchBar 交互增强

> 创建：2026-05-25 | 优先级：P0-P2
> 前置：多书上马前完成 P0，多书上马时完成 P2

---

## P0 — 内容类型筛选

**问题：** 无筛选时搜"格局"混出原文、解读、技能，用户需手动辨认 badge

**方案：**
- 搜索框右侧加 pill 按钮组：`全部 | 原文 | 解读 | 技能`
- 默认"全部"，点击切换，单选
- 筛选逻辑：`results.filter(r => typeFilter === 'all' || typeToFilter[r.type] === typeFilter)`
- 键盘：`Ctrl+1/2/3/4` 切换筛选

**涉及文件：** `src/components/SearchBar/SearchBar.tsx`

---

## P1 — 搜索历史

**问题：** 空白态"输入关键词全文搜索篇目和技能"是死文字，浪费展示空间

**方案：**
- localStorage key: `search_history`，存储最近 10 条 `{ query, timestamp }`
- query 为空时展示历史列表（替代空状态文案）
- 点击历史词直接搜索，右侧 X 按钮可单条删除
- 底部"清除全部历史"按钮
- 键盘：Arrow keys 在历史项间导航

**涉及文件：** `src/components/SearchBar/SearchBar.tsx`、`src/lib/constants.ts`（新增 SEARCH_HISTORY_KEY）

---

## P2 — 术数分类筛选

**问题：** 多书上马后，搜"经络"跨山医命相卜命中，无法区分

**方案：**
- 类型筛选旁加术数下拉或第二组 pill：`全部 | 山 | 医 | 命 | 相 | 卜`
- 仅当 search-index 中存在多个 section 时显示
- 筛选逻辑：`results.filter(r => sectionFilter === 'all' || bookSectionMap[r.slug] === sectionFilter)`

**涉及文件：** `src/components/SearchBar/SearchBar.tsx`

---

## 注意事项

- 所有筛选组合生效（类型 × 术数）
- 保持现有键盘快捷键：`/` 打开、`Esc` 关闭、`Arrow Up/Down` 导航、`Enter` 选择
- 筛选器变更即时触发重新搜索（复用已有 debounce 管道）
- 历史记录不存敏感信息，仅存搜索词
