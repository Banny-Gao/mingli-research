/**
 * scripts/lib/t2i/text-overlay.js — 文字提取与叠加入口（薄壳）
 *
 * 拆解后的模块：
 *   - prompts/intent.js  步骤1 意图分析 prompt
 *   - prompts/clean.js   步骤2 背景创作 prompt
 *   - prompts/layout.js  步骤3 排版设计 prompt
 *   - sanitize.js        cleanPrompt 后处理 + JSON/文本清洗
 *   - renderer.js        Canvas 渲染 + 颜色对比度调整 + 竖排方向
 *
 * 本文件只负责三步流水线的串联和错误处理。
 */

import { callLLM, createLLMClient } from '../llm-client.js'
import { llmConfig } from '../env.js'
import { INTENT_ANALYSIS_PROMPT, INTENT_SYSTEM } from './prompts/intent.js'
import { CLEAN_PROMPT_GENERATION_PROMPT, CLEAN_PROMPT_SYSTEM } from './prompts/clean.js'
import { TEXTS_EXTRACTION_PROMPT, LAYOUT_SYSTEM } from './prompts/layout.js'
import { cleanJSON, cleanText, sanitizeCleanPrompt } from './sanitize.js'
import { renderTextOverlay as renderTextOverlayImpl } from './renderer.js'

// ===== 三步流水线 =====

/**
 * 步骤 3（独立可调用）：基于意图 + 预留区 + cleanPrompt + 用户 prompt 设计文字排版规格。
 * 复用背景场景：cleanPrompt / reservedAreas 来自之前生成的 metadata，不必重跑步骤 2。
 *
 * @param {object} opts
 * @param {object} opts.intent - 步骤 1 意图分析结果
 * @param {Array}  [opts.reservedAreas=[]] - 文字预留区元数据（clean.js 输出）
 * @param {string} [opts.cleanPrompt=''] - 步骤 2 背景描述
 * @param {string} opts.prompt - 用户原始描述
 * @param {string} opts.apiKey
 * @param {Array}  [opts.previousFontHints=[]] - 上一次生成的 fontHint 列表（复用背景时注入，让 LLM 延续风格）
 * @param {Array}  [opts.previousTexts=[]] - 上一次生成的完整 texts（复用背景时注入，提供字体/颜色/位置参考）
 */
export async function layoutFromBackground({
  intent,
  reservedAreas = [],
  cleanPrompt = '',
  prompt,
  apiKey,
  previousFontHints = [],
  previousTexts = [],
}) {
  const client = createLLMClient({ apiKey })
  const baseOpts = {
    model: llmConfig.model,
    maxTokens: 4096,
    extendedThinking: true,
  }

  // 构建 purpose → {fontHint, color} 锁定表（previousTexts 已有 purpose；旧 metadata 已在 t2i.js 自动推断）
  const lockedStyle = {}
  for (const t of previousTexts) {
    const p = t.purpose || 'decoration'
    if (!lockedStyle[p]) {
      lockedStyle[p] = { fontHint: t.fontHint, color: t.color }
    }
  }

  const msgs = [
    `${TEXTS_EXTRACTION_PROMPT}`,
    ``,
    `## 设计意图分析`,
    '```json',
    `${JSON.stringify(intent, null, 2)}`,
    '```',
    ``,
    `## 文字预留区（来自 clean.js，LLM 显式预留）`,
    reservedAreas.length ? '```json\n' + JSON.stringify(reservedAreas, null, 2) + '\n```' : '(无)',
    ``,
    `## 背景描述（cleanPrompt）`,
    `${cleanPrompt || '(无)'}`,
    ``,
    `## 用户原始描述`,
    `${prompt}`,
  ]
  if (Object.keys(lockedStyle).length) {
    msgs.push(
      ``,
      `## 上一次同背景的文字规格（复用背景场景）`,
      ``,
      `**fontHint 与 color 由段位锁定（LLM 输出后会被强制覆盖）**：`,
      '```json',
      JSON.stringify(lockedStyle, null, 2),
      '```',
      ``,
      `**硬要求**：你的输出 texts 中，每段必须包含 purpose 字段（"main-title"/"subtitle"/"author"/"signature"/"decoration"）。`,
      `fontHint 与 color 会在你的输出后被强制替换为上面锁定表中对应 purpose 的值。本次任务你只需计算 size 和 position。`,
      `如果你不写 purpose 字段，fontHint 会默认按 main-title 锁定的字体渲染（通常不是你想要的）。`
    )
  }

  const textsRaw = await callLLM(client, {
    ...baseOpts,
    system: LAYOUT_SYSTEM,
    messages: [{ role: 'user', content: msgs.filter(Boolean).join('\n') }],
  })
  const texts = JSON.parse(cleanJSON(textsRaw))

  // 强制覆盖 fontHint + color（按 purpose 匹配；LLM 不给 purpose 时按 size/y 启发式推断；最后 fallback 到第一条锁定）
  const inferPurpose = t => {
    if (t.purpose) return t.purpose
    const size = t.size || 0
    const yPct = parseFloat(String(t.position?.y || '0')) || 0
    if (size >= 48) return 'main-title'
    if (yPct > 70) return 'signature'
    if (size >= 24) return 'subtitle'
    if (size >= 16) return 'author'
    return 'decoration'
  }
  const fallbackStyle = Object.values(lockedStyle)[0] || {}
  for (const t of texts) {
    const purpose = inferPurpose(t)
    t.purpose = purpose
    const style = lockedStyle[purpose] || fallbackStyle
    if (style.fontHint) t.fontHint = style.fontHint
    if (style.color) {
      t.color = style.color
      t.explicitColor = true
    }
  }

  return texts
}

