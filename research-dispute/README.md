# research-dispute

> 术数研究规范库，包含 SPEC（内容管线）和 SKILL（Agent 执行）两层。

## 目录结构

```
research-dispute/
├── README.md                  # 本索引
│
├── SPEC-catalog.md            # catalog.md 生成规范
├── SPEC-source.md             # 原文录入规范
├── SPEC-interpretation.md     # 解读文件生成规范
├── SPEC-skill.md              # 篇章技能文件生成规范
│
├── general.md                 # 通用领域规则（所有术数适用）
├── bazi.md                    # 子平八字专项领域规则
└── [其他术数]                  # 后续扩展
```

## SPEC 文件（内容管线）

四份 SPEC 定义了一条数据管道：**catalog → source → interpretation → skill**，由 LLM 按顺序执行。

| 文件 | 职责 | 下游依赖 |
|------|------|----------|
| `SPEC-catalog.md` | 定义 catalog.md 格式与生成规则 | SPEC-source |
| `SPEC-source.md` | 定义原文录入规范 | SPEC-interpretation |
| `SPEC-interpretation.md` | 定义解读文件生成规范 | SPEC-skill（可选） |
| `SPEC-skill.md` | 定义篇章 AI 技能文件生成规范 | — |

## SKILL 文件（Agent 执行）

SKILL 文件是 LLM Agent 运行时的领域约束，按**通用 + 专项**分层。

### 继承机制

专项 SKILL 通过 `extends` 字段声明继承父 SKILL：

```yaml
extends: general
```

**继承规则：**
- 子 SKILL 继承父 SKILL 的全部规则（本源铁则、红线禁令、执行规范、自检清单）
- 子 SKILL 可补充特定术数的经典体系、名家名录、适用边界
- 冲突时以子 SKILL 为准（子覆盖父）
- 执行时须同时加载父 SKILL 和子 SKILL

### general.md（通用规则）

**适用范围**：所有术数学术研究与质疑处置

**核心内容**：
- 本源铁则（经典原文为唯一准绳、实事求是客观中立）
- 14 条绝对红线禁令
- 学术研究执行规范
- 质疑处置四步指正流程
- 输出前强制自检清单

### bazi.md（子平八字专项）

**继承**：`general`

**补充内容**：
- 经典体系（至高核心 + 辅助权威）
- 公认固定名家
- 超出范畴声明（紫微斗数、六爻、奇门等）

## SPEC 与 SKILL 的关系

- **SPEC** 定义"LLM 如何生成内容文件"（数据管线的格式与流程规范）
- **SKILL** 定义"LLM Agent 如何执行术数任务"（运行时的领域行为约束）
- SPEC-interpretation 的产出必须遵守 SKILL 中的领域规则（如引用规范、红线禁令）
- 新增术数书籍时，需同时考虑 SPEC 中的内容生成规则和 SKILL 中的领域约束

### 两种 Skill 的触发/分类机制

本目录存在两套独立的分类体系，服务于不同目的，不互相替代：

| 概念 | 定义位置 | 分类方式 | 用途 |
|------|----------|----------|------|
| 篇章技能 | `SPEC-skill.md` 的 `type` 字段 | `analysis` / `lookup` / `comparison` / `generation` | 前端展示和路由——描述该篇章 AI 技能的输出形式 |
| Agent 技能 | `general.md` / `bazi.md` 的 `trigger` 字段 | 正则关键词模式 | Agent 自动激活——匹配用户输入，加载对应术数领域的运行时约束 |

两者的关系：一篇子平八字篇章的 skill.md 的 `type` 可能是 `analysis`（篇章技能分类），但其生成和执行过程受 `bazi.md`（Agent 技能）的领域规则约束。

## 扩展指南

新增术数领域时：

1. 创建 `{术数名}.md`（如 `ziwei.md`）
2. 添加 `extends: general` frontmatter
3. 定义该术数的：
   - 经典体系（核心经典 + 辅助经典）
   - 公认名家（如有）
   - 超出范畴声明
4. 更新本索引文件
