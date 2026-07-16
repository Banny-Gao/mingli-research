/**
 * scripts/lib/llm-client.js — 通用 Anthropic LLM 调用客户端
 *
 * 统一 Anthropic API 调用 + 重试逻辑 + thinking 截断自动续轮。
 * 消费者：llm-batch.js / text-overlay.js / 其他需要调 LLM 的模块。
 */

import Anthropic from '@anthropic-ai/sdk'
import { llmConfig } from './env.js'

const MAX_RETRIES = 3
const MAX_CONTINUATIONS = 3 // thinking 截断时最多续轮次数（不含首轮）
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
 * 单次调用 Messages API，含 429/5xx 指数退避重试。
 * 不做文本过滤/续轮，返回原始 response。
 *
 * @param {Anthropic} client
 * @param {object} params 传给 client.messages.create 的参数
 * @param {{ signal?: AbortSignal, retryBaseMs?: number }} [opts]
 * @returns {Promise<object>} 原始 API 响应
 */
async function callOnce(client, params, { signal, retryBaseMs = DEFAULT_RETRY_BASE_MS } = {}) {
  let lastErr
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    if (signal?.aborted) throw new Error('Aborted')
    try {
      return await client.messages.create(params)
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

/**
 * 从响应中拼接所有 text 块内容。
 * @param {object} response
 * @returns {string}
 */
function extractText(response) {
  return response.content
    .filter(c => c.type === 'text' && typeof c.text === 'string')
    .map(c => c.text)
    .join('')
}

/**
 * 返回响应中所有块的 type 列表（逗号拼接），用于错误信息。
 * @param {object} response
 * @returns {string}
 */
function blockTypesOf(response) {
  return response.content.map(c => c.type).join(',')
}

/**
 * 调 Anthropic Messages API，含指数退避重试（429/5xx）与 thinking 截断自动续轮。
 *
 * 当 stop_reason === 'max_tokens'（常见于 adaptive thinking 用完预算）时，
 * 会把 assistant 已输出的完整 content（含 thinking 块及其 signature）作为
 * 上下文回灌，并追加 '请继续。' 用户消息，最多续轮 MAX_CONTINUATIONS 次，
 * 跨轮拼接文本。
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
 * @returns {Promise<string>} 响应文本（跨轮拼接）
 */
export async function callLLM(client, opts = {}) {
  const {
    model = llmConfig.model,
    system,
    messages,
    maxTokens = 12800,
    signal,
    retryBaseMs = DEFAULT_RETRY_BASE_MS,
    extendedThinking = false,
  } = opts

  const baseParams = { model, max_tokens: maxTokens, system }
  // thinking 仅 Claude/MiniMax 推理模型支持，默认关闭
  if (extendedThinking) {
    baseParams.thinking = { type: 'adaptive' }
  }

  const workingMessages = [...messages]
  let allText = ''
  let continuations = 0

  while (true) {
    if (signal?.aborted) throw new Error('Aborted')
    const params = { ...baseParams, messages: workingMessages }
    const response = await callOnce(client, params, { signal, retryBaseMs })
    const textThisRound = extractText(response)
    if (textThisRound) allText += textThisRound
    const truncated = response.stop_reason === 'max_tokens'
    if (truncated && continuations < MAX_CONTINUATIONS) {
      // 回灌 assistant 完整 content（含 thinking+signature 与已产出的部分 text）
      workingMessages.push({ role: 'assistant', content: response.content })
      workingMessages.push({ role: 'user', content: '请继续。' })
      continuations++
      continue
    }
    if (allText) return allText
    // LLM 全程只返回了 thinking 块或空响应，抛错让上层走 fallback
    throw new Error(`LLM 未返回文本内容 (content blocks: [${blockTypesOf(response)}])`)
  }
}
