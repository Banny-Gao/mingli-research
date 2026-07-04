/**
 * scripts/lib/t2i/api.js — 校验 + 请求体构建 + API 调用（含重试/超时）
 */

import {
  T2I_ENDPOINT,
  VALID_MODELS,
  VALID_ASPECT_RATIOS,
  VALID_STYLES,
  VALID_RESPONSE_FORMATS,
  IMAGE_DIMENSION,
  STYLE_WEIGHT_RANGE,
  N_RANGE,
  PROMPT_MAX_LENGTH,
  t2iConfig,
} from './constants.js'

/**
 * 校验 opts，返回 { valid, errors }，不 exit。
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

  return { valid: errors.length === 0, errors }
}

/**
 * 构建 MiniMax T2I API 请求体。
 *
 * 副作用：当 textOverlay 启用（opts.textOverlay !== false）且用户未显式允许时，
 * 强制关闭 prompt_optimizer。理由：服务端改写不理解"已无字"上下文，
 * 可能重新引入文字/符号。要保留则传 opts.allowPromptOptimizerWithTextOverlay = true。
 */
export function buildRequestBody(opts) {
  const body = {
    model: opts.model || t2iConfig.model,
    prompt: opts.prompt,
  }

  if (opts.aspectRatio) body.aspect_ratio = opts.aspectRatio
  if (opts.n !== undefined) body.n = opts.n
  if (opts.responseFormat) body.response_format = opts.responseFormat
  if (opts.seed !== undefined) body.seed = opts.seed

  // prompt_optimizer 决定逻辑：
  // 1. text-overlay 启用 + 用户未允许 → 强制 false（即便用户传了 true）
  // 2. 用户显式传了 true/false → 尊重（但 case 1 拦截）
  // 3. 用户没传 → 不写入 body
  const useTextOverlay = opts.textOverlay !== false
  const allowOptimizer = opts.allowPromptOptimizerWithTextOverlay === true
  if (useTextOverlay && !allowOptimizer) {
    if (opts.promptOptimizer === true) {
      // 已经在 t2i.js 处打过 warning，这里直接静默改写
    }
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

/**
 * 判断错误是否可重试。
 *
 * AbortError 视为可重试 —— 我们用 AbortController 仅作为超时机制（api.js:172-173），
 * 没有任何手动 controller.abort() 调用，所以抛 AbortError 等价于"超时"。
 * 单次超时不代表服务故障，给一次重试机会。最大总耗时 ≈ timeout × (retries + 1)。
 */
function isRetryable(err) {
  if (err.name === 'AbortError') return true
  if (err.cause?.code === 'ECONNRESET') return true
  if (err.cause?.code === 'ETIMEDOUT') return true
  // HTTP 5xx
  if (err.status && err.status >= 500) return true
  return false
}

/**
 * 调用 MiniMax T2I API，含超时和指数退避重试。
 *
 * @param {string} apiKey
 * @param {object} requestBody
 * @param {{ timeout?: number, retries?: number, verbose?: boolean }} opts
 * @returns {Promise<object>} API 响应 JSON
 */
export async function callApi(apiKey, requestBody, opts = {}) {
  const timeout = opts.timeout ?? t2iConfig.timeoutMs
  const maxRetries = opts.retries ?? t2iConfig.retryMax
  const baseDelay = t2iConfig.retryBaseDelayMs
  const verbose = opts.verbose ?? false

  let lastError

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)

    try {
      if (verbose && attempt > 0) {
        console.error(`\n🔄 重试 ${attempt}/${maxRetries}...`)
      }
      if (verbose) {
        console.error(`📡 POST ${T2I_ENDPOINT}`)
        console.error(`   Body: ${JSON.stringify(requestBody).slice(0, 200)}...`)
      }

      const res = await fetch(T2I_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      })

      clearTimeout(timer)

      if (!res.ok) {
        const errBody = await res.text()
        const err = new Error(`HTTP ${res.status}: ${res.statusText}`)
        err.status = res.status
        err.body = errBody
        throw err
      }

      const data = await res.json()

      if (verbose) {
        const sc = data.base_resp?.status_code
        console.error(
          `   Response: status_code=${sc}, success_count=${data.metadata?.success_count || 0}`
        )
      }

      return data
    } catch (err) {
      clearTimeout(timer)
      lastError = err

      if (attempt < maxRetries && isRetryable(err)) {
        const delay = baseDelay * Math.pow(2, attempt)
        if (verbose) {
          console.error(`   ⚠️ 请求失败: ${err.message}，${delay}ms 后重试`)
        }
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }

      throw err
    }
  }

  throw lastError
}
