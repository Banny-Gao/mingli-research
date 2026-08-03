/**
 * scripts/lib/h3-api/client.js — H3 原生 HTTP 统一封装
 *
 * 短剧 skill 的全部 MiniMax 调用走原生 HTTP API(不依赖 mmx CLI,见 docs/adr/0001)。
 * 复用项目 scripts/lib/env.js 的 .env 加载与 image-gen 的调用风格。
 *
 * API key:LLM_API_KEY(MiniMax 与 Anthropic 共用,见 .env.example)
 * base URL:https://api.minimaxi.com/v1(图像/语音/音乐)/ v2(视频/H3)
 */

import { loadDotenvInto } from '../env.js'

// 自动加载项目根 .env(不覆盖已存在的环境变量)
const PROJECT_ROOT = new URL('../../..', import.meta.url).pathname
if (typeof process !== 'undefined') {
  const fs = await import('node:fs')
  const path = await import('node:path')
  const ENV_FILE = path.join(PROJECT_ROOT, '.env')
  if (fs.existsSync(ENV_FILE)) {
    loadDotenvInto(ENV_FILE, process.env)
  }
}

// 环境变量:LLM_API_KEY(通用,MiniMax/Anthropic 共用)+ MINIMAX_H3_API_KEY(H3 专用)
export function getApiKey() {
  const key = process.env.LLM_API_KEY
  if (!key) {
    throw new Error(
      '❌ 缺少 LLM_API_KEY 环境变量(MiniMax 与 Anthropic 共用)\n' +
        '   请设置:export LLM_API_KEY=sk-... (或项目 .env)'
    )
  }
  return key
}

/** H3 专用 API key(固定从 .env 读 MINIMAX_H3_API_KEY) */
export function getH3ApiKey() {
  const key = process.env.MINIMAX_H3_API_KEY
  if (!key) {
    throw new Error(
      '❌ 缺少 MINIMAX_H3_API_KEY 环境变量(H3 视频生成专用)\n' +
        '   请设置:export MINIMAX_H3_API_KEY=sk-... (或项目 .env)'
    )
  }
  return key
}

export const API_BASE_V1 = process.env.API_URL || 'https://api.minimaxi.com/v1'
export const API_BASE_V2 = process.env.API_V2_URL || 'https://api.minimaxi.com/v2'

/**
 * 通用 HTTP 调用(带重试)。
 * @param {string} baseUrl  base URL
 * @param {string} path     路径(如 /video_generation)
 * @param {object} opts     { method, body, apiKey, timeoutMs, retries, useH3Key }
 * @returns {Promise<object>} 解析后的 JSON
 */
export async function callApi(baseUrl, path, opts = {}) {
  const {
    method = 'POST',
    body,
    apiKey,
    timeoutMs = 120000,
    retries = 3,
    useH3Key = false,
  } = opts
  const key = apiKey || (useH3Key ? getH3ApiKey() : getApiKey())

  const url = `${baseUrl}${path}`
  let lastError

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timer)

      if (!res.ok) {
        // 429 限流可重试(退避),4xx 其他不重试(避免无效重试烧额度)
        if (res.status === 429 && attempt < retries) {
          const retryAfter = Number(res.headers.get('retry-after')) || 2000
          await new Promise((r) => setTimeout(r, retryAfter))
          continue
        }
        const errText = await res.text()
        const err = new Error(`HTTP ${res.status}: ${errText}`)
        err.status = res.status
        err.body = errText
        throw err
      }

      return await res.json()
    } catch (err) {
      clearTimeout(timer)
      lastError = err
      if (attempt < retries && isRetryable(err)) {
        const delay = 1000 * Math.pow(2, attempt)
        await new Promise((r) => setTimeout(r, delay))
      }
    }
  }
  throw lastError
}

/** 判断错误是否可重试(网络/5xx/超时) */
function isRetryable(err) {
  if (err.name === 'AbortError') return true
  if (err.status && err.status >= 500) return true
  if (err.status === 429) return true // 429 已在循环内处理,这里兜底
  return false
}
