/**
 * scripts/lib/image-gen/text-overlay.js — 统一文字提取流水线
 *
 * 四阶段流水线：
 *   Stage 1: analyzeIntent  — 意图分析（mode 不同 prompt 不同）
 *   Stage 2: buildContext   — 背景上下文（t2i: LLM 创作, i2i: bg-detect）
 *   Stage 3: designLayout   — 排版设计（共享 prompt，上下文格式按 mode 分叉）
 *   Stage 4: applyStyleLock  — 风格锁定（共享）
 *
 * reuse-background 变体：跳过 Stage 2，用 metadata 中的 previousTexts 注入 Stage 3+4。
 */

import { callLLM, createLLMClient } from '../llm-client.js'
import { llmConfig } from '../env.js'
import { cleanJSON, cleanText, sanitizeCleanPrompt } from './sanitize.js'
import { TEXTS_EXTRACTION_PROMPT, LAYOUT_SYSTEM } from './prompts/layout.js'
import { findMetadataForImage } from '../shared/find-metadata.js'

// renderTextOverlay 委托到 renderer.js
export { renderTextOverlay } from './renderer.js'

// ===== 共享工具 =====

const PURPOSE_THRESHOLDS = { mainTitle: 48, signature: 70, subtitle: 24, author: 16 }

function inferPurpose(t) {
  if (t.purpose) return t.purpose
  const size = t.size || 0
  const yPct = parseFloat(String(t.position?.y || '0')) || 0
  if (size >= PURPOSE_THRESHOLDS.mainTitle) return 'main-title'
  if (yPct > PURPOSE_THRESHOLDS.signature) return 'signature'
  if (size >= PURPOSE_THRESHOLDS.subtitle) return 'subtitle'
  if (size >= PURPOSE_THRESHOLDS.author) return 'author'
  return 'decoration'
}

function buildLockedStyle(previousTexts) {
  const locked = {}
  for (const t of previousTexts) {
    const p = t.purpose || 'decoration'
    if (!locked[p]) locked[p] = { fontHint: t.fontHint, color: t.color }
  }
  return locked
}

function applyStyleLock(texts, previousTexts) {
  if (!previousTexts || previousTexts.length === 0) return texts
  const lockedStyle = buildLockedStyle(previousTexts)
  const fallback = Object.values(lockedStyle)[0] || {}
  for (const t of texts) {
    t.purpose = inferPurpose(t)
    const style = lockedStyle[t.purpose] || fallback
    if (style.fontHint) t.fontHint = style.fontHint
    if (style.color) { t.color = style.color; t.explicitColor = true }
  }
  return texts
}

function normalizeMainRect(bgInfo) {
  if (bgInfo.mainRect) return bgInfo.mainRect
  return {
    x: '0%', y: '0%', w: '100%', h: '100%',
    cx: Math.round(bgInfo.width / 2),
    cy: Math.round(bgInfo.height / 2),
  }
}

/** 生成 LLM 调用摘要（不含完整 prompt，只记元数据） */
function callSummary(stage, userMsg) {
  const text = typeof userMsg === 'string' ? userMsg
    : Array.isArray(userMsg) ? userMsg.filter(b => b.type === 'text').map(b => b.text).join('\n')
    : ''
  return { stage, model: llmConfig.model, maxTokens: 4096, userMessageLength: text.length }
}

// ===== Stage 1: 意图分析 =====

async function analyzeIntent(mode, prompt, apiKey, inputImagePath) {
  const promptsModule = await import('./prompts/intent.js')
  const content = mode === 'i2i' ? promptsModule.I2I_INTENT_ANALYSIS_PROMPT : promptsModule.INTENT_ANALYSIS_PROMPT

  let userContent
  if (mode === 'i2i' && inputImagePath) {
    const fs = await import('node:fs')
    const path = await import('node:path')
    const imgBuf = fs.readFileSync(inputImagePath)
    const ext = path.extname(inputImagePath).toLowerCase()
    const mimeMap = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' }
    userContent = [
      { type: 'image', source: { type: 'base64', media_type: mimeMap[ext] || 'image/png', data: imgBuf.toString('base64') } },
      { type: 'text', text: `${content}\n\n用户描述：${prompt}` },
    ]
  } else {
    userContent = `${content}\n\n用户描述：${prompt}`
  }

  const client = createLLMClient({ apiKey })
  const raw = await callLLM(client, {
    model: llmConfig.model, maxTokens: 4096, extendedThinking: true,
    system: promptsModule.INTENT_SYSTEM,
    messages: [{ role: 'user', content: userContent }],
  })
  const intent = JSON.parse(cleanJSON(raw))
  intent._callSummary = callSummary('intent', userContent)
  return intent
}

