# 滴天髓阐微 · AI 执行技能规范

> **版本：** v1.0
> **制定：** 2026-05-15
> **用途：** 规范 `books/ditiansui-site/skills/{skill_name}/SKILL.md` 的产出格式，供 AI 按 SKILL-bazi-research-dispute 思考后输出，面向 AI 自身执行使用
> **前置依赖：** 读取 `SPEC-source.md`（原文）+ `SPEC-interpretation.md`（人类解读）后方可产出
> **面向受众：** AI 执行者（Hermes Agent / Claude Code / 其他 LLM Agent）

---

## 一、文件命名与目录规范

```
skills/{skill_name}/SKILL.md
```

- `skill_name`：全小写，英文标识，与篇名对应（如 `tiandao`、`kundao`、`bage`）
- 一个 skill_name 对应一个篇章
- 目录下**仅允许存在 SKILL.md 一个文件**，不得拆分多个文件

---

## 二、文件结构规范【必须完整】

每个 SKILL.md 由两个部分组成：**YAML frontmatter** + **正文**

```
---
（YAML frontmatter 区）
---

# （正文标题）
（正文内容）
```

### 2.1 YAML frontmatter 【必须完整 · 不可缺失】

```yaml
---
name: {skill_name}
description: |
  本技能用于执行《滴天髓》第X篇（{篇名}）的学术研究任务。
  触发条件：{具体触发关键词，3-5个场景}
  激活前提：已加载 bazi-research-dispute-exec 执行规则
tags: [{相关标签}]
related_skills: [{相关联的其他skill_name，数组}]
version: "1.0"
created: {YYYY-MM-DD}
root: /workspace/mingli-research/books/ditiansui-site/
---
```

**字段说明：**

| 字段 | 要求 | 示例 |
|------|------|------|
| `name` | 必须与目录名一致 | `tiandao` |
| `description` | 必须包含触发条件和用途说明 | 见上方 |
| `tags` | 标签数组，建议 2-4 个 | `["天道", "三元", "阴阳"]` |
| `related_skills` | 关联的其他 skill 名称数组 | `["kundao", "rendao"]` |
| `version` | 语义化版本，初版为 "1.0" | `"1.0"` |
| `created` | ISO 日期格式 | `"2026-05-15"` |
| `root` | 固定值 | `/workspace/mingli-research/books/ditiansui-site/` |

### 2.2 正文结构【标准化八章 · 顺序固定】

```
## 一、核心定理（必须背诵）

## 二、原文逐句解析

## 三、图解与逻辑结构

## 四、核心命理公式

## 五、本篇在命局分析中的应用

## 六、必须背诵的名句

## 七、本篇与后续章节的关联

## 八、参考资料
```

#### 各章详细规范

##### 一、核心定理（必须背诵）

- 列出本篇 3-5 条核心定理
- 每条定理格式：
  ```markdown
  **定理N：[定理名称]**
  > "原文核心句"
  - 含义：...
  - 应用：...
  ```
- 这些定理是 AI 执行判断时的核心依据

##### 二、原文逐句解析

- 完整引用【原注】【任氏曰】原文
- 每句原文后跟解析，格式：
  ```markdown
  【原注第X句】
  > 原文全文

  **解析**：...
  ```
- 解析要点：
  1. 核心义理（这一句在说什么）
  2. 与其他句的关系（在整篇中的位置）
  3. 实践应用（在什么场景下调用这条）

##### 三、图解与逻辑结构

- 用 ASCII/Unicode 字符绘制本篇核心逻辑结构图
- **必须使用纯文本图解**（不使用图片），确保 AI 可直接读取
- 每张图解附说明：
  ```markdown
  【图解】{图解标题}

  {图解内容，ASCII字符绘制}

  说明：...
  ```

##### 四、核心命理公式

- 提取本篇最重要的判断公式
- 格式：
  ```markdown
  **公式N：[名称]**

  适用条件：...
  公式：[具体公式，如"月令本气 + 日主旺衰 → 用神"]
  验证：...
  ```

##### 五、本篇在命局分析中的应用

- 说明本篇理论在八字分析中的具体应用场景
- 按场景分类：
  1. 取格时如何应用
  2. 用神选取时如何应用
  3. 格局成败判断时如何应用
- 每个场景给出具体判断步骤

##### 六、必须背诵的名句

- 从【原注】【任氏曰】中精选 3-5 句最核心的名句
- 格式：
  ```markdown
  1. "名句原文"
     ——出处：【原注】/【任氏曰】
     ——记忆要点：...
  ```

##### 七、本篇与后续章节的关联

- 列出与本篇有理论关联的其他篇章
- 格式：
  ```markdown
  | 关联篇章 | 关联关系 | 核心连接点 |
  |---------|---------|-----------|
  | 坤道 | 前置铺垫 | 天道讲天干三元，坤道接讲地支 |
  ```
