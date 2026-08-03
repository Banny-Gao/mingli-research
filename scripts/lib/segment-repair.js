/**
 * scripts/lib/segment-repair.js — 按段精确修复（取代整篇重生成）
 *
 * ## 为什么需要
 *
 * 原重写机制：self-check 不过 → 把问题清单注入 prompt → **整篇重新生成**，最多 3 轮。
 * 长文场景下这条路基本走不通：
 *   - 一篇 25K 字符的解读，只因某一节出现一处「本解读」就要重写全篇；
 *   - 重写是一次全新生成（temperature 不为 0），上轮已合格的 20 个小节会被重新掷骰子，
 *     旧问题修好了、新问题又冒出来，score 在 3 分附近反复横跳；
 *   - 每轮 thinking + 64K max_tokens，3 轮打满约 192K tokens 后判失败，产出丢弃。
 *
 * 本模块改为：定位命中规则的**具体段落**，只把那几段交给 LLM 修，其余段落逐字保留。
 *
 * ## 可修 vs 不可修（关键设计）
 *
 * 只有能定位到行的问题才可按段修。两类问题**不可**按段修，必须退回整篇重生成：
 *   - `structural-incompleteness` / `structural-coverage`——问题是「内容缺失」，
 *     缺的内容不在任何现存段落里，修哪一段都无济于事；
 *   - 规则在文件级命中、但逐行扫描定位不到具体行（正则跨行或锚定文件首尾）。
 *
 * 判定方式是动态的（扫描行是否命中），不靠在规则表里再加一个 localizable 字段——
 * 规则表已有 scope 一个维度，再加一维会让两处定义漂移。
 *
 * ## 安全约束
 *
 * LLM 改段落时可能顺手删内容。applySegmentRepair 前用 isRepairAcceptable 把关：
 * 修复段显著短于原段（< 60%）即判为「LLM 删了内容」，丢弃该次修复退回整篇重生成。
 */

import { INTERPRETATION_RULES } from './interpretation-rules.js'
import { targetFor } from './self-check-lite.js'

/** 修复段相对原段的最小长度比——低于此判为 LLM 误删内容 */
const MIN_REPAIR_LENGTH_RATIO = 0.6

/**
 * 受影响段落占比超过此阈值时，按段修已无意义（改动面接近全篇），退回整篇重生成。
 * 取 0.5：过半段落有问题说明是系统性偏差（SPEC 理解错、体例跑偏），
 * 逐段打补丁既不省 token 也修不出一致的文风。
 */
const MAX_AFFECTED_SEGMENT_RATIO = 0.5

/**
 * 按二级标题（`## `）把解读切成段。标题前的引言部分作为第 0 段（heading 为 null）。
 *
 * 切分粒度取 `##` 而非段落/句子：SPEC 要求解读以 `##` 组织节，节是语义完整单元，
 * LLM 改一节时上下文自洽；按自然段切会让「引文 + 解读」被拆散，改出来接不上。
 *
 * @param {string} text
 * @returns {Array<{index: number, heading: string|null, text: string, start: number, end: number}>}
 */