// ===== Stage 2: 背景上下文 =====

async function buildContext(mode, intent, prompt, apiKey, opts = {}) {
  if (mode === 'i2i') {
    const { analyzeBackground } = await import('./bg-detect.js')
    const bgInfo = await analyzeBackground(opts.inputImagePath)
    const mainRect = normalizeMainRect(bgInfo)
    return { type: 'image-analysis', bgInfo, mainRect, dominantColor: bgInfo.dominantColor }
  }

  const { CLEAN_PROMPT_GENERATION_PROMPT, CLEAN_PROMPT_SYSTEM } = await import('./prompts/clean.js')
  const userMsg = [
    `${CLEAN_PROMPT_GENERATION_PROMPT}`,
    ``,
    `## 设计意图分析`,
    `\`\`\`json`,
    `${JSON.stringify(intent, null, 2)}`,
    `\`\`\``,
    ``,
    `## 用户原始描述`,
    `${prompt}`,
  ].join('\n')

  const client = createLLMClient({ apiKey })
  const raw = await callLLM(client, {
    model: llmConfig.model, maxTokens: 4096, extendedThinking: true,
    system: CLEAN_PROMPT_SYSTEM,
    messages: [{ role: 'user', content: userMsg }],
  })
  const result = JSON.parse(cleanJSON(raw))
  return {
    type: 'background-creation',
    cleanPrompt: sanitizeCleanPrompt(cleanText(result.backgroundPrompt || '')),
    reservedAreas: Array.isArray(result.reservedAreas) ? result.reservedAreas : [],
    _callSummary: callSummary('context', userMsg),
  }
}

// ===== Stage 3: 排版设计 =====

async function designLayout({ intent, prompt, apiKey, context, mode, previousTexts = [] }) {
  const client = createLLMClient({ apiKey })
  const baseOpts = { model: llmConfig.model, maxTokens: 4096, extendedThinking: true }

  const msgs = [
    `${TEXTS_EXTRACTION_PROMPT}`,
    ``,
    `## 设计意图分析${mode === 'i2i' ? '（图生图：基于参考图理解变更）' : ''}`,
    '```json',
    JSON.stringify(intent, null, 2),
    '```',
    ``,
  ]

  if (mode === 'i2i') {
    msgs.push(
      `## 参考图实测数据（来自 bg-detect；layout 必须严格对齐 mainRect）`,
      '```json',
      JSON.stringify({ width: context.bgInfo.width, height: context.bgInfo.height, mainRect: context.mainRect, dominantColor: context.dominantColor }, null, 2),
      '```',
    )
  } else {
    msgs.push(
      `## 文字预留区（来自 clean.js，LLM 显式预留）`,
      context.reservedAreas?.length ? '```json\n' + JSON.stringify(context.reservedAreas, null, 2) + '\n```' : '(无)',
      ``,
      `## 背景描述（cleanPrompt）`,
      `${context.cleanPrompt || '(无)'}`,
    )
  }

  msgs.push(``, `## 用户原始描述`, `${prompt}`)

  if (previousTexts.length > 0) {
    const lockedStyle = buildLockedStyle(previousTexts)
    msgs.push(
      ``, `## 上一次同背景的文字规格（复用背景场景）`, ``,
      `**fontHint 与 color 由段位锁定（LLM 输出后会被强制覆盖）**：`,
      '```json', JSON.stringify(lockedStyle, null, 2), '```', ``,
      `**硬要求**：你的输出 texts 中，每段必须包含 purpose 字段。`,
      `fontHint 与 color 会在你的输出后被强制替换为上面锁定表中对应 purpose 的值。`,
    )
  }

  const userMsg = msgs.join('\n')
  const raw = await callLLM(client, {
    ...baseOpts,
    system: LAYOUT_SYSTEM,
    messages: [{ role: 'user', content: userMsg }],
  })
  const texts = JSON.parse(cleanJSON(raw))
  if (mode === 'i2i') {
    for (const t of texts) { if (t.color) t.explicitColor = true }
  }
  texts._callSummary = callSummary('layout', userMsg)
  return texts
}

