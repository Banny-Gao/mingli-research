/**
 * scripts/lib/llm-client.js — 通用 Anthropic LLM 调用客户端
 *
 * 统一 Anthropic API 调用 + 重试逻辑 + thinking 截断自动续轮。
 * 消费者：llm-batch.js / text-overlay.js / 其他需要调 LLM 的模块。
 */

import Anthropic from '@anthropic-ai/sdk'
import { llmConfig } from './env.js'

const MAX_RETRIES = 3
const MAX_CONTINUATIONS = 5 // thinking 截断时最多续轮次数（不含首轮）
const DEFAULT_RETRY_BASE_MS = 2000
const TICK_INTERVAL_MS = 3000 // 流式心跳节流：单篇生成期间每 3s 回调一次进度

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
 * 单次调用 Messages API（流式），含 429/5xx 指数退避重试。
 * 不做文本过滤/续轮，返回原始 final message。
 *
 * 流式而非非流式：max_tokens > ~16K 或开启 adaptive thinking 时，单次调用可能超 10 分钟，
 * SDK 非流式会抛 "Streaming is required for operations that may take longer than 10 minutes"。
 * 流式只改传输方式，finalMessage() 返回与非流式 create 等价的 message 对象。
 *
 * @param {Anthropic} client
 * @param {object} params 传给 client.messages.stream 的参数
 * @param {{ signal?: AbortSignal, retryBaseMs?: number, onStreamTick?: (t: {chars: number, phase: 'thinking'|'text'}) => void }} [opts]
 *   onStreamTick: 流式心跳回调，每 TICK_INTERVAL_MS 调用一次（节流），让上层在单篇长任务期间打进度。
 * @returns {Promise<object>} 原始 final message（含 content + stop_reason）
 */
async function callOnce(client, params, { signal, retryBaseMs = DEFAULT_RETRY_BASE_MS, onStreamTick } = {}) {
  let lastErr
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    if (signal?.aborted) throw new Error('Aborted')
    try {
      const stream = await client.messages.stream(params)
      // 流式心跳：监听 text/thinking 增量，节流回调已产出字符数 + 当前阶段
      if (onStreamTick) {
        let chars = 0
        let phase = 'thinking'
        let lastTick = 0
        const maybeTick = (force = false) => {
          const now = Date.now()
          if (force || now - lastTick >= TICK_INTERVAL_MS) {
            lastTick = now
            onStreamTick({ chars, phase })
          }
        }
        stream.on('text', (delta, snap) => { chars = snap.length; phase = 'text'; maybeTick() })
        stream.on('thinking', (delta, snap) => { chars = snap.length; phase = 'thinking'; maybeTick() })
      }
      const message = await stream.finalMessage()
      return message
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
 * 上下文回灌，并追加一条用户消息，最多续轮 MAX_CONTINUATIONS 次，
 * 跨轮拼接文本。续轮消息内容默认为「请继续。」，可由调用方通过 continuePrompt
 * 覆盖（如批量解读续轮时附带 source 二级标题清单作为覆盖锚点）。
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
 *   continuePrompt?: string,  // 续轮时追加的用户消息内容（默认「请继续。」）
 *   onStreamTick?: (t: {chars: number, phase: 'thinking'|'text'}) => void,  // 流式心跳（单篇长任务进度）
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
    continuePrompt = '请继续。',
    onStreamTick,
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
    const response = await callOnce(client, params, { signal, retryBaseMs, onStreamTick })
    const textThisRound = extractText(response)
    if (textThisRound) allText += textThisRound
    const truncated = response.stop_reason === 'max_tokens'
    if (truncated && continuations < MAX_CONTINUATIONS) {
      // 回灌 assistant 完整 content（含 thinking+signature 与已产出的部分 text）
      workingMessages.push({ role: 'assistant', content: response.content })
      workingMessages.push({ role: 'user', content: continuePrompt })
      continuations++
      continue
    }
    if (allText) return allText
    // LLM 全程只返回了 thinking 块或空响应，抛错让上层走 fallback
    throw new Error(`LLM 未返回文本内容 (content blocks: [${blockTypesOf(response)}])`)
  }
}
