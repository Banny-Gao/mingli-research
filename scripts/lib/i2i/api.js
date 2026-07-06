/**
 * scripts/lib/i2i/api.js — 图生图 校验 + 请求体构建 + API 调用
 *
 * 共用 t2i 的 callApi（endpoint 一样），但：
 *   - buildRequestBody 必须注入 subject_reference[]
 *   - validate 增加 --input-image 文件校验
 */

import {
  VALID_MODELS,
  VALID_ASPECT_RATIOS,
  VALID_STYLES,
  VALID_RESPONSE_FORMATS,
  IMAGE_DIMENSION,
  STYLE_WEIGHT_RANGE,
  N_RANGE,
  PROMPT_MAX_LENGTH,
  i2iConfig,
  VALID_SUBJECT_TYPES,
  SUBJECT_REFERENCE_DEFAULT_TYPE,
  I2I_ENDPOINT,
} from './constants.js'
import fs from 'node:fs'
import path from 'node:path'
import { resolveInputImage } from './input.js'
import { callApi as t2iCallApi } from '../t2i/api.js'

/**
 * 校验 opts（不 exit）。
 *
 * t2i 校验逻辑全部继承，再加：
 *   - --prompt 仍然必填
 *   - --input-image 必填（除 URL 模式可走校验）
 *   - subjectType 枚举校验
 */
export function validate(opts) {
  const errors = []

  if (!opts.prompt) {
    errors.push('❌ 缺少必填参数 --prompt')
  }
  if (opts.prompt && opts.prompt.length > PROMPT_MAX_LENGTH) {
    errors.push(`❌ prompt 长度 ${opts.prompt.length}，超过最大 ${PROMPT_MAX_LENGTH} 字符限制`)
  }
  if (opts.model && !VALID_MODELS.includes(opts.model)) {
    errors.push(`❌ 无效 model: "${opts.model}"，可选: ${VALID_MODELS.join(', ')}`)
  }
  if (opts.aspectRatio && !VALID_ASPECT_RATIOS.includes(opts.aspectRatio)) {
    errors.push(
      `❌ 无效 aspect-ratio: "${opts.aspectRatio}"，可选: ${VALID_ASPECT_RATIOS.join(', ')}`
    )
  }
  if (opts.style && !VALID_STYLES.includes(opts.style)) {
    errors.push(`❌ 无效 style: "${opts.style}"，可选: ${VALID_STYLES.join(', ')}`)
  }
  if (opts.responseFormat && !VALID_RESPONSE_FORMATS.includes(opts.responseFormat)) {
    errors.push(
      `❌ 无效 response-format: "${opts.responseFormat}"，可选: ${VALID_RESPONSE_FORMATS.join(', ')}`
    )
  }
  if (
    opts.n !== undefined &&
    (opts.n < N_RANGE.min || opts.n > N_RANGE.max || !Number.isInteger(opts.n))
  ) {
    errors.push(`❌ n 必须为 ${N_RANGE.min}-${N_RANGE.max} 的整数，当前值: ${opts.n}`)
  }
  if (
    opts.styleWeight !== undefined &&
    (opts.styleWeight <= STYLE_WEIGHT_RANGE.min || opts.styleWeight > STYLE_WEIGHT_RANGE.max)
  ) {
    errors.push(
      `❌ style-weight 必须在 (${STYLE_WEIGHT_RANGE.min}, ${STYLE_WEIGHT_RANGE.max}] 范围内，当前值: ${opts.styleWeight}`
    )
  }
  if (opts.style && opts.model !== 'image-01-live') {
    errors.push(
      `⚠️ style 参数仅在 model=image-01-live 时生效，当前 model: ${opts.model || 'image-01'}`
    )
  }
  if (
    opts.width !== undefined &&
    (opts.width < IMAGE_DIMENSION.min ||
      opts.width > IMAGE_DIMENSION.max ||
      opts.width % IMAGE_DIMENSION.step !== 0)
  ) {
    errors.push(
      `❌ width 必须在 [${IMAGE_DIMENSION.min}, ${IMAGE_DIMENSION.max}] 范围内且为 ${IMAGE_DIMENSION.step} 的倍数，当前值: ${opts.width}`
    )
  }
  if (
    opts.height !== undefined &&
    (opts.height < IMAGE_DIMENSION.min ||
      opts.height > IMAGE_DIMENSION.max ||
      opts.height % IMAGE_DIMENSION.step !== 0)
  ) {
    errors.push(
      `❌ height 必须在 [${IMAGE_DIMENSION.min}, ${IMAGE_DIMENSION.max}] 范围内且为 ${IMAGE_DIMENSION.step} 的倍数，当前值: ${opts.height}`
    )
  }
  if ((opts.width && !opts.height) || (!opts.width && opts.height)) {
    errors.push(`❌ width 和 height 必须同时设置`)
  }
  if (opts.width && opts.model === 'image-01-live') {
    errors.push(`⚠️ width/height 仅在 model=image-01 时可用，image-01-live 请使用 aspect-ratio`)
  }

  // ===== i2i 专属校验 =====
  // --input-image 与 --reuse-background 必有其一（normal vs reuse 路径）。
  const inputImage = opts.inputImage
  const isUrl = inputImage && /^https?:\/\//i.test(inputImage)
  const reuseBackground = opts.reuseBackground
  if (!inputImage && !reuseBackground) {
    errors.push('❌ 必须提供 --input-image 或 --reuse-background <path>')
  }
  if (inputImage && !isUrl) {
    try {
      resolveInputImage(inputImage)
    } catch (err) {
      errors.push(err.message)
    }
  }
  if (reuseBackground) {
    // 同步 dry-run 行为：路径不存在立即报错
    if (!fs.existsSync(reuseBackground)) {
      errors.push(`❌ --reuse-background 路径不存在: ${path.resolve(reuseBackground)}`)
    }
  }
  if (
    opts.subjectType &&
    !VALID_SUBJECT_TYPES.includes(opts.subjectType) &&
    process.env.I2I_ALLOW_UNKNOWN_SUBJECT_TYPE !== '1'
  ) {
    errors.push(
      `❌ 不支持的 subject-type: "${opts.subjectType}"（合法值: ${VALID_SUBJECT_TYPES.join(', ')}）。\n` +
        `   若服务端确实支持其他类型，请设置环境变量 I2I_ALLOW_UNKNOWN_SUBJECT_TYPE=1 跳过此校验。`
    )
  }

  return { valid: errors.length === 0, errors }
}

