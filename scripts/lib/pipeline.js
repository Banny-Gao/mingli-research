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

### Step 8：自评合规分（0-5）
- 致命错误 0 + 格式错误 0 + 内容检查 0 = 5 分
- 致命错误 0 + 格式错误 0 + 内容检查 ≤ 1 = 4 分
- 否则 ≤ 3 分（强制重写）

### Step 9：输出最终文件
- 自评 ≥ 4 才输出
- 文件结构：见 skeleton.md

## 反元自我引用硬规则（套 §一.4 §6）

**禁止**：
- 「本解读」「本文」「本篇解读」
- 【原文此处疑似 OCR 错字】等带【】的元自我标签
- \`mode_of()\` / \`SPEC §X.X\` / \`按 SPEC 公式判为\` 等流水线术语
- 「**本篇模式**」「**模式判定**」等文首元数据 blockquote

**改写方向**：「此言……」「按……」「盖……」「观此造……」

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
