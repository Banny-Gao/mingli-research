/**
 * scripts/lib/i2i/text-overlay.js — 文字提取与叠加入口（薄壳）
 *
 * 拆解后的模块：
 *   - prompts/i2i-intent.js  步骤1 意图分析 prompt (i2i 版本)
 *   - ../t2i/prompts/layout.js   步骤2 排版设计 prompt (复用)
 *   - ../t2i/sanitize.js    JSON/文本清洗 (复用)
 *   - ../t2i/renderer.js    Canvas 渲染 + 颜色对比度调整 + 竖排方向 (复用)
 *
 * 本文件只负责两步流水线的串联和错误处理。
 *
 * 复用背景场景的 layout LLM 注入之前 metadata 的 fontHint/color
 * （按 purpose 段位锁），与 t2i 行为对齐；详见 extractTextSpecForReuseI2I。
 */

import { analyzeBackground } from '../t2i/bg-detect.js'
import { callLLM, createLLMClient } from '../llm-client.js'
import { llmConfig } from '../env.js'
import { cleanJSON, cleanText } from '../t2i/sanitize.js'
import {
  I2I_INTENT_ANALYSIS_PROMPT,
  I2I_INTENT_SYSTEM,
} from './prompts/i2i-intent.js'
import { TEXTS_EXTRACTION_PROMPT, LAYOUT_SYSTEM } from '../t2i/prompts/layout.js'
import { renderTextOverlay as renderTextOverlayImpl } from '../t2i/renderer.js'
import { findMetadataForImage } from '../shared/find-metadata.js'

/**
 * 把 bg-detect 输出的 mainRect (percent 字符串) 转成 layout.js 期望的形状。
 * layout prompt 期望 mainRect.cx/cy 为像素、x/y/w/h 为百分比——与 analyzeBackground 输出一致。
 *
 * 如果 mainRect === null（输入图无明显主体矩形），用全图兜底。
 */
function normalizeMainRect(bgInfo) {
  if (bgInfo.mainRect) return bgInfo.mainRect
  // 兜底：100% 矩形；cx/cy 用画布中心
  return {
    x: '0%',
    y: '0%',
    w: '100%',
    h: '100%',
    cx: Math.round(bgInfo.width / 2),
    cy: Math.round(bgInfo.height / 2),
  }
}

/**
 * 按 purpose 锁定 fontHint/color；未匹配时 fallback 到第一条锁定。
 * 与 t2i/lib/t2i/text-overlay.js:114-123 行为对齐。
 */
function applyLockedStyle(texts, previousTexts) {
  const lockedStyle = {}
  for (const t of previousTexts) {
    const p = t.purpose || 'decoration'
    if (!lockedStyle[p]) lockedStyle[p] = { fontHint: t.fontHint, color: t.color }
  }
  const fallback = Object.values(lockedStyle)[0] || {}
  for (const t of texts) {
    const fontSize = t.size || 0
    const yPct = parseFloat(String(t.position?.y || '0')) || 0
    let purpose = t.purpose
    if (!purpose) {
      if (fontSize >= 48) purpose = 'main-title'
      else if (yPct > 70) purpose = 'signature'
      else if (fontSize >= 24) purpose = 'subtitle'
      else if (fontSize >= 16) purpose = 'author'
      else purpose = 'decoration'
    }
    t.purpose = purpose
    const style = lockedStyle[purpose] || fallback
    if (style.fontHint) t.fontHint = style.fontHint
    if (style.color) {
      t.color = style.color
      t.explicitColor = true
    }
  }
  return texts
}

/**
 * 图生图文字提取。两步流水线：intent → layout。
 *
 * @param {string} prompt - 用户描述（变更指令）
 * @param {string} inputImagePath - 参考图本地路径
 * @param {string} apiKey
 * @param {object} [opts]
 * @param {Array} [opts.previousTexts=[]] - 复用背景场景：上一次生成的 texts（用于锁风格）
 * @returns {Promise<{bgInfo, texts}>}
 */