/**
 * 构建 MiniMax I2I API 请求体。
 *
 * 与 t2i 的关键差异：在 body 里加 subject_reference[]（每项 {type, image_file}）。
 *
 * opts.subjectReference 由调用方（i2i.js）用 makeSubjectReference(opts.inputImage, { subjectType })
 * 构造后传入；这样 caller 可以 cache resolved meta 供 metadata / reuseBackground 使用。
 */
export function buildRequestBody(opts) {
  const body = {
    model: opts.model || i2iConfig.model,
    prompt: opts.prompt,
  }

  if (opts.aspectRatio) body.aspect_ratio = opts.aspectRatio
  if (opts.n !== undefined) body.n = opts.n
  if (opts.responseFormat) body.response_format = opts.responseFormat
  if (opts.seed !== undefined) body.seed = opts.seed

  if (!opts.subjectReference) {
    throw new Error(
      `❌ buildRequestBody 调用方必须提供 opts.subjectReference（来自 makeSubjectReference）`
    )
  }
  body.subject_reference = [opts.subjectReference]

  // prompt_optimizer 决定逻辑（与 t2i 一致）
  const useTextOverlay = opts.textOverlay !== false
  const allowOptimizer = opts.allowPromptOptimizerWithTextOverlay === true
  if (useTextOverlay && !allowOptimizer) {
    body.prompt_optimizer = false
  } else if (opts.promptOptimizer !== undefined) {
    body.prompt_optimizer = opts.promptOptimizer
  }

  if (opts.aigcWatermark !== undefined) body.aigc_watermark = opts.aigcWatermark

  if (opts.width && opts.height) {
    body.width = opts.width
    body.height = opts.height
  }

  if (opts.style) {
    body.style = { style_type: opts.style }
    if (opts.styleWeight !== undefined) body.style.style_weight = opts.styleWeight
  }

  return body
}

// 复用 t2i 的 callApi（endpoint 已对齐；其余重试/超时/错误处理一致）
export const callApi = t2iCallApi

export { I2I_ENDPOINT, SUBJECT_REFERENCE_DEFAULT_TYPE }
