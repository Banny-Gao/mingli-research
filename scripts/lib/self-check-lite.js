/**
 * scripts/lib/self-check-lite.js — 精简版 self-check（Node 端 grep 实现）
 *
 * v1.2 覆盖：致命错误（10 类）+ 格式错误（3 类），共 13 项
 * v2 评估：是否与 self-check-interpretation subagent 合并
 *
 * 规则定义统一在 interpretation-rules.js（单一数据源），
 * 本文件仅消费规则做 grep 检测 + 计分。
 *
 * 套 SPEC-interpretation.md §一.2 ❌项 5 跨篇断言 + §一.4 §6 反 AI 痕迹 +
 *      §一.1 标题反机械化 + §七 自检清单
 */

import { INTERPRETATION_RULES } from './interpretation-rules.js'

/**
 * 剥除 blockquote（`> ...`）行，避免原文转录中的"敏感词"误伤 LLM 解读输出。
 * 仅对致命规则 `school-absolutism` 生效（绝对定论措辞——原文转录不算 LLM 武断）。
 */
function stripBlockquotes(text) {
  return text
    .split('\n')
    .filter(line => !/^\s*>/.test(line))
    .join('\n')
}

/**
 * @param {string} text - interpretation.md 全文
 * @returns {{fatal: number, score: number, issues: {fatal: string[], format: string[], content: string[]}}}
 */
export function runSelfCheckLite(text) {
  const issues = { fatal: [], format: [], content: [] }

  // === 致命错误 ===
  for (const rule of INTERPRETATION_RULES.fatal) {
    // school-absolutism 特殊处理：只对 blockquote 外的文本做 grep
    const target = rule.id === 'school-absolutism' ? stripBlockquotes(text) : text
    if (rule.regex && rule.regex.test(target)) {
      issues.fatal.push(`${rule.label}：${rule.promptDesc || ''}`)
    }
  }

  // === 格式错误 ===
  for (const rule of INTERPRETATION_RULES.format) {
    if (rule.regex && rule.regex.test(text)) {
      issues.format.push(`${rule.label}：${rule.promptDesc || ''}`)
    }
  }

  // === 内容检查（v1 无 grep 可检测项，v2 待 LLM 评估器集成） ===

  // === 计算 score ===
  const fatal = issues.fatal.length
  const format = issues.format.length
  let score
  if (fatal > 0 || format > 0) score = 3
  else if (issues.content.length === 0) score = 5
  else if (issues.content.length === 1) score = 4
  else score = 3

  return { fatal, score, issues }
}
