/**
 * scripts/lib/i2i/text-overlay.js — 图生图的文字提取与叠加（二步流水线）
 *
 * 图生图与文生图差异：
 *   - **跳过 clean 步骤**（背景创作）—— 输入图本身就是背景，无需服务再生成。
 *   - **实测数据自动注入** — 跑 bg-detect 分析输入图，把 mainRect + dominantColor
 *     作为"实测背景数据"喂给 layout LLM（这是 t2i TODO 部分的 i2i 端实现）。
 *   - **fake reservedAreas** —— 当输入图无明显主矩形时，用 0,0,100%,100% 兜底，让 layout
 *     至少拿到一致字段。
 *
 * 两步流水线：
 *   步骤 1 — 意图分析（用 i2i 版本 prompt）
 *   步骤 2 — 排版设计（layout LLM 注入实测 mainRect + dominantColor）
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
 * 图生图文字提取。两步流水线：intent → layout。
 *
 * @param {string} prompt - 用户描述（变更指令）
 * @param {string} inputImagePath - 参考图本地路径
 * @param {string} apiKey
 * @returns {Promise<{bgInfo, texts}>}
 */
export async function extractTextSpecForI2I(prompt, inputImagePath, apiKey) {
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
  ].join('\n')

  const textsRaw = await callLLM(client, {
    ...baseOpts,
    system: LAYOUT_SYSTEM,
    messages: [{ role: 'user', content: layoutMsg }],
  })
  const texts = JSON.parse(cleanJSON(textsRaw))
  // 强制 explicitColor=true（实测背景已拿到，color 是有依据的）
  for (const t of texts) {
    if (t.color) t.explicitColor = true
  }

  return { bgInfo, mainRect, dominantColor: bgInfo.dominantColor, texts }
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
