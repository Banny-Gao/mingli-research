# Catalog.md 格式规范

> **用途：** 规范 `books/{book-slug}/catalog.md` 的格式
> **前置依赖：** 对应 `catalog.html`（人工维护）已存在
> **面向受众：** AI 生成者 + generate.js 消费方

---

## 一、文件位置

```
books/{book-slug}/catalog.md
```

- `{book-slug}`：英文标识，如 `ditiansui-site`、`yuanhaiziping`
- 每本书的根目录下只有一个 `catalog.md`

---

## 二、文件结构

### 2.1 标题与元信息

```markdown
# 《滴天髓阐微》

> 作者：[明] 刘基 撰 / [清] 任铁樵 注
> 版本：据《四库全书》本
> 简介：子平命理学核心经典，以天干地支五行生克为核心，通过六十余篇专题系统阐述命理原理。
```

- 一级标题 ：书名 ，使用 `《》` 包裹
- blockquote 元信息：包含 **作者**、**版本**、**简介** 三行
- 所有字段必填，简介不超过 200 字

### 2.2 分类与表格

```markdown
## 上篇 · 通神论

| 编号 | 篇名 | 原文路径 | 解读路径 | 状态 | 关联技能 |
| ---- | ---- | -------- | -------- | ---- | -------- |
| 01   | 天道 | articles/天道/source.md | articles/天道/interpretation.md | 已解读 | tiandao |
| 02   | 坤道 | articles/坤道/source.md | articles/坤道/interpretation.md | 已解读 | kundao |
| 09   | 干支总论 | articles/干支总论/source.md | | 待解读 | |
```

**规则：**

- 每个 `##` 二级标题表示一个分类
- 分类下**必须紧跟一个 6 列表格**（含表头）
- 路径统一使用 `articles/{篇名}/{type}.md` 格式
- 状态仅允许：`已解读` / `待解读`
- 关联技能：多个用英文逗号分隔（如 `tiandao,kundao`）
- 表格分隔行使用 `| ---- | ---- | -------- | -------- | ---- | -------- |`
- 篇名使用中文全称，与 `catalog.html` 中的篇章名称严格一致

### 2.3 多分类

当书籍有多个分类时，按先後顺序排列：

```markdown
# 《滴天髓阐微》

> ...

## 上篇 · 通神论

| ... |

## 下篇 · 六亲论

| ... |
```

分类标题本身不含序号（序号在表格的编号列中）。

---

## 三、解析规则（generate.js 消费者）

1. 读取第一个 `#` 为书名
2. 读取 `>` blockquote 三行，分别提取 author、version、description
3. 遍历每个 `##` 标题，记录为当前分类名
4. 解析表格行：
   - 第 1 列：编号（数字）
   - 第 2 列：篇名（中文）
   - 第 3 列：原文路径 → `articles/{篇名}/source.md`
   - 第 4 列：解读路径 → `articles/{篇名}/interpretation.md`（待解读为空）
   - 第 5 列：状态（已解读/待解读）
   - 第 6 列：关联技能（英文标识，逗号分隔）
5. 每行的分类为当前所在的 `##` 标题

---

## 四、合规检查

- [ ] 一级标题为书名 ，含有 `《》`
- [ ] blockquote 包含 author、version、description 三行
- [ ] 每个分类使用 `##` 二级标题
- [ ] 表格为 6 列，表头正确
- [ ] 路径使用 `articles/` 格式
- [ ] 篇名与 `catalog.html` 严格一致
- [ ] 无手动编辑（仅 AI 根据 `catalog.html` 生成）

---

_本规范定义了 catalog.md 的完整生成标准，供 AI 产出和 generate.js 消费。_
