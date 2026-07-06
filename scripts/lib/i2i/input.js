/**
 * scripts/lib/i2i/input.js — 输入图校验 + subject_reference 构造
 *
 * 输入图接受：
 *   - 本地文件路径（默认走 base64）
 *   - HTTP(S) URL（直接转发）
 * 视 opts.useInputImageUrl 自动判断；也支持 --input-image-url <url> 强制 URL 模式。
 */

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import {
  INPUT_IMAGE_MAX_BYTES,
  INPUT_IMAGE_MIME_TYPES,
  VALID_SUBJECT_TYPES,
  SUBJECT_REFERENCE_DEFAULT_TYPE,
} from './constants.js'

const MIME_BY_EXT = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
}

const EXT_BY_MIME = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
}

/**
 * 判断字符串是否为 http(s) URL（最简单的实现）。
 */
export function isHttpUrl(s) {
  return typeof s === 'string' && /^https?:\/\//i.test(s)
}

/**
 * 根据文件扩展名推断 MIME；不支持的扩展抛错。
 */
function mimeFromPath(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  const mime = MIME_BY_EXT[ext]
  if (!mime) {
    throw new Error(
      `❌ 输入图格式不支持: "${ext}"（支持: .png .jpg .jpeg .webp）`
    )
  }
  return mime
}

/**
 * 校验输入图：文件存在、可读、大小、格式。返回 { absPath, mime, size, sha256 }。
 *
 * @param {string} userInput - 本地路径或 URL
 * @returns {{absPath: string, mime: string, size: number, sha256: string, isUrl: boolean}}
 */
export function resolveInputImage(userInput) {
  if (!userInput || typeof userInput !== 'string') {
    throw new Error(`❌ --input-image 不能为空`)
  }

  // URL 模式
  if (isHttpUrl(userInput)) {
    return {
      absPath: userInput,
      mime: null, // URL 模式无法提前推断 MIME，依赖服务端接受
      size: 0,
      sha256: '',
      isUrl: true,
    }
  }

  // 本地路径
  const absPath = path.resolve(userInput)
  if (!fs.existsSync(absPath)) {
    throw new Error(`❌ 输入图不存在: ${absPath}`)
  }
  const stat = fs.statSync(absPath)
  if (!stat.isFile()) {
    throw new Error(`❌ 输入图不是文件: ${absPath}`)
  }
  if (stat.size > INPUT_IMAGE_MAX_BYTES) {
    throw new Error(
      `❌ 输入图过大: ${(stat.size / 1024 / 1024).toFixed(2)}MB（上限 ${INPUT_IMAGE_MAX_BYTES / 1024 / 1024}MB）`
    )
  }
  const mime = mimeFromPath(absPath)
  if (!INPUT_IMAGE_MIME_TYPES.has(mime)) {
    throw new Error(`❌ 输入图 MIME 不支持: ${mime}`)
  }

  const buf = fs.readFileSync(absPath)
  const sha256 = crypto.createHash('sha256').update(buf).digest('hex')

  return { absPath, mime, size: stat.size, sha256, isUrl: false }
}

/**
 * 构造 subject_reference 项。
 *
 * 输出形状（与 i2i 文档示例一致）：
 *   { type: "character", image_file: "<url>" | "<raw base64, no data: prefix>" }
 *
 * @param {{absPath: string, mime: string, isUrl: boolean}} resolved
 * @param {{subjectType?: string, useInputImageUrl?: boolean}} opts
 * @returns {{type: string, image_file: string}}
 */
export function buildSubjectReference(resolved, opts = {}) {
  const type = opts.subjectType || SUBJECT_REFERENCE_DEFAULT_TYPE
  if (!VALID_SUBJECT_TYPES.includes(type)) {
    // 不是 VALID_SUBJECT_TYPES 里的值也允许通过（文档未穷举），但给 warning
    // 这里只做白名单校验：未列出的类型直接拒绝，强制用户显式扩展
    if (process.env.I2I_ALLOW_UNKNOWN_SUBJECT_TYPE === '1') {
      console.warn(`⚠️ subject_type "${type}" 不在枚举内，已强制通过（I2I_ALLOW_UNKNOWN_SUBJECT_TYPE=1）`)
    } else {
      throw new Error(
        `❌ 不支持的 subject_type: "${type}"（合法值: ${VALID_SUBJECT_TYPES.join(', ')}）。\n` +
          `   若服务端确实支持其他类型，请设置环境变量 I2I_ALLOW_UNKNOWN_SUBJECT_TYPE=1 跳过此校验。`
      )
    }
  }

  let image_file
  if (resolved.isUrl || opts.useInputImageUrl) {
    image_file = resolved.absPath
  } else {
    // data URI 模式：服务端接受 `data:<mime>;base64,<raw>`（探针验证：raw base64 不带前缀会被
    // 当 URL 去 fetch，被拒为 "localhost or private address"）。
    const buf = fs.readFileSync(resolved.absPath)
    image_file = `data:${resolved.mime};base64,${buf.toString('base64')}`
  }

  return { type, image_file }
}

/**
 * 把路径 / URL 变成 subject_reference；纯便利函数包装。
 */
export function makeSubjectReference(userInput, opts = {}) {
  const resolved = resolveInputImage(userInput)
  const ref = buildSubjectReference(resolved, opts)
  return { ref, meta: resolved }
}

export { EXT_BY_MIME }
