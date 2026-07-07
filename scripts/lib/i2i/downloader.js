/**
 * scripts/lib/i2i/downloader.js — 图生图的下载/元数据
 *
 * 与 t2i 共用 downloadImage / saveBase64Image，仅 filename 前缀与 metadata schema 不同。
 */

import fs from 'node:fs'
import path from 'node:path'
import {
  downloadImage,
  saveBase64Image,
} from '../t2i/downloader.js'
import { writeUniqueFile } from '../shared/output-name.js'

export { downloadImage, saveBase64Image }

export function generateFilename(timestamp, index, name = null) {
  const base = name || `i2i-${timestamp}`
  return `${base}-${String(index + 1).padStart(2, '0')}.png`
}

/**
 * 保存图生图元数据。
 *
 * 与 t2i 差异：保留 inputImage（路径/URL、mime、sha256、isUrl）、subjectType 等信息，
 * 便于后续 --rerender 重渲染或问题追溯。
 */
export function saveMetadata(outputDir, timestamp, opts, results, extra = {}, name = null) {
  const meta = {
    timestamp: new Date(timestamp).toISOString(),
    type: 'i2i',
    inputImage: extra.inputMeta
      ? {
          absPath: extra.inputMeta.absPath,
          mime: extra.inputMeta.mime,
          size: extra.inputMeta.size,
          sha256: extra.inputMeta.sha256,
          isUrl: extra.inputMeta.isUrl,
        }
      : null,
    subjectType: opts.subjectType || 'character',
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
    bgAnalysis: extra.bgInfo
      ? {
          width: extra.bgInfo.width,
          height: extra.bgInfo.height,
          mainRect: extra.bgInfo.mainRect,
          dominantColor: extra.bgInfo.dominantColor,
        }
      : null,
    results,
  }
  if (opts.textSpec && opts.textSpec.texts && opts.textSpec.texts.length > 0) {
    meta.textOverlay = {
      texts: opts.textSpec.texts,
      bgInfo: extra.bgInfo || null,
    }
  }

  // 文件名基 = name ?? `i2i-${timestamp}`
  // 与 --save-background 共享同一 finalBase（写完 metadata 后再写 bg，确保
  // backgroundPath 指向磁盘实际文件名，rerender 一定找得到）。
  const base = name || `i2i-${timestamp}`
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
