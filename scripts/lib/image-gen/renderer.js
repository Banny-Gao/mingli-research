/**
 * scripts/lib/t2i/renderer.js — Canvas 文字渲染 + 颜色对比度自动调整
 *
 * 职责：
 * 1. resolvePosition — 位置描述 → 像素坐标
 * 2. sampleBackgroundColor — 用 sharp 在文字锚点采 9 像素均值
 * 3. ensureContrast — WCAG AA 检查，< 4.5:1 自动加 stroke 或反色
 * 4. drawText / drawChar — 实际绘制（接受 verticalDirection 字段但不生效，单列 rtl/ltr 视觉等价）
 * 5. renderTextOverlay — 入口：读背景 → 校色 → 绘制 → 导出 PNG
 */

import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { matchFont } from '../shared/font-matcher.js'

const require = createRequire(import.meta.url)
const sharp = require('sharp')
const { createCanvas, registerFont } = require('canvas')

// ===== 字体注册（模块级缓存） =====
// matchFont 返回 { path, family }。family 必须是 OTF/TTF 内部 name 表里的家族名
// （canvas 用它来查找已注册字体）。不要用 path.basename —— 文件名带下划线时
// （如 MFLingLong_Noncommercial-Regular.otf）与 OTF 内部 family 名不一致。

const _registeredFonts = new Set()
const _warnedFontFailures = new Set()

function ensureFont(fontPath, family) {
  if (!fontPath || !family) return
  const key = `${fontPath}|${family}`
  if (_registeredFonts.has(key)) return
  try {
    registerFont(fontPath, { family })
    _registeredFonts.add(key)
  } catch {
    // 字体注册失败（同步路径），后续使用 fallback
    if (!_warnedFontFailures.has(key)) {
      _warnedFontFailures.add(key)
      console.warn(`⚠️ 字体注册失败: ${family} (${fontPath})，将使用 fallback`)
    }
  }
}

function getFontFamily(font) {
  if (!font) return 'sans-serif'
  ensureFont(font.path, font.family)
  return font.family
}

// ===== 位置解析 =====

/**
 * 解析位置描述为像素坐标。
 */
function resolvePosition(pos, canvasWidth, canvasHeight, fontSize, textWidth) {
  let x, y

  // X 坐标
  if (pos?.x === 'center') x = canvasWidth / 2
  else if (pos?.x === 'left') x = fontSize
  else if (pos?.x === 'right') x = canvasWidth - fontSize
  else if (typeof pos?.x === 'string' && pos.x.endsWith('%'))
    x = (canvasWidth * parseFloat(pos.x)) / 100
  else if (typeof pos?.x === 'number') x = pos.x
  else x = canvasWidth / 2

  // Y 坐标
  if (typeof pos?.y === 'string' && pos.y.endsWith('%'))
    y = (canvasHeight * parseFloat(pos.y)) / 100
  else if (typeof pos?.y === 'number') y = pos.y
  else if (pos?.y === 'center') y = canvasHeight / 2
  else y = canvasHeight / 2

  return { x, y }
}

// ===== 颜色工具 =====

/** hex → [r, g, b] */
function hexToRgb(hex) {
  const m = hex.replace('#', '').match(/^([0-9a-f]{6})$/i)
  if (!m) return [0, 0, 0]
  return [
    parseInt(m[1].slice(0, 2), 16),
    parseInt(m[1].slice(2, 4), 16),
    parseInt(m[1].slice(4, 6), 16),
  ]
}

