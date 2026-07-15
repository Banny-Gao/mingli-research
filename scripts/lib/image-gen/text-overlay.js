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
  return { stage, model: llmConfig.model, maxTokens: 12800, userMessageLength: text.length }
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
    model: llmConfig.model, maxTokens: 12800, extendedThinking: true,
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
    model: llmConfig.model, maxTokens: 12800, extendedThinking: true,
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
  // 8192 兼容多段文字 + extendedThinking：4 段 × ~12 字段 × JSON 格式 → 容易撞 12800 上限被截断
  const baseOpts = { model: llmConfig.model, maxTokens: 8192, extendedThinking: true }

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
    // t2i 也有两种情况：
    //   (a) 普通 t2i（无 reuse）：只有 LLM 生成的 cleanPrompt + reservedAreas，无实测 mainRect
    //   (b) t2i + reuse-background：bg-detect 跑过，context.bgInfo / mainRect / dominantColor 都有
    //       此时优先使用实测数据（与 i2i 同等待遇），cleanPrompt + reservedAreas 作为辅助上下文保留
    if (context.bgInfo && context.mainRect) {
      msgs.push(
        `## 复用底图实测数据（来自 bg-detect；layout 必须严格对齐 mainRect）`,
        '```json',
        JSON.stringify({ width: context.bgInfo.width, height: context.bgInfo.height, mainRect: context.mainRect, dominantColor: context.dominantColor }, null, 2),
        '```',
      )
    }
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
  // LLM 输出偶发被 maxTokens 截断导致 JSON 闭合失败（"Unterminated string"），重试 1 次。
  // 重试时附带"上次输出被截断"提示，引导 LLM 缩短内容。
  let raw, texts
  for (let attempt = 1; attempt <= 2; attempt++) {
    raw = await callLLM(client, {
      ...baseOpts,
      system: LAYOUT_SYSTEM,
      messages: attempt === 1
        ? [{ role: 'user', content: userMsg }]
        : [{ role: 'user', content: userMsg },
           { role: 'assistant', content: '抱歉，上一次输出被截断。' },
           { role: 'user', content: '请重新输出更简洁的纯 JSON 数组，去掉所有多余解释，确保 JSON 完整闭合。' }],
    })
    try {
      texts = JSON.parse(cleanJSON(raw))
      break
    } catch (err) {
      if (attempt === 2) throw err
      console.warn(`   ⚠️ designLayout 输出 JSON 解析失败（${err.message}），重试 1 次`)
    }
  }
  if (mode === 'i2i') {
    for (const t of texts) { if (t.color) t.explicitColor = true }
  }
  texts._callSummary = callSummary('layout', userMsg)
  return texts
}

// ===== 公开 API =====

export async function extractTextSpec(mode, prompt, apiKey, opts = {}) {
  try {
    const llmCalls = []
    let intent
    if (opts.skipContext && opts.presetContext && opts.presetContext._intent) {
      // 复用底图场景：metadata 已带 intent，不再跑 Stage 1 LLM 调用
      intent = opts.presetContext._intent
    } else {
      intent = await analyzeIntent(mode, prompt, apiKey, opts.inputImagePath)
      if (intent._callSummary) llmCalls.push(intent._callSummary)
    }

    let context
    if (opts.skipContext) {
      context = opts.presetContext || {}
      if (context._callSummary) llmCalls.push(context._callSummary)
    } else {
      context = await buildContext(mode, intent, prompt, apiKey, opts)
      if (context._callSummary) llmCalls.push(context._callSummary)
    }

    const texts = await designLayout({ intent, prompt, apiKey, context, mode, previousTexts: opts.previousTexts || [] })
    if (texts._callSummary) llmCalls.push(texts._callSummary)

    if (opts.previousTexts?.length) applyStyleLock(texts, opts.previousTexts)

    const result = {
      texts: texts || [],
      intent: {
        composition: intent.composition, style: intent.style,
        colors: intent.colors, visualElements: intent.visualElements,
        textRequirements: intent.textRequirements,
      },
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
      result.bgInfo = context.bgInfo || null
      result.mainRect = context.mainRect || null
      result.dominantColor = context.dominantColor || null
    }
    return result
  } catch (err) {
    // 保留可见的失败信号：spinner 只显示"文字提取失败"，但运维需要看到原因
    console.warn(`⚠️ 文字提取失败: ${err.message}，使用原始 prompt（保留所有字面符号）`)
    if (mode === 'i2i') return { bgInfo: null, mainRect: null, dominantColor: null, cleanPrompt: null, reservedAreas: [], texts: [], intent: null, llmCalls: [] }
    return { cleanPrompt: prompt, reservedAreas: [], texts: [], bgInfo: null, mainRect: null, dominantColor: null, intent: null, llmCalls: [] }
  }
}

