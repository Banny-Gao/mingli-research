/**
 * scripts/lib/image-gen/downloader.js — 共享图片下载/保存 + 元数据
 *
 * 抽离 t2i/i2i downloader.js 的共用部分：
 *   - downloadImage / saveBase64Image（已合并）
 *   - generateFilename(ts, idx, profile, name)  —— prefix 由 profile 注入
 *   - saveMetadata(profile, ...)  —— type / extras 由 profile 注入
 */

import fs from 'node:fs'
import path from 'node:path'
import { writeUniqueFile } from '../shared/output-name.js'

/**
 * 下载图片，支持进度回调。
 *
 * @param {string} url
 * @param {string} filepath
 * @param {{ onProgress?: (p: {received: number, total: number, percent: number}) => void, timeout?: number }} opts
 * @returns {Promise<number>} 文件大小（字节）
 */
export async function downloadImage(url, filepath, opts = {}) {
  const { onProgress, timeout = 60000 } = opts
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(url, { signal: controller.signal })
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
        onProgress({
          received,
          total: contentLength,
          percent: Math.round((received / contentLength) * 100),
        })
      }
    }

    const buffer = Buffer.concat(chunks)
    fs.writeFileSync(filepath, buffer)
    return buffer.length
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`下载超时 (${timeout / 1000}s): ${url}`)
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
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
 * 生成统一文件名。prefix 由 profile.filenamePrefix 决定（t2i / i2i）。
 */
export function generateFilename(profile, timestamp, index, name = null) {
  const base = name || `${profile.filenamePrefix}-${timestamp}`
  return `${base}-${String(index + 1).padStart(2, '0')}.png`
}

/**
 * 保存元数据 JSON 文件。
 *
 * profile.buildMetadataExtras(opts, extra) 返回 mode 专属字段（inputImage / bgAnalysis）。
 * textOverlay 流水线全过程证据统一保存，供 --rerender / --reuse-background 使用。
 *
 * @param {object} profile
 * @param {string} outputDir
 * @param {number} timestamp
 * @param {object} opts - 含 textSpec / apiPrompt / promptOptimizerEffective 等扩展字段
 * @param {Array} results
 * @param {object} [extra]
 * @param {string|null} [name]
 * @returns {{ filepath: string, finalBase: string }}
 */
export function saveMetadata(profile, outputDir, timestamp, opts, results, extra = {}, name = null) {
  const textSpec = opts.textSpec
  const meta = {
    timestamp: new Date(timestamp).toISOString(),
    type: profile.metadataType,
    ...profile.buildMetadataExtras(opts, extra),
    prompt: opts.prompt,
    apiPrompt: opts.apiPrompt || opts.prompt,
    model: opts.model || profile.defaultModel,
    aspectRatio: opts.aspectRatio || null,
    width: opts.width || null,
    height: opts.height || null,
    style: opts.style
      ? { style_type: opts.style, style_weight: opts.styleWeight ?? 0.8 }
      : null,
    n: opts.n || 1,
    seed: opts.seed ?? null,
    promptOptimizer: opts.promptOptimizer || false,
    promptOptimizerEffective: opts.promptOptimizerEffective ?? opts.promptOptimizer ?? false,
    aigcWatermark: opts.aigcWatermark || false,
    responseFormat: opts.responseFormat || 'url',
    name: name || null,
    results,
  }

  // 文字叠加流水线全过程证据
  if (textSpec) {
    meta.textOverlay = {
      intent: textSpec.intent || null,
      cleanPrompt: textSpec.cleanPrompt ?? null,
      reservedAreas: textSpec.reservedAreas || [],
      texts: textSpec.texts || [],
      bgInfo: textSpec.bgInfo
        ? {
            width: textSpec.bgInfo.width,
            height: textSpec.bgInfo.height,
            mainRect: textSpec.bgInfo.mainRect || null,
            dominantColor: textSpec.bgInfo.dominantColor || null,
          }
        : null,
      llmCalls: textSpec.llmCalls || [],
    }
  }

  const base = name || `${profile.filenamePrefix}-${timestamp}`
  const { filepath, finalBase } = writeUniqueFile(
    outputDir, base, '-metadata.json',
    JSON.stringify(meta, null, 2)
  )
  return { filepath, finalBase }
}