// ===== 公开 API =====

export async function extractTextSpec(mode, prompt, apiKey, opts = {}) {
  try {
    const intent = await analyzeIntent(mode, prompt, apiKey, opts.inputImagePath)
    const llmCalls = [intent._callSummary]

    let context
    if (opts.skipContext) {
      context = opts.presetContext || {}
    } else {
      context = await buildContext(mode, intent, prompt, apiKey, opts)
      if (context._callSummary) llmCalls.push(context._callSummary)
    }

    const texts = await designLayout({ intent, prompt, apiKey, context, mode, previousTexts: opts.previousTexts || [] })
    if (texts._callSummary) llmCalls.push(texts._callSummary)

    if (opts.previousTexts?.length) applyStyleLock(texts, opts.previousTexts)

    const result = {
      texts: texts || [],
      intent: { composition: intent.composition, style: intent.style, colors: intent.colors, visualElements: intent.visualElements, textRequirements: intent.textRequirements },
      llmCalls,
    }
    if (mode === 'i2i') {
      result.bgInfo = context.bgInfo || null
      result.mainRect = context.mainRect || null
      result.dominantColor = context.dominantColor || null
      result.cleanPrompt = null
      result.reservedAreas = []
    } else {
      result.cleanPrompt = context.cleanPrompt || prompt
      result.reservedAreas = context.reservedAreas || []
      result.bgInfo = null
    }
    return result
  } catch (err) {
    console.error(`⚠️ 文字提取失败: ${err.message}，使用原始 prompt（保留所有字面符号）`)
    if (mode === 'i2i') return { bgInfo: null, mainRect: null, dominantColor: null, cleanPrompt: null, reservedAreas: [], texts: [], intent: null, llmCalls: [] }
    return { cleanPrompt: prompt, reservedAreas: [], texts: [], bgInfo: null, intent: null, llmCalls: [] }
  }
}

export async function extractReuseTextSpec(mode, prompt, bgPath, apiKey) {
  const found = findMetadataForImage(bgPath)
  const previousTexts = found ? (Array.isArray(found.meta.textOverlay?.texts) ? found.meta.textOverlay.texts : []) : []

  if (previousTexts.length > 0) {
    console.log(`   🔎 复用背景找到对应 metadata: ${previousTexts.length} 个历史文字（fontHint/color 将被锁定）`)
  } else if (found) {
    console.log(`   ℹ️ 复用背景 metadata 中无文字记录，将按 prompt 全新生成`)
  } else {
    console.log(`   ⚠️ 未找到对应 metadata，将按 prompt 全新生成`)
  }

  let skipContext = false, presetContext = {}
  if (mode === 't2i' && found) {
    const meta = found.meta
    for (const t of previousTexts) { if (!t.purpose) t.purpose = inferPurpose(t) }
    presetContext = {
      cleanPrompt: meta.textOverlay?.cleanPrompt || '',
      reservedAreas: Array.isArray(meta.textOverlay?.reservedAreas) ? meta.textOverlay.reservedAreas : [],
    }
    skipContext = true
    console.log(`   📄 复用 metadata: ${presetContext.reservedAreas.length} 个预留区`)
  }

  const result = await extractTextSpec(mode, prompt, apiKey, { inputImagePath: bgPath, previousTexts, skipContext, presetContext })
  return { ...result, previousTexts, source: found ? 'lookup' : null }
}