export async function extractReuseTextSpec(mode, prompt, bgPath, apiKey) {
  const found = findMetadataForImage(bgPath)
  const previousTexts = found ? (Array.isArray(found.meta.textOverlay?.texts) ? found.meta.textOverlay.texts : []) : []

  let skipContext = false, presetContext = {}
  if (mode === 't2i' && found) {
    const meta = found.meta
    for (const t of previousTexts) { if (!t.purpose) t.purpose = inferPurpose(t) }
    presetContext = {
      cleanPrompt: meta.textOverlay?.cleanPrompt || '',
      reservedAreas: Array.isArray(meta.textOverlay?.reservedAreas) ? meta.textOverlay.reservedAreas : [],
    }
    // 复用场景：metadata 已保留上次 intent 时直接复用，避免再跑一次 Stage 1 LLM 调用
    if (meta.textOverlay?.intent && typeof meta.textOverlay.intent === 'object') {
      presetContext._intent = meta.textOverlay.intent
    }
    skipContext = true
    // 三种 case 在日志层面要可区分，便于运维判断落到了哪条路径：
    //   (1) 有 metadata + 有历史文字：fontHint/color 锁定，bg-detect 会跑
    //   (2) 有 metadata + 无历史文字：cleanPrompt + reservedAreas 复用，但 fontHint/color 不会锁定
    //   (3) 无 metadata（下面的 else if）：bg-detect 不跑，layout LLM 无 mainRect（中央堆叠风险）
    if (previousTexts.length > 0) {
      console.log(`   🔎 复用 metadata: ${previousTexts.length} 个历史文字 + ${presetContext.reservedAreas.length} 预留区（fontHint/color 锁定）`)
    } else {
      console.log(`   ℹ️ 复用 metadata 但无文字记录，按 prompt 全新生成（bg-detect 仍会跑以补 mainRect）`)
    }
  } else if (mode === 't2i') {
    console.log(`   ⚠️ 未找到对应 metadata，按 prompt 全新生成；layout LLM 将无 mainRect 数据（中央堆叠风险）`)
  }

  // t2i + reuse-background：跑 bg-detect 拿实测 mainRect + dominantColor，喂给 layout LLM。
  // 避免 layout LLM 拿不到任何实测数据时瞎猜 position（之前表现为 30%/50%/62% 全部堆中央轴）。
  let bgDetectSummary = null
  if (mode === 't2i' && skipContext) {
    try {
      const { analyzeBackground } = await import('./bg-detect.js')
      const bgInfo = await analyzeBackground(bgPath)
      const mainRect = normalizeMainRect(bgInfo)
      presetContext.bgInfo = bgInfo
      presetContext.mainRect = mainRect
      presetContext.dominantColor = bgInfo.dominantColor
      bgDetectSummary = callSummary('bg-detect', `[reuse] ${bgPath}`)
      const rect = mainRect
      console.log(`   📐 复用底图实测: ${bgInfo.width}x${bgInfo.height}, mainRect=(${rect.x},${rect.y},${rect.w},${rect.h}), 主色 ${bgInfo.dominantColor?.hex || '(none)'}`)
    } catch (err) {
      console.warn(`   ⚠️ 复用底图 bg-detect 失败: ${err.message}，layout LLM 将无 mainRect 数据`)
    }
  }

  // 不破坏性修改 extractTextSpec 返回的 llmCalls 数组（防御未来可能的记忆化）
  let result
  try {
    result = await extractTextSpec(mode, prompt, apiKey, { inputImagePath: bgPath, previousTexts, skipContext, presetContext })
  } catch (err) {
    // reuse 路径下 LLM 偶发失败时（JSON 截断 / thinking-only 等），用 metadata 的 previousTexts
    // 兜底，保住复用价值（文字位置/字体/颜色都不丢）
    if (previousTexts.length > 0) {
      console.warn(`   ⚠️ reuse 路径 LLM 失败（${err.message}），回退到 metadata 中的 ${previousTexts.length} 段历史文字`)
      const ctx = presetContext
      result = {
        texts: previousTexts,
        intent: null,
        cleanPrompt: null,
        reservedAreas: [],
        bgInfo: ctx.bgInfo || null,
        mainRect: ctx.mainRect || null,
        dominantColor: ctx.dominantColor || null,
        llmCalls: [{ stage: 'reuse-fallback', model: 'reuse', maxTokens: 0, userMessageLength: 0 }],
      }
    } else {
      throw err
    }
  }
  const llmCalls = bgDetectSummary && result.llmCalls
    ? [bgDetectSummary, ...result.llmCalls]
    : result.llmCalls
  return { ...result, llmCalls, previousTexts, source: found ? 'lookup' : null }
}