- 引用 `meta/index.md` 的关联数据

##### 八、参考资料

- 列出引用来源
- 格式：
  ```markdown
  - 《滴天髓阐微》{篇名}篇，source/{篇名}.md
  - {其他经典}，{章节引用}
  ```

---

## 三、产出规范

### 3.1 内容精简原则

skill 是给 AI 用的**速查工具**，不是 tutorial 的浓缩版。核心原则：

- **信息密度高于解释深度**：skill 讲"是什么"和"怎么用"，不详细讲"为什么"
- **公式化判断优先于理论推导**：输出可直接用于推理的判断公式
- **最小可用集**：覆盖 80% 常见场景即可，不追求面面俱到
- **结论明确**：避免"这种情况比较复杂，需要具体分析"式的模糊表达

### 3.2 与 interpretation 的关系

| 维度 | interpretation (tutorial.md) | skill (SKILL.md) |
|------|------------------------------|-----------------|
| 面向 | 人类学习者 | AI 执行者 |
| 深度 | 从零开始讲透 | 速查速用 |
| 篇幅 | 长（200-800行） | 短（100-300行） |
| 语气 | 教学式，对话感 | 指令式，判准明确 |
| 图解 | Markdown 渲染图解 | ASCII 纯文本图解 |

skill 的内容应从 interpretation 提炼而来，**不得与 interpretation 矛盾**。

### 3.3 AI 触发调用约定

当 AI 执行以下任务时，应自动调用对应 skill：

| 任务场景 | 调用 skill |
|---------|-----------|
| 用户询问某篇的核心理论 | `skills/{skill_name}/SKILL.md` |
| 用户要求分析八字格局 | `skills/bage/SKILL.md` + 对应篇章 skill |
| 用户提出质疑/辨析请求 | `bazi-research-dispute-exec/SKILL.md` 先加载 |
| 用户要求全文解读某篇 | `interpretations/{skill_name}/tutorial.md` |

---

## 四、禁止行为

1. **禁止与 source 原文矛盾**（skill 的判断必须符合原文）
2. **禁止引入 source 之外的原文**（不得引用其他版本滴天髓）
3. **禁止输出主观观点**：skill 中的判断必须是可复现的公式化逻辑
4. **禁止过度延展**：只覆盖本篇内容，不跨界发挥
5. **禁止使用网络伪论或民间野诀作为判断依据**
6. **禁止在 skill 中包含用户可直接阅读的大段教学文字**（那是 interpretation 的职责）
7. **禁止删除或改写 YAML frontmatter 任何字段**

---

## 五、产出自检清单【输出前必核】

- [ ] YAML frontmatter 八个字段完整，无缺失
- [ ] 正文八章齐全，顺序正确
- [ ] 所有原文引用标注了【原注】或【任氏曰】来源
- [ ] 图解使用纯文本 ASCII/Unicode 绘制，无外部图片引用
- [ ] 判断公式清晰，可直接用于 AI 推理
- [ ] 与对应 interpretation 文件内容一致，无矛盾
- [ ] 无网络伪论、无民间野诀
- [ ] 相关 skill 关联列表准确（存在于 skills 目录中）
- [ ] 篇幅控制在 100-300 行范围内

---

## 六、现有 skills 合规检查

| Skill | 状态 | 需修正 |
|-------|------|--------|
| `skills/tiandao/SKILL.md` | 241行 | YAML frontmatter 需补全相关技能关联 |
| `skills/kundao/SKILL.md` | — | 待产出 |
| `skills/rendao/SKILL.md` | — | 待产出 |
| `skills/zhiming/SKILL.md` | — | 待产出 |
| `skills/liqi/SKILL.md` | — | 待产出 |
| `skills/peihe/SKILL.md` | 126行 | 章节结构与规范不符，需重构 |
| `skills/tiangan/SKILL.md` | — | 待产出 |
| `skills/dizhi/SKILL.md` | — | 待产出 |
| `skills/bage/SKILL.md` | 193行 | 章节结构与规范基本符合 |
| `skills/bazi-research-dispute-exec/SKILL.md` | 独立执行规则 | 不受本规范约束 |

---

## 七、三层规范数据流

```
SPEC-source.md      → 规范: source/*.md
    ↓ 产出
SPEC-interpretation.md → 规范: interpretations/*/tutorial.md + advanced.md
    ↓ 提炼
SPEC-skill.md       → 规范: skills/*/SKILL.md
    ↓
bazi-research-dispute-exec 执行规则（顶层约束）
    ↓
generate.js 消费所有数据 → app 数据层
```

每层产出作为下一层的输入，单向流动，不交叉引用。

---

_本规范定义了 AI 执行技能的标准格式，约束 skill 文件的结构、字段与内容要求。_
_版本：v1.0 | 制定日期：2026-05-15_