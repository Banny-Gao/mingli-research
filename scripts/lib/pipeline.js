/**
 * scripts/lib/pipeline.js — 9 步主体流水线 prompt 装订
 *
 * 套 SPEC-interpretation.md §五 Step 3-9 + §七 自评 5/4/3 分制
 *
 * 反元规则 prompt 描述从 interpretation-rules.js 统一生成，
 * 与 self-check-lite.js 共享单一数据源。
 */

import { antiMetaPromptBlock } from './interpretation-rules.js'

/**
 * 装订 9 步主体流水线的 prompt
 *
 * 设计原则：SPEC-interpretation.md 已全文注入（强装载段），
 * 本函数仅生成"执行指针 + 反元硬规则"——避免与 SPEC 正文重复灌入
 * 引发 LLM 注意力分散与 thinking 预算膨胀。
 *
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

严格按 SPEC-interpretation.md §五 Steps 1-9 顺序执行。Steps 1-2（前置自检与红线确认）**必走不可跳**；后续允许回跳迭代。

- **Step 3-4**：套 §五.3-4 + §1.2 §1、§三 + §2.1
- **Step 5-6**：套 §五.5-6 + §2.2 + §1.2 §2（**按需撰写深化洞见**，无需等到 Step 6 才回灌 Step 4）
- **Step 7-9**：套 §五.7-9 + §2.4 + §七（自评 ≥ 4 才输出；4 分以下强制重写）

${antiMetaPromptBlock()}

## 关键规则速查（务必对照 SPEC 与 general.md 全本执行）

本节为关键约束的速查指针，**不可替代** SPEC / general.md 全本阅读。

1. **禁止无前置跨篇读取依据的具体跨篇断言** — 套 §1.4.5 + §1.2 §2 ❌项 5；只允许"本书论 X 一系……""子平之通论"等笼统表述
2. **禁止二级标题 source 分层标签**（原注申说 / 原文第一段 / 段一 / X X之部 等机械翻译）— 套 §1.1 + §三；标题须从原文关键词提炼或用理论概念名
3. **篇章结构按 source.md 形态分型**（论理体 A / 实战案例体 B / 论命通论体 C）— 套 §三 + §六.6
4. **禁止首行 H1** — 套 §四.4.2；裸篇名由目录系统推导，文件以 ## 二级标题起首
5. **术数类别专项**（如八字 bazi.md）需与 general.md 双重遵守 — 套 §1.5 + bazi.md

## 输出格式

请输出完整 interpretation.md 内容（**不**含 H1 标题，裸篇名由目录系统推导）。
`
}