export async function extractTextSpecForI2I(prompt, inputImagePath, apiKey, opts = {}) {
  const previousTexts = Array.isArray(opts.previousTexts) ? opts.previousTexts : []
  const bgInfo = await analyzeBackground(inputImagePath)
  const mainRect = normalizeMainRect(bgInfo)

  const client = createLLMClient({ apiKey })
  const baseOpts = {
    model: llmConfig.model,
    maxTokens: 4096,
    extendedThinking: true,
  }

  // ===== 步骤 1：意图分析（图生图版本） =====
  const intentRaw = await callLLM(client, {
    ...baseOpts,
    system: I2I_INTENT_SYSTEM,
    messages: [
      {
        role: 'user',
        content: `${I2I_INTENT_ANALYSIS_PROMPT}\n\n用户描述：${prompt}`,
      },
    ],
  })
  const intent = JSON.parse(cleanJSON(intentRaw))

  // ===== 步骤 2：排版设计（直接基于 inputImage 实测数据，不需 reservedAreas） =====
  const layoutMsg = [
    `${TEXTS_EXTRACTION_PROMPT}`,
    ``,
    `## 设计意图分析（图生图：基于参考图理解变更）`,
    '```json',
    JSON.stringify(intent, null, 2),
    '```',
    ``,
    `## 参考图实测数据（来自 bg-detect；layout 必须严格对齐 mainRect）`,
    '```json',
    JSON.stringify(
      {
        width: bgInfo.width,
        height: bgInfo.height,
        mainRect,
        dominantColor: bgInfo.dominantColor,
      },
      null,
      2
    ),
    '```',
    ``,
    `## 用户原始描述`,
    prompt,
  ]

  // 复用背景场景：注入上一次 texts 的 style lock（与 t2i 对齐）
  if (previousTexts.length > 0) {
    layoutMsg.push(
      ``,
      `## 上一次同背景的文字规格（复用背景场景）`,
      ``,
      `**fontHint 与 color 由段位锁定（LLM 输出后会被强制覆盖）**：`,
      '```json',
      JSON.stringify(previousTexts, null, 2),
      '```',
      ``,
      `**硬要求**：你的输出 texts 中，每段必须包含 purpose 字段（"main-title"/"subtitle"/"author"/"signature"/"decoration"）。`,
      `fontHint 与 color 会在你的输出后被强制替换为上面 texts 中对应 purpose 的值。本次任务你只需计算 size 和 position。`,
      `如果你不写 purpose 字段，fontHint 会默认按 main-title 锁定的字体渲染（通常不是你想要的）。`
    )
  }

  const textsRaw = await callLLM(client, {
    ...baseOpts,
    system: LAYOUT_SYSTEM,
    messages: [{ role: 'user', content: layoutMsg.join('\n') }],
  })
  const texts = JSON.parse(cleanJSON(textsRaw))
  // 强制 explicitColor=true（实测背景已拿到，color 是有依据的）
  for (const t of texts) {
    if (t.color) t.explicitColor = true
  }
  // 复用背景场景：覆盖 fontHint/color 为锁定值
  if (previousTexts.length > 0) {
    applyLockedStyle(texts, previousTexts)
  }

  return { bgInfo, mainRect, dominantColor: bgInfo.dominantColor, texts }
}

/**
 * 图生图文字提取的复用背景变体：查找与底图对应的 metadata，
 * 提取 previousTexts 后调用 extractTextSpecForI2I（注入 style lock）。
 *
 * 找不到 metadata 时退化为完整两步（不传 previousTexts，相当于原行为）。
 *
 * @param {string} prompt - 用户描述（变更指令）
 * @param {string} reuseAbs - 复用底图绝对路径
 * @param {string} apiKey
 * @returns {Promise<{bgInfo, texts, previousTexts: Array, source: string|null}>}
 */
export async function extractTextSpecForReuseI2I(prompt, reuseAbs, apiKey) {
  const found = findMetadataForImage(reuseAbs)
  const previousTexts = found
    ? (Array.isArray(found.meta.textOverlay?.texts) ? found.meta.textOverlay.texts : [])
    : []

  if (previousTexts.length > 0) {
    console.log(
      `   🔎 复用背景找到对应 metadata: ${previousTexts.length} 个历史文字（fontHint/color 将被锁定）`
    )
  } else if (found) {
    // 命中 self-match 但历史 metadata 没有 textOverlay.texts（如 prompt 不产文字）
    console.log(`   ℹ️ 复用背景 metadata 中无文字记录，将按 prompt 全新生成`)
  } else {
    console.log(`   ⚠️ 未找到对应 metadata，将按 prompt 全新生成`)
  }

  const result = await extractTextSpecForI2I(prompt, reuseAbs, apiKey, {
    previousTexts,
  })
  return { ...result, previousTexts, source: found ? 'lookup' : null }
}

/**
 * 图生图文字提取的外层包装：与 t2i 同款降级策略（[feedback-t2i-fallback]）。
 */
export async function safeExtractTextSpec(prompt, inputImagePath, apiKey) {
  try {
    const result = await extractTextSpecForI2I(prompt, inputImagePath, apiKey)
    if (!result.texts) result.texts = []
    return result
  } catch (err) {
    console.error(
      `⚠️ 文字提取失败: ${err.message}，禁用文字叠加（用户原始 prompt 保留所有字面符号）`
    )
    return {
      bgInfo: null,
      mainRect: null,
      dominantColor: null,
      texts: [],
    }
  }
}

/**
 * 文字叠加委托给 renderer.js（与 t2i 完全一致）。
 */
export async function renderTextOverlay(bgPath, texts, outputPath) {
  return renderTextOverlayImpl(bgPath, texts, outputPath)
}

// 未导出但保留 import 以防 lint 报 unused
export { cleanText }
