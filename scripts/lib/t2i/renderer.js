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
import { matchFont } from './fonts.js'

const require = createRequire(import.meta.url)
const sharp = require('sharp')
const { createCanvas, registerFont } = require('canvas')

// ===== 字体注册（模块级缓存） =====
// matchFont 返回 { path, family }。family 必须是 OTF/TTF 内部 name 表里的家族名
// （canvas 用它来查找已注册字体）。不要用 path.basename —— 文件名带下划线时
// （如 MFLingLong_Noncommercial-Regular.otf）与 OTF 内部 family 名不一致。

const _registeredFonts = new Set()

function ensureFont(fontPath, family) {
  if (!fontPath || !family) return
  const key = `${fontPath}|${family}`
  if (_registeredFonts.has(key)) return
  try {
    registerFont(fontPath, { family })
    _registeredFonts.add(key)
  } catch {
    // 字体注册失败（同步路径），后续使用 fallback
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
