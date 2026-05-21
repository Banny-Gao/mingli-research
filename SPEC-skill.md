# AI 可执行技能规范

> **用途：** 规范 `books/**/articles/{篇名}/skill.md` 的产出格式
> **前置依赖：** 对应 `source.md`（原文）+ `interpretation.md`（解读）已完成
> **面向受众：** AI 执行者（Hermes Agent / Claude Code / 其他 LLM Agent）

---

## 一、文件命名与目录规范

```
articles/{篇名}/skill.md
```

- `篇名`：中文篇名，与 catalog.md 中的篇名严格一致
- 每篇文章只有一个 skill.md 文件

---

## 二、文件结构规范

每个 skill.md 必须包含以下五个区块，**顺序不可调整**：

### 2.1 YAML Frontmatter

```yaml
---
name: tiandao
displayName: 三元分析法
type: analysis
input: 八字四柱
output: 三元分析报告
description: 基于天道篇的三元理论对八字命局进行天元-人元-地元三层分析
---
```

**必填字段：**

| 字段          | 说明                                                          | 示例                                                       |
| ------------- | ------------------------------------------------------------- | ---------------------------------------------------------- |
| `name`        | 英文标识，与 interpretation 中引用的篇名关联                  | `tiandao`                                                  |
| `displayName` | 人类可读的技能名称                                            | `三元分析法`                                               |
| `type`        | 技能类型：`analysis` / `lookup` / `comparison` / `generation` | `analysis`                                                 |
| `input`       | 技能输入描述                                                  | `八字四柱`                                                 |
| `output`      | 技能输出描述                                                  | `三元分析报告`                                             |
| `description` | 一句话说明技能功能                                            | `基于天道篇的三元理论对八字命局进行天元-人元-地元三层分析` |

### 2.2 功能定位

```markdown
## 功能

用一段话说明这个技能是做什么的、AI 执行者应该在何时调用它。不重复 interpretation 中的知识内容。
```

### 2.3 输入

```markdown
## 输入

列出所有需要的输入参数及其类型/格式：

- 参数名：描述（类型）
```

### 2.4 处理逻辑

```markdown
## 处理逻辑

按顺序列出分析/处理步骤。每个步骤应标明：

1. **做什么** — 当前步骤的操作
2. **依据** — 引用原文/原注/任氏曰中的关键依据（标注来源）
3. **判定** — 条件分支逻辑（如有）
```

### 2.5 输出

```markdown
## 输出

定义输出格式。可以用 TypeScript 类型定义、JSON Schema 或结构化 Markdown。
```

---

## 三、设计原则

1. **不重复 interpretation.md 的内容** — skill.md 定义的是"做什么"（可执行能力），不是"讲什么"（知识内容）
2. **功能导向** — 每个 skill 必须是一个 AI 可独立调用的能力单元
3. **引用原文但不堆砌** — 引用关键原文作为依据来源，不全文照搬
4. **输出可结构化** — 输出应能被程序解析和消费
5. **不做 speculative 设计** — 只定义当前篇章明确支持的能力

---

## 四、示例

见 `books/ditiansui-site/articles/天道/skill.md`

---

## 五、产出自检清单

- [ ] YAML frontmatter 完整（name, displayName, type, input, output, description）
- [ ] 功能定位清晰，一句话说明
- [ ] 输入参数完整列出
- [ ] 处理逻辑可执行，步骤明确
- [ ] 输出格式结构化
- [ ] 不与 interpretation.md 内容重叠（互为补充而非重复）
- [ ] 引用原文有来源标注

---

_本规范定义了 AI 可执行技能文件的产出标准，约束 skill.md 的内容结构与格式。_
