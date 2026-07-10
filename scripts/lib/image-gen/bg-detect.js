/**
 * scripts/lib/t2i/bg-detect.js — 背景图分析
 *
 * 用 sharp 从背景 buffer 中提取：
 *   1. 主矩形留白区域（bbox）— 给 layout LLM 对齐文字位置/字号
 *   2. 主色调 — 给文字色对比参考
 *
 * 检测算法（"最亮连续矩形连通区域"）：
 *   - 浅色判定：R > 200 && G > 180 && B > 140 && R >= B（米白偏暖，覆盖古纸/素笺）
 *   - 列扫描：找"≥20% 行是浅色"的连续列段 → 取最宽段作为矩形水平范围
 *   - 行扫描（在列范围内）：找"≥50% 列是浅色"的连续行段 → 取最长段作为矩形垂直范围
 *   - 兜底：未检测到 → 返回 { x: 'center', y: 'center', w: '60%', h: '50%' }
 */

import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const sharp = require('sharp')

/**
 * 判断像素是否为浅色（米白偏暖）。
 */
function isLightPixel(r, g, b) {
  return r > 200 && g > 180 && b > 140 && r >= b
}

/**
 * 找列方向最长连续浅色段。
 */
function findLongestXRun(rowCounts, threshold) {
  let best = null
  let inRun = false
  let start = 0
  for (let x = 0; x < rowCounts.length; x++) {
    if (rowCounts[x] >= threshold) {
      if (!inRun) {
        inRun = true
        start = x
      }
    } else {
      if (inRun) {
        const len = x - 1 - start
        if (!best || len > best.len) best = { start, end: x - 1, len }
        inRun = false
      }
    }
  }
  if (inRun) {
    const len = rowCounts.length - 1 - start
    if (!best || len > best.len) best = { start, end: rowCounts.length - 1, len }
  }
  return best
}

/**
 * 找行方向最长连续浅色段（限定在 [xStart, xEnd] 列范围内）。
 */
function findLongestYRun(data, width, height, channels, xStart, xEnd, threshold) {
  let best = null
  let inRun = false
  let start = 0
  for (let y = 0; y < height; y++) {
    let count = 0
    for (let x = xStart; x <= xEnd; x++) {
      const i = (y * width + x) * channels
      if (isLightPixel(data[i], data[i + 1], data[i + 2])) count++
    }
    if (count >= threshold) {
      if (!inRun) {
        inRun = true
        start = y
      }
    } else {
      if (inRun) {
        const len = y - 1 - start
        if (!best || len > best.len) best = { start, end: y - 1, len }
        inRun = false
      }
    }
  }
  if (inRun) {
    const len = height - 1 - start
    if (!best || len > best.len) best = { start, end: height - 1, len }
  }
  return best
}

/**
 * 检测主矩形留白区域（米白/素笺色）。
 *
 * @param {Buffer} bgBuffer - 背景图 PNG buffer（来自 sharp）
 * @returns {Promise<{x:number,y:number,w:number,h:number}>} 像素坐标
 */
export async function detectMainRect(bgBuffer) {
  const { data, info } = await sharp(bgBuffer).raw().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info

  // 列扫描：统计每列的浅色像素数
  const colCount = new Array(width).fill(0)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels
      if (isLightPixel(data[i], data[i + 1], data[i + 2])) colCount[x]++
    }
  }

  const colThreshold = Math.floor(height * 0.2)
  const xRun = findLongestXRun(colCount, colThreshold)
  if (!xRun) return null

  // 行扫描（在 xRun 范围内）
  const rowThreshold = Math.floor((xRun.end - xRun.start + 1) * 0.5)
  const yRun = findLongestYRun(data, width, height, channels, xRun.start, xRun.end, rowThreshold)
  if (!yRun) return null

  return {
    x: xRun.start,
    y: yRun.start,
    w: xRun.end - xRun.start + 1,
    h: yRun.end - yRun.start + 1,
  }
}

/**
 * 检测主色调（中央区域 50%×50% 的平均色），用于文字色对比参考。
 *
 * @param {Buffer} bgBuffer
 * @returns {Promise<{r:number,g:number,b:number,hex:string}>}
 */
export async function detectDominantColor(bgBuffer) {
  const { data, info } = await sharp(bgBuffer).raw().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info
  const x0 = Math.floor(width * 0.25)
  const x1 = Math.floor(width * 0.75)
  const y0 = Math.floor(height * 0.25)
  const y1 = Math.floor(height * 0.75)
  let r = 0,
    g = 0,
    b = 0,
    n = 0
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * width + x) * channels
      r += data[i]
      g += data[i + 1]
      b += data[i + 2]
      n++
    }
  }
  if (!n) return { r: 255, g: 255, b: 255, hex: '#FFFFFF' }
  const avgR = Math.round(r / n)
  const avgG = Math.round(g / n)
  const avgB = Math.round(b / n)
  const hex =
    '#' +
    [avgR, avgG, avgB]
      .map(v => v.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  return { r: avgR, g: avgG, b: avgB, hex }
}

/**
 * 把像素 bbox 转为百分比 + 中心点。
 *
 * @param {{x:number,y:number,w:number,h:number}} rectPx
 * @param {number} imgWidth
 * @param {number} imgHeight
 * @returns {{x:string,y:string,w:string,h:string,cx:number,cy:number}}
 */
export function rectToPercent(rectPx, imgWidth, imgHeight) {
  const x = ((rectPx.x / imgWidth) * 100).toFixed(1) + '%'
  const y = ((rectPx.y / imgHeight) * 100).toFixed(1) + '%'
  const w = ((rectPx.w / imgWidth) * 100).toFixed(1) + '%'
  const h = ((rectPx.h / imgHeight) * 100).toFixed(1) + '%'
  return {
    x,
    y,
    w,
    h,
    cx: Math.round(rectPx.x + rectPx.w / 2),
    cy: Math.round(rectPx.y + rectPx.h / 2),
  }
}

/**
 * 综合分析背景，返回完整布局数据。
 *
 * @param {string|Buffer} bgInput - 背景图路径或 buffer
 * @returns {Promise<{
 *   width:number, height:number,
 *   mainRect:{x:string,y:string,w:string,h:string,cx:number,cy:number}|null,
 *   dominantColor:{r:number,g:number,b:number,hex:string}
 * }>}
 */
export async function analyzeBackground(bgInput) {
  const fs = require('node:fs')
  const buffer = Buffer.isBuffer(bgInput) ? bgInput : fs.readFileSync(bgInput)
  const rectPx = await detectMainRect(buffer)
  const dominantColor = await detectDominantColor(buffer)

  // 从 sharp metadata 取尺寸（轻量，仅读 header）
  const meta = await sharp(buffer).metadata()
  const width = meta.width
  const height = meta.height

  return {
    width,
    height,
    mainRect: rectPx ? rectToPercent(rectPx, width, height) : null,
    dominantColor,
  }
}
