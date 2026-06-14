/**
 * scripts/lib/pipeline.js — 9 步主体流水线 prompt 装订 + §七 自评打分
 *
 * 套 SPEC-interpretation.md §五 Step 3-9 + §七 自评 5/4/3 分制
 */

/**
 * 装订 9 步主体流水线的 prompt
 * @param {{sourceText: string, condition: object, specBundle: {specInterpretation: string, general: string, shuSpecial: string, catalog: string}}} opts
 * @returns {string} 完整 prompt
 */
export function buildPipelinePrompt({ sourceText, condition, specBundle }) {
  return `# 9 步主体流水线（套 SPEC-interpretation.md §五 Step 3-9 + §七）

## 强装载 5 份规范（已通读）

### 1. SPEC-interpretation.md
${specBundle.specInterpretation}

### 2. general.md
${specBundle.general}

### 3. 术数专项
${specBundle.shuSpecial}

### 4. catalog.md
${specBundle.catalog}

### 5. source.md（待解读原文）
${sourceText}

## 原文体检报告

- 模式：${condition.模式}
- 案例：${condition.案例}
- 注家：${condition.注家}
- 异文：${condition.异文}
- 脱漏：${condition.脱漏}
- 超长：${condition.超长}

## 9 步执行清单

### Step 3：内容结构梳理
- 拆段、标注家、分类理论与案例
- 提取二级标题（**反机械化规则**：禁 source 分层标签作标题；标题从原文关键词中抓取）
- 套 §六 异常场景策略

### Step 4：逐段引用 + 表层解读
- 套 §2.1 模板：一引一解
- 引文必须 \`>\` 块引用 + 完整整句
- 术语当场释义融入语言（**禁独立【白话】行**）

### Step 5：案例 / 分歧处理
- 有案例：套 §2.2 案例模板
- 流派分歧：客观陈列，不判对错

### Step 6：深化洞见（按需）
- LLM 自判：确有深层意蕴时撰，无则不强写
- 允许范围见 §一.2 §2

### Step 7：图解补充（按需）
- 套 §2.4 必用 / 禁用规则
- 必用场景：多级逻辑判断 / 流派对比 / 体系脉络
- 禁用场景：纯文字释义 / 装饰性配图

### Step 8：自评合规分（0-5）— **仅 LLM 内部评估，不写入 interpretation.md 正文**
- 致命错误 0 + 格式错误 0 + 内容检查 0 = 5 分
- 致命错误 0 + 格式错误 0 + 内容检查 ≤ 1 = 4 分
- 否则 ≤ 3 分（强制重写）
- **本步骤的 5/4/3 分制评估仅用于 LLM 内部决策（是否重写），绝不以任何形式写进 interpretation.md**
- **禁止在解读正文中出现 "## 自评 / ## 合规分 / ## 致命错误 / ## 格式错误 / ## 内容检查" 等章节**
- **禁止 "无 X、无 Y" 形式的元自我断言列表**
- **禁止 ✓/✗/致命错误（N 项）/全部通过 等自评标记**

### Step 9：输出最终文件
- 自评 ≥ 4 才输出
- 文件结构：见 skeleton.md

## 反元自我引用硬规则（套 §一.4 §6）

**禁止**：
- 「本解读」「本文」「本篇解读」
- 【原文此处疑似 OCR 错字】等带【】的元自我标签
- \`mode_of()\` / \`SPEC §X.X\` / \`按 SPEC 公式判为\` 等流水线术语
- 「**本篇模式**」「**模式判定**」等文首元数据 blockquote
- **元自我自评断言**：「无野诀 / 无自创案例 / 无断章取义 / 全部通过 / 致命错误（X 项）/ ✓/✗ 标记 / 自我评分表」等任何形式的 self-check 报告语言或合规自评

**改写方向**：「此言……」「按……」「盖……」「观此造……」

## 跨篇关联硬规则（套 §一.2 ❌项 5）

**禁止**无前置跨篇读取依据时的具体跨篇断言，包括但不限于：
- 「前数篇论 X、Y、Z」（具体篇名或主题枚举）
- 「上承 / 下启 / 前承 / 后启」（具体跨篇方向定位）
- 「第 X 篇 / 第 X 章」（具体位置标识）
- 「本篇与第 X 章呼应 / 互参 / 相对」（具体跨篇呼应）
- 「后文'论 X'篇当互参」（指定后续篇名作互参指引）
- 跨书引述（如「《滴天髓征义》卷 X」），除非本篇原文有直接引述

**唯一允许的笼统表述**：
- 「本书论 X 一系……」
- 「子平之通论 / 子平之大纲 / 子平之常法」
- 「格局定法 / 命理通则」等不指定具体篇名的体系性表述
- 「此论在全书之位置 / 此篇所论属 X 范畴」（不指定前后篇）

**改写方向**：用体系性、范畴性表述替代具体篇名呼应。

## 标题反机械化硬规则（套 §一.1 反机械化规则）

**禁止**二级标题使用 source 分层标签：
- 「原注申说」「原注详解」「原注释义」
- 「原文第一段」「原文首段」「原文末段」
- 「第一段 / 第二段 / 段一 / 段二」
- 任何以"原注""原文""段"开头的机械翻译

**正确做法**：
- 从原文关键词中提炼标题（如"月令为取用之纲维""扶抑之正轨""财旺身弱用印"）
- 用理论概念名（如"曲直仁寿格""官印相生")
- 用问题或论点（如"阴阳顺逆之理""墓库冲与不冲"）

## 输出格式

请输出完整 interpretation.md 内容（**不**含 H1 标题，裸篇名由目录系统推导）。
`
}

/**
 * §七 自评打分
 * @param {{fatal: string[], format: string[], content: string[]}} issues
 * @returns {number} 0-5
 */
export function evalComplianceScore(issues) {
  if (issues.fatal.length > 0) return 3
  if (issues.format.length > 0) return 3
  if (issues.content.length === 0) return 5
  if (issues.content.length === 1) return 4
  return 3
}
