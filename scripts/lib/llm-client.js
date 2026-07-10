/**
 * scripts/lib/llm-client.js — 通用 Anthropic LLM 调用客户端
 *
 * 统一 Anthropic API 调用 + 重试逻辑。
 * 消费者：llm-batch.js / text-overlay.js / 其他需要调 LLM 的模块。
 */

import Anthropic from '@anthropic-ai/sdk'
import { llmConfig } from './env.js'

const MAX_RETRIES = 3
const DEFAULT_RETRY_BASE_MS = 2000

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

/**
 * 创建 Anthropic 客户端。
 * @param {{ apiKey: string, baseUrl?: string }} config
 */
export function createLLMClient(config) {
  return new Anthropic({
    apiKey: config.apiKey,
    baseURL: config.baseUrl || llmConfig.baseUrl,
  })
}

/**
 * 调 Anthropic Messages API，含指数退避重试（429/5xx）。
 *
 * @param {Anthropic} client
 * @param {{
 *   model?: string,
 *   system: string,
 *   messages: Array<{role: string, content: string}>,
 *   maxTokens?: number,
 *   signal?: AbortSignal,
 *   retryBaseMs?: number,
 *   extendedThinking?: boolean,
 * }} opts
 * @returns {Promise<string>} 响应文本
 */
export async function callLLM(client, opts = {}) {
  const {
    model = llmConfig.model,
    system,
    messages,
    maxTokens = 4096,
    signal,
    retryBaseMs = DEFAULT_RETRY_BASE_MS,
    extendedThinking = false,
  } = opts

  let lastErr
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    if (signal?.aborted) throw new Error('Aborted')
    try {
      const params = {
        model,
        max_tokens: maxTokens,
        system,
        messages,
      }
      // thinking 仅 Claude 模型支持，默认关闭
      if (extendedThinking) {
        params.thinking = { type: 'adaptive' }
      }
      const response = await client.messages.create(params)
      // 过滤 thinking 块，拼接所有 text 块的内容
      const text = response.content
        .filter(c => c.type === 'text' && typeof c.text === 'string')
        .map(c => c.text)
        .join('')
      if (!text) {
        // LLM 只返回了 thinking 块或空响应，抛错让上层走 fallback
        const blockTypes = response.content.map(c => c.type).join(',')
        throw new Error(`LLM 未返回文本内容 (content blocks: [${blockTypes}])`)
      }
      return text
    } catch (err) {
      lastErr = err
      if (err.status === 429 || err.status >= 500) {
        const wait = retryBaseMs * Math.pow(2, attempt - 1) + Math.random() * 1000
        await sleep(wait)
        continue
      }
      throw err
    }
  }
  throw lastErr
}
