# Books 数据管道的 Articles 重组设计

> 重构 books/ 目录结构，将分散的 source/interpretations/skills 按文章合并管理，增强 catalog.md 元信息与分类能力，同步调整 generate.js 和前端消费。

---

## 一、问题总结

1. **catalog.md 缺少生成规则规范** — 其他古籍（如 yuanhaiziping）没有明确的 catalog.md 格式指引
2. **catalog.md 缺少元信息** — 作者、版本、书籍简介等未纳入，前端无法展示
3. **文件结构分散** — source/、interpretations/、skills/ 三个平级目录，一篇文章三处找，维护成本高
4. **分类未传递到前端** — catalog.md 已有 `##` 分类标题但 generate.js 未解析，前端不可用
5. **SPEC-skill.md 过于单薄** — 仅有 20 行，缺少完整产出规范

## 二、设计

### 2.1 目录结构

```
books/{book-slug}/
  catalog.html               ← 人工维护（不变）
  catalog.md                 ← AI 生成，格式增强（含元信息 + 分类）
  meta/                      ← 可选，书籍级元数据
  articles/                  ← 每篇文章一个子目录
    {篇名}/                   ← 中文篇名（如 天道、坤道）
      source.md              ← 原文（原 source/{篇名}.md）
      interpretation.md      ← 解读（原 interpretations/{skill_name}/tutorial.md）
      skill.md              ← 技能（原 skills/{skill_name}/SKILL.md）
```

**迁移路径：** 首次迁移为一次性操作，将现有 ditiansui-site 的 source/、interpretations/、skills/ 文件移至对应 articles/{篇名}/ 下。

### 2.2 catalog.md 格式增强

```markdown
# 《滴天髓阐微》

> 作者：[清] 刘基 撰 / 任铁樵 注
> 版本：XXX
> 简介：<书籍简介>

## 分类名

| 编号 | 篇名 | 原文路径 | 解读路径 | 状态 | 关联技能 |
| ---- | ---- | -------- | -------- | ---- | -------- |
| 01   | 天道 | articles/天道/source.md | articles/天道/interpretation.md | 已解读 | tiandao |
```

- 元信息放在书籍标题下方，使用 `> blockquote` 格式
- 每个 `##` 标题表示一个分类，供前端渲染可折叠区域
- 表路径改为 `articles/{篇名}/{type}.md`
- 6 列格式保留

### 2.3 generate.js 适配

- 读取路径从 `source/{篇名}.md` → `articles/{篇名}/source.md`
- 增加分类信息解析（记录当前 `##` 标题作为分类名）
- 输出 `books.ts` 中增加 `categories` 字段，每个篇目携带 `category` 属性
- 阅读路径改为按 `articles/` 目录扫描

### 2.4 前端适配

- 分类数据传递到 `books.ts`/`ChapterInfo` 接口
- Landing 页面分类渲染为可折叠区域（展开/收起）
- 文件路径更新，import 路径不受影响（由 scripts/generate.js 管理）

### 2.5 SPEC 文件调整

| 文件 | 变更 |
|------|------|
| SPEC-source.md | 路径改为 `articles/{篇名}/source.md`，内容核心不变 |
| SPEC-interpretation.md | 路径改为 `articles/{篇名}/interpretation.md`，合并 tutorial+advanced 为单文件，用 `---` 分隔 |
| SPEC-skill.md | **核心重写**：从知识库文档改为可执行技能定义，补全技能结构 |
| SPEC-catalog.md | **新增**：catalog.md 的完整生成规范，含元信息、分类、表格格式 |

### 2.6 skill.md 定位 — 从知识库到可执行技能

**现状问题：** 现有 SKILL.md 本质是知识点合集（核心定理、公式、自测题），与 interpretation.md 内容高度重叠，缺乏明确的执行能力定义。

**目标：** 每个 skill.md 定义一种**具体的、可执行的 AI 能力**，结构为：

```
技能名（如"三元分析法"）
├── 功能定位     → 一句话说明"这个技能是做什么的"
├── 输入         → 所需数据/参数（如八字四柱）
├── 处理逻辑     → 具体的分析步骤/算法
└── 输出         → 生成什么样的结果/报告格式
```

示例（天道篇 skill.md）：

```yaml
---
name: tiandao
displayName: 三元分析法
type: analysis
input: 八字四柱
output: 三元分析报告
description: 基于天道篇的三元理论，对八字命局进行天元-人元-地元三层分析
---

# 三元分析法

## 功能
给定一个八字命局，输出天元/人元/地元的分析结果。

## 输入
- 年柱：天干地支
- 月柱：天干地支
- 日柱：天干地支
- 时柱：天干地支

## 分析步骤
1. 天元分析：看天干透出何神，确定显用十神
2. 人元分析：看地支藏干，确定通变之机
3. 地元分析：看地支刑冲合害，确定根基稳定

## 输出格式
{三元分析报告：{三元完整度, 显用面, 根基面, 通变面, 复合判定}}
```

**注意：** 此格式为示例，最终格式以 SPEC-skill.md 为准。现有 skill.md 后续按此标准重新生成。

## 三、实施步骤

### 步骤 1：更新 SPEC 文件
- 更新 SPEC-source.md（路径）
- 更新 SPEC-interpretation.md（路径 + 单文件）
- 重写 SPEC-skill.md（补全）
- 新增 SPEC-catalog.md

### 步骤 2：构建 articles/ 目录 + 迁移现有文件
- 为 ditiansui-site 创建 articles/ 目录结构
- 将 64 篇 source/*.md 移至 articles/{篇名}/source.md
- 将 9 个 interpretations/{skill}/tutorial.md 移至 articles/{篇名}/interpretation.md
- 将 9 个 skills/{skill}/SKILL.md 移至 articles/{篇名}/skill.md
- 更新 catalog.md 路径为新的 articles/ 格式
- 更新 catalog.md 添加元信息

### 步骤 3：更新 generate.js
- 支持新路径 articles/{篇名}/{type}.md
- 解析分类信息（记录 `##` 标题）
- 输出 `categories` 到 books.ts

### 步骤 4：前端分类 UI
- Landing 页面分类展开/收起
- 消耗 categories 数据

### 步骤 5：验证
- 运行 generate.js，确认所有 .ts 文件生成正确
- 启动前端，确认页面正常
- 使用 Playwright 验收

## 四、风险与注意事项

- 目录名使用中文，需确保 git 配置和文件系统兼容
- 迁移前需要备份当前 source/、interpretations/、skills/ 目录
- yuanhaiziping 暂无 interpretation/skill 文件，新增 SPEC-catalog.md 后其 catalog.md 可直接参照新格式
