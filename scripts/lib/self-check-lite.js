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
 * 结构完整性检测（配套 interpretation-rules.js 的 structural-incompleteness 规则）。
 *
 * adaptive thinking 模式下，thinking 吃掉大半预算后模型可能以 end_turn 提前结束，
 * 产出"语法完整但结构残缺"的解读。此函数用篇幅信号兜底识别这类隐性截断。
 *
 * 检测：去 blockquote 与空白后有效正文 < 600 字符 → 判残缺。
 *
 * 设计取舍：不检测"收束节存在性"——产出末节标题写法高度多样（## 本篇之位 / ### 本篇在
 * 体系中之笼统位置 / 无标题收束段 / ## 篇中定位……），正则无法穷举且会误伤用 ### 或无
 * 标题收束的正常篇。"内容覆盖缺失"（如天干篇跳过甲~庚 7 干）由 checkStructuralCoverage
 * 单独检测（见下）。
 *
 * @param {string} text - interpretation.md 全文（已 post-process 后）
 * @returns {{hit: boolean, reason: string}}
 */
function checkStructuralCompleteness(text) {
  if (!text || !text.trim()) {
    return { hit: true, reason: '结构残缺：输出为空' }
  }

  // 有效正文（去 blockquote 与空白）
  const effectiveText = stripBlockquotes(text).replace(/\s+/g, '')

  // 豁免极短输入（< 100 字符，如单测最小夹具/边界输入），仅对接近真实产出的文本判残缺
  if (effectiveText.length < 100) {
    return { hit: false, reason: '' }
  }

  const MIN_EFFECTIVE_CHARS = 600
  if (effectiveText.length < MIN_EFFECTIVE_CHARS) {
    return {
      hit: true,
      reason: `结构残缺：有效正文仅 ${effectiveText.length} 字符（< ${MIN_EFFECTIVE_CHARS}），疑似 adaptive thinking 吃预算致 end_turn 提前停，产出未走完 SPEC §五 Steps 5-9`,
    }
  }

  return { hit: false, reason: '' }
}

/**
 * 提取文本中所有二级标题（`## 标题`）的标题文本，去前后空白。
 * 导出供 llm-batch.js 续轮锚点清单复用（单一来源，避免正则漂移）。
 * @param {string} text
 * @returns {string[]}
 */
export function extractH2Headings(text) {
  if (!text) return []
  const matches = [...text.matchAll(/^##\s+(.+?)\s*$/gm)]
  return matches.map(m => m[1].replace(/\s+/g, ''))
}

/**
 * 结构覆盖检测（长文场景）。
 *
 * 当 source.md 有 ≥5 个二级标题时（如天干篇十天干各一节），interpretation 的二级标题
 * 数应大致对应。adaptive thinking 模式下 LLM 可能选择性输出（跳过前几节只写后几节，
 * 末尾补统会节即 end_turn），导致"有收束节但内容覆盖缺失"——篇幅检测与收束节检测都
 * 抓不到。此函数用结构数量指纹兜底识别这类残缺。
 *
 * 检测：source ## ≥ 5 且 intr ## / source ## < 60% → 判残缺，并在 reason 列出 source
 * 全部 ## 节名作为"应覆盖清单"供 LLM 对照补全。
 *
 * 匹配策略取舍：不做 source↔intr 标题内容匹配——LLM 按 SPEC §1.1 规则会从原文关键词
 * 提炼新标题（如 source "何知其人富" → intr "财气通门户"），标题子串匹配会误伤正常篇。
 * 纯数量比是唯一稳定信号（实测滴天髓阐微 6 篇 source##≥5：天干 4/10=40% 唯一残缺，
 * 其余 9/8、12/12、16/12 等全 > 60%）。
 *
 * @param {string} text - interpretation.md 全文
 * @param {string} [source] - source.md 全文（可选，向后兼容）
 * @returns {{hit: boolean, reason: string}}
 */
function checkStructuralCoverage(text, source) {
  if (!text || !source) {
    return { hit: false, reason: '' }
  }

  const srcHeads = extractH2Headings(source)
  const MIN_SRC_HEADS = 5
  if (srcHeads.length < MIN_SRC_HEADS) {
    return { hit: false, reason: '' }
  }

  const intrHeads = extractH2Headings(text)
  const rate = intrHeads.length / srcHeads.length
  const MIN_RATE = 0.6

  if (rate < MIN_RATE) {
    const checklist = srcHeads.slice(0, 10).join('、')
    const suffix = srcHeads.length > 10 ? ` 等${srcHeads.length}节` : ''
    return {
      hit: true,
      reason: `结构覆盖缺失：intr ##/src ## = ${intrHeads.length}/${srcHeads.length} = ${Math.round(rate * 100)}%（< ${MIN_RATE * 100}%），应覆盖 source 全部 ## 节：[${checklist}${suffix}]`,
    }
  }

  return { hit: false, reason: '' }
}

/**
 * @param {string} text - interpretation.md 全文
 * @param {string} [sourceText] - source.md 全文（可选，传入后启用结构覆盖检测）
 * @returns {{fatal: number, score: number, issues: {fatal: string[], format: string[], content: string[]}}}
 */
export function runSelfCheckLite(text, sourceText) {
  const issues = { fatal: [], format: [], content: [] }

  // === 致命错误 ===
  for (const rule of INTERPRETATION_RULES.fatal) {
    // school-absolutism 特殊处理：只对 blockquote 外的文本做 grep
    const target = rule.id === 'school-absolutism' ? stripBlockquotes(text) : text
    if (rule.regex && rule.regex.test(target)) {
      issues.fatal.push(`${rule.label}：${rule.promptDesc || ''}`)
    }
  }

  // === 结构完整性（配套 structural-incompleteness 规则，组合条件特判）===
  const struct = checkStructuralCompleteness(text)
  if (struct.hit) {
    issues.fatal.push(struct.reason)
  }

  // === 结构覆盖（长文场景：source ## ≥ 5 时检查 intr ##/src ## 比例）===
  const coverage = checkStructuralCoverage(text, sourceText)
  if (coverage.hit) {
    issues.fatal.push(coverage.reason)
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
