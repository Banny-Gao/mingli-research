/**
 * scripts/lib/t2i/downloader.js — 图片下载/保存 + 进度回调 + 元数据
 */

import fs from 'node:fs'
import path from 'node:path'
import { writeUniqueFile } from '../shared/output-name.js'

/**
 * 生成统一文件名。
 */
export function generateFilename(timestamp, index, name = null) {
  const base = name || `t2i-${timestamp}`
  return `${base}-${String(index + 1).padStart(2, '0')}.png`
}

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
 * 保存元数据 JSON 文件。
 *
 * @param {string} outputDir
 * @param {number} timestamp
 * @param {object} opts - 原始请求参数
 * @param {Array<{filename: string, size: number, url?: string}>} results
 */
export function saveMetadata(outputDir, timestamp, opts, results, name = null) {
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
    name: name || null,
    results,
  }
  // 保留文字提取结果（cleanPrompt + reservedAreas + texts）
  if (opts.textSpec) {
    meta.textOverlay = {
      cleanPrompt: opts.textSpec.cleanPrompt,
      reservedAreas: opts.textSpec.reservedAreas || [],
      texts: opts.textSpec.texts,
    }
  }

  // 文件名基 = name ?? `t2i-${timestamp}`
  // 与 --save-background 共享同一 finalBase（写完 metadata 后再写 bg，确保
  // backgroundPath 指向磁盘实际文件名，rerender 一定找得到）。
  const base = name || `t2i-${timestamp}`
  // 用 writeUniqueFile 防止批量模式下并发 worker 写同一 metadata.json 时互相覆盖
  // （当 --name 在多个 prompt 间重复时，resolveBatchNames 解析出的基名相同）。
  // 返回 { filepath, finalBase }，调用方可基于 finalBase 写同名 bg。
  const { filepath, finalBase } = writeUniqueFile(
    outputDir,
    base,
    '-metadata.json',
    JSON.stringify(meta, null, 2)
  )

  return { filepath, finalBase }
}