/**
 * 三步流水线：从用户 prompt 中提取文字需求。
 *
 * 步骤1：意图分析 → intent
 * 步骤2：背景创作 → intent + prompt → cleanPrompt（经安全后处理）
 * 步骤3：排版设计 → intent + cleanPrompt + prompt → texts
 */
async function extractWithLLM(prompt, apiKey) {
  const client = createLLMClient({ apiKey })
  const baseOpts = {
    model: llmConfig.model,
    maxTokens: 4096,
    extendedThinking: true,
  }

  // 步骤1：意图分析
  const intentRaw = await callLLM(client, {
    ...baseOpts,
    system: INTENT_SYSTEM,
    messages: [{ role: 'user', content: `${INTENT_ANALYSIS_PROMPT}\n\n用户描述：${prompt}` }],
  })
  const intent = JSON.parse(cleanJSON(intentRaw))

  // 步骤2：背景创作（基于意图理解）—— 现在输出 JSON { backgroundPrompt, reservedAreas }
  const cleanRaw = await callLLM(client, {
    ...baseOpts,
    system: CLEAN_PROMPT_SYSTEM,
    messages: [
      {
        role: 'user',
        content: [
          `${CLEAN_PROMPT_GENERATION_PROMPT}`,
          ``,
          `## 设计意图分析`,
          `\`\`\`json`,
          `${JSON.stringify(intent, null, 2)}`,
          `\`\`\``,
          ``,
          `## 用户原始描述`,
          `${prompt}`,
        ].join('\n'),
      },
    ],
  })
  const cleanResult = JSON.parse(cleanJSON(cleanRaw))
  let cleanPrompt = cleanText(cleanResult.backgroundPrompt || '')
  const reservedAreas = Array.isArray(cleanResult.reservedAreas) ? cleanResult.reservedAreas : []

  // 安全后处理：移除禁止模式、追加反文字后缀
  cleanPrompt = sanitizeCleanPrompt(cleanPrompt)

  // 步骤3：排版设计（基于意图 + 背景 + 文字预留区）
  const texts = await layoutFromBackground({ intent, reservedAreas, cleanPrompt, prompt, apiKey })

  return { cleanPrompt, reservedAreas, texts }
}

/**
 * 从用户 prompt 中提取文字规格。
 * 如果没有文字需求，返回 { cleanPrompt: prompt, reservedAreas: [], texts: [] }。
 *
 * 降级策略（[feedback-t2i-fallback]）：
 * LLM 提取失败时**不修改**用户原始 prompt，保留《》/引号等字面符号，
 * 因为用户可能就是要在 prompt 中包含这些字符。
 */
export async function extractTextSpec(prompt, apiKey) {
  try {
    const result = await extractWithLLM(prompt, apiKey)
    if (!result.cleanPrompt) result.cleanPrompt = prompt
    if (!result.reservedAreas) result.reservedAreas = []
    if (!result.texts) result.texts = []
    return result
  } catch (err) {
    console.error(`⚠️ 文字提取失败: ${err.message}，使用原始 prompt（保留所有字面符号）`)
    return { cleanPrompt: prompt, reservedAreas: [], texts: [] }
  }
}

// ===== 渲染委托 =====

/**
 * 将文字叠加到背景图上（委托给 renderer.js）。
 */
export async function renderTextOverlay(bgPath, texts, outputPath) {
  return renderTextOverlayImpl(bgPath, texts, outputPath)
}
