/**
 * scripts/lib/t2i/downloader.js — 图片下载/保存 + 进度回调 + 元数据
 */

import fs from 'node:fs'
import path from 'node:path'

/**
 * 生成统一文件名。
 */
export function generateFilename(timestamp, index) {
  return `t2i-${timestamp}-${String(index + 1).padStart(2, '0')}.png`
}

/**
 * 下载图片，支持进度回调。
 *
 * @param {string} url
 * @param {string} filepath
 * @param {{ onProgress?: (p: {received: number, total: number, percent: number}) => void }} opts
 * @returns {Promise<number>} 文件大小（字节）
 */
export async function downloadImage(url, filepath, opts = {}) {
  const { onProgress } = opts
  const res = await fetch(url)
  if (!res.ok) throw new Error(`下载失败: ${res.status} ${res.statusText}`)

  const contentLength = Number(res.headers.get('content-length')) || 0
  const reader = res.body.getReader()
  const chunks = []
  let received = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    received += value.length
    if (onProgress && contentLength > 0) {
      onProgress({ received, total: contentLength, percent: Math.round((received / contentLength) * 100) })
    }
  }

  const buffer = Buffer.concat(chunks)
  fs.writeFileSync(filepath, buffer)
  return buffer.length
}

/**
 * 解码并保存 base64 图片。
 */
export function saveBase64Image(base64Str, filepath) {
  const match = base64Str.match(/^(?:data:image\/\w+;base64,)?(.+)$/)
  if (!match) throw new Error(`无效的 base64 字符串`)
  const buffer = Buffer.from(match[1], 'base64')
  fs.writeFileSync(filepath, buffer)
  return buffer.length
}

/**
 * 保存元数据 JSON 文件。
 *
 * @param {string} outputDir
 * @param {number} timestamp
 * @param {object} opts - 原始请求参数
 * @param {Array<{filename: string, size: number, url?: string}>} results
 */
export function saveMetadata(outputDir, timestamp, opts, results) {
  const meta = {
    timestamp: new Date(timestamp).toISOString(),
    prompt: opts.prompt,
    model: opts.model || 'image-01',
    aspectRatio: opts.aspectRatio || null,
    width: opts.width || null,
    height: opts.height || null,
    style: opts.style || null,
    styleWeight: opts.styleWeight ?? null,
    n: opts.n || 1,
    seed: opts.seed ?? null,
    promptOptimizer: opts.promptOptimizer || false,
    aigcWatermark: opts.aigcWatermark || false,
    responseFormat: opts.responseFormat || 'url',
    results,
  }
  // 保留文字提取结果（cleanPrompt + texts）
  if (opts.textSpec) {
    meta.textOverlay = {
      cleanPrompt: opts.textSpec.cleanPrompt,
      texts: opts.textSpec.texts,
    }
  }
  // 保存背景路径，方便后续 --rerender
  if (opts.saveBackground) {
    meta.backgroundPath = `t2i-${timestamp}-bg.png`
  }
  const filepath = path.join(outputDir, `t2i-${timestamp}-metadata.json`)
  fs.writeFileSync(filepath, JSON.stringify(meta, null, 2), 'utf-8')
  return filepath
}