/** 相对亮度（WCAG 2.0） */
function relativeLuminance([r, g, b]) {
  const channel = c => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/** WCAG 对比度（1.0 ~ 21.0） */
function contrastRatio(rgb1, rgb2) {
  const l1 = relativeLuminance(rgb1)
  const l2 = relativeLuminance(rgb2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/** 决定 stroke 颜色：文字亮则用暗 stroke，文字暗则用亮 stroke */
function pickStrokeColor(textRgb) {
  const lum = relativeLuminance(textRgb)
  return lum > 0.5 ? '#000000' : '#FFFFFF'
}

// ===== 背景采样 =====

/**
 * 用 sharp 在文字锚点周围采 9 像素（3x3）平均值。
 * textPos 是 LLM 给的 (x, y)；boxSize 是采样半径（默认 fontSize 的一半）。
 * 返回 [r, g, b] 平均值。
 */
async function sampleBackgroundColor(bgBuffer, textPos, boxSize) {
  const meta = await sharp(bgBuffer).metadata()
  const { width, height } = meta
  const half = Math.max(4, Math.floor(boxSize / 2))

  const x = Math.max(0, Math.min(width - 1, Math.floor(textPos.x)) - half)
  const y = Math.max(0, Math.min(height - 1, Math.floor(textPos.y)) - half)
  const w = Math.min(half * 2, width - x)
  const h = Math.min(half * 2, height - y)

  if (w <= 0 || h <= 0) return [255, 255, 255]

  const { data } = await sharp(bgBuffer)
    .extract({ left: x, top: y, width: w, height: h })
    .raw()
    .toBuffer({ resolveWithObject: true })

  const channels = meta.channels || 3
  let r = 0,
    g = 0,
    b = 0,
    n = 0
  for (let i = 0; i < data.length; i += channels) {
    r += data[i]
    g += data[i + 1]
    b += data[i + 2]
    n++
  }
  return n ? [Math.round(r / n), Math.round(g / n), Math.round(b / n)] : [255, 255, 255]
}

// ===== 对比度调整 =====

const WCAG_AA = 4.5

/**
 * 对单段文字做对比度检查和调整：
 * 1. 采样背景色（仅一次，sharp 提取 ROI 区域）
 * 2. 算对比度，< 4.5:1 时尝试：
 *    a. 加 stroke（用文字反色）— 总是安全的（不改变 color）
 *    b. 反转文字色（黑↔白）后重测 — 仅在 spec.explicitColor !== true 时执行
 * 3. 不展示结果给用户（[feedback-t2i-no-ui-feedback]）
 *
 * 尊重显式 color：当 LLM 输出 explicitColor=true，表示 color 是有意指定的
 * （即使低对比度，可能是艺术效果），此时只加 stroke，不反转 color。
 *
 * 返回调整后的 textSpec（不动原对象，返回新对象）。
 */
async function ensureContrast(bgBuffer, spec, textPos, fontSize) {
  const bgRgb = await sampleBackgroundColor(bgBuffer, textPos, fontSize)
  const textRgb = hexToRgb(spec.color || '#FFFFFF')

  let ratio = contrastRatio(textRgb, bgRgb)
  let newColor = spec.color
  let stroke = spec.stroke || null
  const respectColor = spec.explicitColor === true

  if (ratio < WCAG_AA && !respectColor) {
    // 尝试反转（仅在 color 非显式时）
    const inverted = relativeLuminance(textRgb) > 0.5 ? '#000000' : '#FFFFFF'
    const invRatio = contrastRatio(hexToRgb(inverted), bgRgb)
    if (invRatio > ratio) {
      newColor = inverted
      ratio = invRatio
    }
  }

  if (ratio < WCAG_AA) {
    // 仍不达标 → 加 stroke（不管是否显式，加 stroke 不改 color 是安全的）
    stroke = {
      color: pickStrokeColor(hexToRgb(newColor)),
      width: Math.max(2, Math.round(fontSize * 0.06)),
    }
  }

  if (newColor !== spec.color || stroke !== (spec.stroke || null)) {
    return { ...spec, color: newColor, stroke }
  }
  return spec
}

// ===== 绘制 =====

function drawChar(ctx, text, x, y, color, stroke, fontSize) {
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  if (stroke && stroke.color && stroke.width) {
    ctx.strokeStyle = stroke.color
    ctx.lineWidth = stroke.width
    ctx.fillStyle = color
    ctx.fillText(text, x, y)
    ctx.strokeText(text, x, y)
  } else {
    ctx.fillStyle = color
    ctx.fillText(text, x, y)
  }
}

/**
 * 在 canvas 上绘制一段文字。
 * 注意：verticalDirection 字段当前被接受但不生效 — 单列竖排 rtl/ltr 视觉等价（都是
 * 从顶到底）。多列竖排由 LLM 通过 position 显式指定每列坐标，不依赖此字段。
 */
async function drawText(ctx, bgBuffer, textSpec, canvasWidth, canvasHeight) {
  const { content, size = 36, color = '#FFFFFF', layout = 'horizontal', stroke = null } = textSpec

  const font = matchFont(textSpec.fontHint)
  const fontFamily = getFontFamily(font)
  const fontStr = `${size}px "${fontFamily}", sans-serif`
  ctx.font = fontStr

  const chars = [...content]

  if (layout === 'vertical') {
    const charMetrics = chars.map(c => ctx.measureText(c))
    const maxCharWidth = Math.max(...charMetrics.map(m => m.width))
    const totalHeight = chars.length * size * 1.2
    const { x, y } = resolvePosition(
      textSpec.position,
      canvasWidth,
      canvasHeight,
      size,
      maxCharWidth
    )

    // 对比度调整（基于锚点中心）
    const adjusted = await ensureContrast(bgBuffer, textSpec, { x, y }, size)
    const finalColor = adjusted.color
    const finalStroke = adjusted.stroke
    ctx.font = `${size}px "${getFontFamily(matchFont(adjusted.fontHint))}", sans-serif`

    const startY = y - totalHeight / 2 + size / 2

    chars.forEach((char, i) => {
      const charY = startY + i * size * 1.2
      drawChar(ctx, char, x, charY, finalColor, finalStroke, size)
    })
  } else {
    const totalWidth = ctx.measureText(content).width
    const { x, y } = resolvePosition(textSpec.position, canvasWidth, canvasHeight, size, totalWidth)

    const adjusted = await ensureContrast(bgBuffer, textSpec, { x, y }, size)
    const finalColor = adjusted.color
    const finalStroke = adjusted.stroke
    ctx.font = `${size}px "${getFontFamily(matchFont(adjusted.fontHint))}", sans-serif`

    drawChar(ctx, content, x, y, finalColor, finalStroke, size)
  }
}

// ===== 入口 =====

/**
 * 将文字叠加到背景图上。
 *
 * @param {string} bgPath - 背景图片路径
 * @param {Array} texts - 文字规格数组（接受但忽略 verticalDirection 字段，单列竖排下 rtl/ltr 视觉等价）
 * @param {string} outputPath - 输出图片路径
 */
export async function renderTextOverlay(bgPath, texts, outputPath) {
  if (!texts || texts.length === 0) {
    fs.copyFileSync(bgPath, outputPath)
    return
  }

  // 用 sharp 读取背景图元数据和 buffer
  const metadata = await sharp(bgPath).metadata()
  const bgBuffer = await sharp(bgPath).png().toBuffer()

  const { width, height } = metadata

  // 防重叠后处理：LLM 偶尔会把多段文字 bbox 叠在一起（尤其竖排长标题 + 横排副标题），
  // 这里做最后一道防线——按字号从大到小放置，已放置的占框，新文字若重叠则向下/向右推开。
  // 仅在 texts.length > 1 时启用（单段文字无重叠可能）。
  if (texts.length > 1) {
    resolveTextOverlaps(texts, width, height)
  }

  // 创建 canvas 并绘制背景
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  // 加载背景图
  const { Image } = require('canvas')
  const bgImage = new Image()
  bgImage.src = bgBuffer

  ctx.drawImage(bgImage, 0, 0, width, height)

  // 逐段绘制文字（每段内部已 await ensureContrast）
  for (const textSpec of texts) {
    await drawText(ctx, bgBuffer, textSpec, width, height)
  }

  // 导出为 PNG buffer，再写入文件
  const outputBuffer = canvas.toBuffer('image/png')
  fs.writeFileSync(outputPath, outputBuffer)
}

// ===== 防重叠后处理 =====

/**
 * 估算一段文字的渲染 bbox（基于 position 是中心锚点）。
 * 返回 { cx, cy, halfW, halfH }，方便后续做矩形相交的简单比较。
 */
function estimateTextBBox(textSpec, canvasWidth, canvasHeight) {
  const { content, size = 36, layout = 'horizontal', position } = textSpec
  const chars = [...content]
  const font = matchFont(textSpec.fontHint)
  const fontFamily = getFontFamily(font)

  // 用临时 ctx 测宽（避免污染主 ctx 的字体设置）
  const { createCanvas } = require('canvas')
  const tmpCanvas = createCanvas(1, 1)
  const tmpCtx = tmpCanvas.getContext('2d')
  tmpCtx.font = `${size}px "${fontFamily}", sans-serif`

  let halfW, halfH
  if (layout === 'vertical') {
    const charMetrics = chars.map(c => tmpCtx.measureText(c))
    const maxCharWidth = Math.max(...charMetrics.map(m => m.width), size * 0.6)
    halfW = maxCharWidth / 2
    halfH = (chars.length * size * 1.2) / 2
  } else {
    const totalWidth = tmpCtx.measureText(content).width || content.length * size * 0.9
    halfW = totalWidth / 2
    halfH = (size * 1.2) / 2
  }

  const { x: cx, y: cy } = resolvePosition(position, canvasWidth, canvasHeight, size, halfW * 2)
  return { cx, cy, halfW, halfH }
}

/** 矩形相交检测（AABB） */
function boxesOverlap(a, b) {
  return !(
    a.cx + a.halfW <= b.cx - b.halfW ||
    a.cx - a.halfW >= b.cx + b.halfW ||
    a.cy + a.halfH <= b.cy - b.halfH ||
    a.cy - a.halfH >= b.cy + b.halfH
  )
}

/**
 * 把 texts 中相互重叠的文字 bbox 错开（贪心：大字号优先定位，小字号后挪）。
 * 策略：sort by area desc；按下推（优先）和右推两种方向尝试，直到不重叠；
 * 推到画布边界仍重叠 → 缩小字号（按 0.92 系数递减，最多 5 次）。
 *
 * 会修改 textSpec.position.y / .x / .size（直接 mutate 外部 texts 数组）。
 */
function resolveTextOverlaps(texts, canvasWidth, canvasHeight) {
  // 1. 给每段计算当前 bbox
  const bboxes = texts.map(t => ({ spec: t, bbox: estimateTextBBox(t, canvasWidth, canvasHeight) }))

  // 2. 按 bbox 面积降序：大字先占位（字大字多，typography 上也更重要）
  bboxes.sort((a, b) => b.bbox.halfW * b.bbox.halfH - a.bbox.halfW * a.bbox.halfH)

  const placed = []

  for (const item of bboxes) {
    let { spec, bbox } = item
    let attempts = 0
    const MAX_POS_ATTEMPTS = 12

    // 若与已放置文字的 bbox 相交 → 优先下推，再次推右，缩小兜底
    while (placed.some(p => boxesOverlap(bbox, p.bbox)) && attempts < MAX_POS_ATTEMPTS) {
      const conflict = placed.find(p => boxesOverlap(bbox, p.bbox))
      // 2a. 下推：把当前 bbox 推到冲突 bbox 下方 + 0.4×小字号的安全间距
      const gap = Math.min(bbox.halfH, conflict.bbox.halfH) * 0.4
      const targetCy = conflict.bbox.cy + conflict.bbox.halfH + bbox.halfH + gap
      if (targetCy + bbox.halfH <= canvasHeight - 8) {
        bbox.cy = targetCy
        // 把 position.y 同步为百分比
        spec.position = {
          ...(spec.position || {}),
          y: `${Math.round((targetCy / canvasHeight) * 1000) / 10}%`,
        }
      } else {
        // 2b. 下推会出界 → 右推
        const targetCx = bbox.cx + conflict.bbox.halfW + bbox.halfW + gap
        if (targetCx + bbox.halfW <= canvasWidth - 8) {
          bbox.cx = targetCx
          spec.position = {
            ...(spec.position || {}),
            x: `${Math.round((targetCx / canvasWidth) * 1000) / 10}%`,
          }
        } else {
          break // 推到边界都还叠，留给字号缩小兜底
        }
      }
      attempts++
    }

    // 3. 还叠 → 缩小字号（按 0.92 系数递减，最多 5 次；下限原值 × 0.6）
    let shrinkRounds = 0
    const originalSize = spec.size || 36
    const minSize = Math.max(12, originalSize * 0.6)
    while (placed.some(p => boxesOverlap(bbox, p.bbox)) && shrinkRounds < 5) {
      const newSize = Math.max(minSize, (spec.size || 36) * 0.92)
      if (newSize === spec.size) break
      spec.size = Math.round(newSize)
      bbox = estimateTextBBox(spec, canvasWidth, canvasHeight)
      shrinkRounds++
    }

    placed.push({ spec, bbox })
  }
}
