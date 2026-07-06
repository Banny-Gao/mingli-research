/**
 * scripts/lib/shared/find-metadata.js — 按图片文件名/路径反查 metadata
 *
 * 用法：在 --reuse-background 场景下，找到与"复用底图"匹配的最近一条 metadata，
 * 注入 previousFontHints / previousTexts 给 layout LLM，延续上一次的文字风格。
 *
 * 匹配策略（多字段 OR，按优先级）：
 *   1. metadata.backgroundPath（t2i/i2i 的 --save-background 产物 basename）
 *   2. metadata.inputImage.absPath（图生图：输入图）
 *   3. metadata.results[0].filename（生成图自身）
 *
 * 目录：默认扫描 public/images/（与生成图同目录），可通过 dir 参数覆盖。
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.join(__dirname, '..', '..', '..')
const DEFAULT_DIR = path.join(PROJECT_ROOT, 'public', 'images')

/**
 * 列出 dir 下所有候选 metadata 文件（按 mtime desc）。
 *
 * 兼容两种历史命名：
 *   - `*-metadata.json`（i2i 流程，如 `i2i-1783321877083-metadata.json`）
 *   - `<title>.json` （t2i 流程，如 `八字提要.json`，与生成图同名）
 *
 * 仅以文件后缀过滤会产生大量误命中（如 `package.json`），所以再叠加
 * "JSON 顶层含 metadata 特征字段"的内容判断。
 */
function listMetadataFiles(dir) {
  if (!fs.existsSync(dir)) return []
  const out = []
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith('.json')) continue
    if (name === 'package.json' || name === 'tsconfig.json') continue
    const abs = path.join(dir, name)
    let stat
    try {
      stat = fs.statSync(abs)
      if (!stat.isFile()) continue
    } catch {
      continue
    }
    if (!looksLikeMetadata(abs)) continue
    out.push({ abs, mtimeMs: stat.mtimeMs })
  }
  out.sort((a, b) => b.mtimeMs - a.mtimeMs)
  return out
}

/**
 * 快速判断 JSON 文件是否"长得像" metadata：顶层存在至少一个 metadata 特征字段。
 * 失败/解析错误一律返回 false（由上层 try/catch 兜底）。
 */
function looksLikeMetadata(absPath) {
  let raw
  try {
    raw = fs.readFileSync(absPath, 'utf-8')
  } catch {
    return false
  }
  let obj
  try {
    obj = JSON.parse(raw)
  } catch {
    return false
  }
  if (!obj || typeof obj !== 'object') return false
  return (
    typeof obj.backgroundPath === 'string' ||
    typeof obj.inputImage === 'object' ||
    Array.isArray(obj.results)
  )
}

/**
 * 判断 metadata 是否"对应" reusedImagePath。
 *
 * 匹配规则（任一命中即返回 true）：
 *   - meta.backgroundPath 的 basename === reused 的 basename
 *   - meta.inputImage.absPath 的 basename === reused 的 basename
 *   - meta.results[0].filename === reused 的 basename
 *
 * 注意：仅比对 basename，避免用户将历史图片移到子目录后绝对路径失配。
 */
function metadataMatchesImage(meta, reusedImagePath) {
  const reusedBase = path.basename(reusedImagePath)
  if (!reusedBase) return false
  if (meta.backgroundPath && path.basename(meta.backgroundPath) === reusedBase) return true
  if (meta.inputImage?.absPath && path.basename(meta.inputImage.absPath) === reusedBase) return true
  if (meta.results?.[0]?.filename === reusedBase) return true
  return false
}

/**
 * 在 dir 中查找与 reusedImagePath 关联的最新 metadata（mtime desc）。
 *
 * 包含 self-match：i2i 复用 run 自己也会写 metadata 并把 reuseAbs 写进
 * inputImage.absPath。当用户对同一张图连续复用多次时，self-match 那条就是
 * 用户"上一次成功生成的样式"，是 previousTexts 的最佳来源。
 *
 * @param {string} reusedImagePath - 复用的底图绝对路径
 * @param {object} [opts]
 * @param {string} [opts.dir] - 扫描目录，默认 public/images/
 * @returns {object|null} 解析后的 metadata；找不到返回 null
 */
export function findMetadataForImage(reusedImagePath, opts = {}) {
  if (!reusedImagePath) return null
  const dir = opts.dir || DEFAULT_DIR
  for (const { abs } of listMetadataFiles(dir)) {
    try {
      const meta = JSON.parse(fs.readFileSync(abs, 'utf-8'))
      if (metadataMatchesImage(meta, reusedImagePath)) {
        return { meta, metaPath: abs }
      }
    } catch {
      // ignore unparseable / corrupted
    }
  }
  return null
}

export { DEFAULT_DIR as DEFAULT_METADATA_DIR, listMetadataFiles, metadataMatchesImage }