export function splitSegments(text) {
  if (!text) return []
  const matches = [...text.matchAll(/^##\s+.*$/gm)]

  // 无 ## 标题 → 整篇作为单段（此时按段修等价于整篇改写，但仍受长度守卫保护）
  if (matches.length === 0) {
    return [{ index: 0, heading: null, text, start: 0, end: text.length }]
  }

  const segments = []
  const firstStart = matches[0].index

  // 引言段（首个 ## 之前的内容，通常是定位元数据 blockquote）
  if (firstStart > 0) {
    segments.push({
      index: 0,
      heading: null,
      text: text.slice(0, firstStart),
      start: 0,
      end: firstStart,
    })
  }

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length
    segments.push({
      index: segments.length,
      heading: matches[i][0].replace(/^##\s+/, '').trim(),
      text: text.slice(start, end),
      start,
      end,
    })
  }
  return segments
}

/**
 * 逐行定位规则命中，返回可定位命中 + 无法定位的规则 id。
 *
 * scope: 'body' 的规则跳过块引用行（原文转录不算 LLM 违规，见 interpretation-rules.js）。
 *
 * @param {string} text
 * @returns {{hits: Array<{ruleId: string, label: string, promptDesc: string, line: number, lineText: string}>, unlocatable: string[]}}
 */
export function locateRuleHits(text) {
  const hits = []
  const unlocatable = []
  const lines = text.split('\n')
  const bodyText = lines.filter(l => !/^\s*>/.test(l)).join('\n')
  const allRules = [...INTERPRETATION_RULES.fatal, ...INTERPRETATION_RULES.format]

  for (const rule of allRules) {
    if (!rule.regex) continue
    // 先看文件级是否命中（与 runSelfCheckLite 判定口径一致——复用其 targetFor）
    const fileTarget = targetFor(rule, text, bodyText)
    if (!rule.regex.test(fileTarget)) continue

    // 再逐行定位
    const lineRe = new RegExp(rule.regex.source, rule.regex.flags.replace('g', ''))
    let found = false
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (rule.scope === 'body' && /^\s*>/.test(line)) continue
      if (lineRe.test(line)) {
        hits.push({
          ruleId: rule.id,
          label: rule.label,
          promptDesc: rule.promptDesc || '',
          line: i,
          lineText: line,
        })
        found = true
      }
    }
    // 文件级命中但逐行定位不到 → 正则跨行或锚定文件首尾，按段修无从下手
    if (!found) unlocatable.push(rule.id)
  }

  return { hits, unlocatable }
}

/**
 * 判断 self-check 的 issue 描述是否属于结构类（内容缺失，按段修无解）。
 * 结构检测在 self-check-lite 内特判（regex: null），不经 locateRuleHits，
 * 故按 issue 文案识别。
 * @param {string} issue
 */
function isStructuralIssue(issue) {
  return issue.startsWith('结构残缺') || issue.startsWith('结构覆盖缺失')
}

/**
 * 制定修复方案：能按段修就列出待修段落，否则说明退回整篇重生成的理由。
 *
 * @param {string} text - 当前解读全文
 * @param {{issues: {fatal: string[], format: string[]}}} check - runSelfCheckLite 结果
 * @returns {{repairable: boolean, reason?: string, segments: Array<{segIndex: number, heading: string|null, text: string, issues: Array<object>}>}}
 */
export function planRepair(text, check) {
  const allIssues = [...check.issues.fatal, ...check.issues.format]

  // 结构类问题 = 内容缺失，任何现存段落都补不出来 → 整篇重生成
  const structural = allIssues.filter(isStructuralIssue)
  if (structural.length > 0) {
    return {
      repairable: false,
      reason: `结构类问题需整篇重生成（${structural.map(s => s.split('：')[0]).join('、')}）`,
      segments: [],
    }
  }

  const { hits, unlocatable } = locateRuleHits(text)

  if (unlocatable.length > 0) {
    return {
      repairable: false,
      reason: `规则命中无法定位到具体行，需整篇重生成（${unlocatable.join('、')}）`,
      segments: [],
    }
  }
  if (hits.length === 0) {
    return { repairable: false, reason: '未定位到任何命中行', segments: [] }
  }

  const segments = splitSegments(text)
  if (segments.length === 0) {
    return { repairable: false, reason: '无法切分段落', segments: [] }
  }

  // 行号 → 段落：按段落起止的行区间归属
  const lineStartOffsets = []
  {
    let offset = 0
    for (const line of text.split('\n')) {
      lineStartOffsets.push(offset)
      offset += line.length + 1
    }
  }

  const bySegment = new Map()
  for (const hit of hits) {
    const charOffset = lineStartOffsets[hit.line]
    const seg = segments.find(s => charOffset >= s.start && charOffset < s.end)
    if (!seg) continue
    if (!bySegment.has(seg.index)) {
      bySegment.set(seg.index, { segIndex: seg.index, heading: seg.heading, text: seg.text, issues: [] })
    }
    bySegment.get(seg.index).issues.push(hit)
  }

  if (bySegment.size === 0) {
    return { repairable: false, reason: '命中行无法归属到段落', segments: [] }
  }

  // 改动面过大 → 逐段打补丁不再划算，且拼接出的文风难一致
  const ratio = bySegment.size / segments.length
  if (ratio > MAX_AFFECTED_SEGMENT_RATIO) {
    return {
      repairable: false,
      reason: `受影响段落占比 ${Math.round(ratio * 100)}%（> ${MAX_AFFECTED_SEGMENT_RATIO * 100}%），疑似系统性偏差，需整篇重生成`,
      segments: [],
    }
  }

  return { repairable: true, segments: [...bySegment.values()].sort((a, b) => a.segIndex - b.segIndex) }
}

/**
 * 构造单段修复 prompt。
 *
 * 只给这一段 + 命中的规则 + 原文，要求原样返回修好的该段——
 * 不重写其他段、不改标题层级、不动块引用里的原文转录。
 *
 * @param {{heading: string|null, text: string, issues: Array<{label: string, promptDesc: string, lineText: string}>}} segment
 *   issues 实际为 locateRuleHits 的 hits 项：{ruleId, label, promptDesc, line, lineText}
 * @param {string} sourceText - source.md 全文（修引文类问题需比对原文）
 * @returns {string}
 */
export function buildSegmentRepairPrompt(segment, sourceText) {
  const issueLines = segment.issues
    .map(i => `- **${i.label}**：${i.promptDesc}\n  命中原句：\`${i.lineText.trim().slice(0, 120)}\``)
    .join('\n')

  return `以下解读片段违反了规范，请**只修这一段**并原样返回修改后的该段全文。

## 待修片段${segment.heading ? `（节：${segment.heading}）` : '（引言部分）'}

${segment.text}

## 命中的规则（必须逐条修正）

${issueLines}

## 修改要求（硬约束）

1. **只返回修改后的这一段 markdown 全文**，不要任何解释、前后缀、代码围栏、自评。
2. **保持段落完整**：原有的小节标题、块引用、论述层次全部保留，不得删减内容或缩写。
3. **不得改动块引用（\`>\` 开头行）内的原文转录**——除非「命中的规则」列出的原句就在块引用内：此时该句本身是待修目标，**仅允许修改该句**（如流水线术语泄漏进定位行、引文被 \`……\` 截断需按下方原文补全、\`> **本篇模式**\` 元数据块需整行移除），块引用内其他行仍不得改动。
4. 修改幅度尽可能小：只改触发规则的措辞，其余文字逐字保留。

## 本篇 source.md 原文（供比对，勿整体复制）

${sourceText}`
}

/**
 * 校验单段修复结果是否可接受（防 LLM 借修改之名删内容）。
 * @param {string} originalSegment
 * @param {string} repairedSegment
 * @returns {{ok: boolean, reason?: string}}
 */
export function isRepairAcceptable(originalSegment, repairedSegment) {
  if (!repairedSegment || !repairedSegment.trim()) {
    return { ok: false, reason: '修复结果为空' }
  }
  // 标题保留校验：原段若以 `## 标题` 开头，修复段必须保留同标题行——
  // 否则 applySegmentRepairs 会把标题静默吞掉，事后门（机械标题/覆盖检测）也抓不到。
  const headingMatch = originalSegment.trim().match(/^##\s+.*$/m)
  if (headingMatch) {
    const origHeading = headingMatch[0].replace(/\s+/g, '')
    const repairedHeading = repairedSegment.trim().match(/^##\s+.*$/m)
    if (!repairedHeading || repairedHeading[0].replace(/\s+/g, '') !== origHeading) {
      return { ok: false, reason: `修复段丢失/改动小节标题「${origHeading}」` }
    }
  }
  const ratio = repairedSegment.trim().length / originalSegment.trim().length
  if (ratio < MIN_REPAIR_LENGTH_RATIO) {
    return {
      ok: false,
      reason: `修复段仅为原段 ${Math.round(ratio * 100)}%（< ${MIN_REPAIR_LENGTH_RATIO * 100}%），疑似 LLM 删减内容`,
    }
  }
  return { ok: true }
}

/**
 * 把修复好的段落回填全文。
 *
 * 按 segIndex 倒序替换——从后往前改，前面段落的 start/end 偏移不受影响，
 * 无需在每次替换后重算全部偏移。
 *
 * @param {string} text - 原全文
 * @param {Array<{segIndex: number, repaired: string}>} repairs
 * @returns {string}
 */
export function applySegmentRepairs(text, repairs) {
  const segments = splitSegments(text)
  let out = text
  const ordered = [...repairs].sort((a, b) => b.segIndex - a.segIndex)
  for (const { segIndex, repaired } of ordered) {
    const seg = segments.find(s => s.index === segIndex)
    if (!seg) continue
    // 统一段末换行，避免回填后与下一段标题粘连
    const normalized = repaired.replace(/\s+$/, '') + '\n\n'
    out = out.slice(0, seg.start) + normalized + out.slice(seg.end)
  }
  return out
}
